const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.book')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
      .populate('items.book');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create order (checkout)
router.post('/checkout', auth, async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate inventory and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const book = await Book.findById(item.book._id);
      
      if (!book) {
        return res.status(404).json({ message: `Book ${item.book.title} not found` });
      }

      if (book.inventory < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient inventory for ${book.title}` 
        });
      }

      const itemTotal = book.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        book: book._id,
        title: book.title,
        author: book.author,
        price: book.price,
        quantity: item.quantity
      });

      // Update inventory
      book.inventory -= item.quantity;
      await book.save();
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress: shippingAddress || {}
    });

    await order.save();

    // Clear cart
    cart.items = [];
    await cart.save();

    await order.populate('items.book');

    res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

