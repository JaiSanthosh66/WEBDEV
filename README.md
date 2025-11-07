# Online Bookstore

A full-stack online bookstore application built with Node.js, Express, MongoDB, and vanilla JavaScript.

## Features

- **Product Listing**: Browse books with categories and filters
- **Search & Filter**: Search by title/author, filter by category, price range, and sort options
- **User Authentication**: Register and login functionality with JWT tokens
- **Shopping Cart**: Add, update, and remove items from cart
- **Checkout**: Complete orders with shipping address
- **Order History**: View all past orders with details
- **Modern UI**: Responsive design with beautiful, modern interface

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling
- **Vanilla JavaScript** - Client-side logic

## Project Structure

```
WEBTEC/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Book.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── books.js
│   │   ├── cart.js
│   │   └── orders.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── seed.js
├── WEBTEC/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── package.json
├── .env.example
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd WEBTEC
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - A secret key for JWT tokens
   - `PORT` - Server port (default: 3000)

4. **Start MongoDB**
   - If using local MongoDB: Make sure MongoDB service is running
   - If using MongoDB Atlas: Use your connection string in `.env`

5. **Seed the database** (optional - adds sample books)
   ```bash
   node backend/seed.js
   ```

6. **Start the backend server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

7. **Open the frontend**
   - Open `WEBTEC/index.html` in your browser
   - Or use a local server (e.g., Live Server extension in VS Code)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Books
- `GET /api/books` - Get all books (supports query params: category, search, minPrice, maxPrice, sortBy)
- `GET /api/books/:id` - Get book by ID
- `GET /api/books/categories/list` - Get all categories

### Cart
- `GET /api/cart` - Get user's cart (requires auth)
- `POST /api/cart/add` - Add item to cart (requires auth)
- `PUT /api/cart/update/:itemId` - Update item quantity (requires auth)
- `DELETE /api/cart/remove/:itemId` - Remove item from cart (requires auth)
- `DELETE /api/cart/clear` - Clear cart (requires auth)

### Orders
- `GET /api/orders` - Get user's orders (requires auth)
- `GET /api/orders/:id` - Get order by ID (requires auth)
- `POST /api/orders/checkout` - Create order from cart (requires auth)

## Database Models

### User
- username, email, password (hashed)
- timestamps

### Book
- title, author, isbn, category, price, description, image, inventory, rating, reviews
- timestamps

### Cart
- user (reference), items (array of book references with quantity)
- timestamps

### Order
- user (reference), items (with book details), totalAmount, status, shippingAddress
- timestamps

## Usage

1. **Browse Books**: Navigate through the home page to see all available books
2. **Search & Filter**: Use the search bar and filters to find specific books
3. **Register/Login**: Create an account or login to add items to cart
4. **Add to Cart**: Click "Add to Cart" on any book
5. **View Cart**: Click the cart icon to view and manage cart items
6. **Checkout**: Fill in shipping details and place your order
7. **View Orders**: Check your order history in the Orders section

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon to automatically restart the server on file changes.

### Adding Sample Data

Run the seed script to populate the database with sample books:

```bash
node backend/seed.js
```

## Notes

- The frontend expects the backend to run on `http://localhost:3000`
- Update `API_BASE` in `app.js` if using a different port or domain
- JWT tokens are stored in localStorage
- Passwords are hashed using bcryptjs
- Cart and orders are user-specific (require authentication)

## License

ISC

