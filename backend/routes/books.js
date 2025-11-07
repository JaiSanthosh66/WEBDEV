const express = require('express');
const Book = require('../models/Book');

const router = express.Router();

// Get all books with filters
router.get('/', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sortBy = 'title' } = req.query;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sort = {};
    if (sortBy === 'price-low') sort = { price: 1 };
    else if (sortBy === 'price-high') sort = { price: -1 };
    else if (sortBy === 'rating') sort = { rating: -1 };
    else sort = { title: 1 };

    const books = await Book.find(query).sort(sort);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get categories (for filter dropdown)
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Book.distinct('category');
    res.json(['All', ...categories]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

