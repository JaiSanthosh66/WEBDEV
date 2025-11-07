// API Configuration
const API_BASE = 'http://localhost:3000/api';

// State Management
let state = {
  user: null,
  token: localStorage.getItem('token'),
  currentView: 'home',
  books: [],
  cart: null,
  orders: [],
  filters: {
    category: 'All',
    search: '',
    sortBy: 'title',
    minPrice: '',
    maxPrice: ''
  }
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

async function initializeApp() {
  setupEventListeners();
  
  if (state.token) {
    await loadUser();
    await loadCart();
  }
  
  await loadCategories();
  await loadBooks();
}

// Event Listeners
function setupEventListeners() {
  // Navigation
  document.getElementById('home-btn').addEventListener('click', () => showView('home'));
  document.getElementById('cart-btn').addEventListener('click', () => showView('cart'));
  document.getElementById('orders-btn').addEventListener('click', () => showView('orders'));
  
  // Auth
  document.getElementById('login-btn').addEventListener('click', () => openAuthModal('login'));
  document.getElementById('register-btn').addEventListener('click', () => openAuthModal('register'));
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('auth-form').addEventListener('submit', handleAuth);
  document.getElementById('switch-auth').addEventListener('click', toggleAuthMode);
  document.getElementById('close-modal').addEventListener('click', closeAuthModal);
  
  // Filters
  document.getElementById('search-btn').addEventListener('click', applyFilters);
  document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') applyFilters();
  });
  document.getElementById('category-filter').addEventListener('change', applyFilters);
  document.getElementById('sort-filter').addEventListener('change', applyFilters);
  document.getElementById('apply-price-filter').addEventListener('click', applyFilters);
  
  // Checkout
  document.getElementById('checkout-btn').addEventListener('click', openCheckoutModal);
  document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
  document.getElementById('close-checkout').addEventListener('click', closeCheckoutModal);
  
  // Book details modal
  document.getElementById('close-book-details').addEventListener('click', closeBookDetailsModal);
  document.getElementById('book-detail-add-cart').addEventListener('click', handleBookDetailAddCart);
  
  // Close modal when clicking outside
  document.getElementById('book-details-modal').addEventListener('click', (e) => {
    if (e.target.id === 'book-details-modal') {
      closeBookDetailsModal();
    }
  });
}

// View Management
function showView(viewName) {
  state.currentView = viewName;
  
  document.getElementById('home-view').classList.toggle('hidden', viewName !== 'home');
  document.getElementById('cart-view').classList.toggle('hidden', viewName !== 'cart');
  document.getElementById('orders-view').classList.toggle('hidden', viewName !== 'orders');
  
  if (viewName === 'cart') {
    loadCartView();
  } else if (viewName === 'orders') {
    loadOrdersView();
  }
}

// Auth Functions
let isRegisterMode = false;

function openAuthModal(mode) {
  isRegisterMode = mode === 'register';
  const modal = document.getElementById('auth-modal');
  const title = document.getElementById('modal-title');
  const submitBtn = document.getElementById('auth-submit');
  const switchText = document.getElementById('switch-text');
  const switchBtn = document.getElementById('switch-auth');
  const usernameField = document.getElementById('username-field');
  
  modal.classList.remove('hidden');
  title.textContent = isRegisterMode ? 'Register' : 'Login';
  submitBtn.textContent = isRegisterMode ? 'Register' : 'Login';
  switchText.textContent = isRegisterMode ? 'Already have an account?' : "Don't have an account?";
  switchBtn.textContent = isRegisterMode ? 'Login' : 'Register';
  usernameField.classList.toggle('hidden', !isRegisterMode);
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
  document.getElementById('auth-form').reset();
}

function toggleAuthMode() {
  openAuthModal(isRegisterMode ? 'login' : 'register');
}

async function handleAuth(e) {
  e.preventDefault();
  
  const email = document.getElementById('email-input').value;
  const password = document.getElementById('password-input').value;
  const username = document.getElementById('username-input').value;
  
  const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
  const payload = isRegisterMode ? { username, email, password } : { email, password };
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      state.token = data.token;
      state.user = data.user;
      localStorage.setItem('token', data.token);
      updateAuthUI();
      closeAuthModal();
      await loadCart();
      showNotification(isRegisterMode ? 'Registration successful!' : 'Login successful!');
    } else {
      showNotification(data.message || 'Authentication failed', 'error');
    }
  } catch (error) {
    showNotification('Network error. Please try again.', 'error');
  }
}

async function loadUser() {
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      state.user = data.user;
      updateAuthUI();
    } else {
      logout();
    }
  } catch (error) {
    console.error('Error loading user:', error);
  }
}

function logout() {
  state.token = null;
  state.user = null;
  state.cart = null;
  localStorage.removeItem('token');
  updateAuthUI();
  showView('home');
  showNotification('Logged out successfully');
}

function updateAuthUI() {
  const authButtons = document.getElementById('auth-buttons');
  const userInfo = document.getElementById('user-info');
  const usernameDisplay = document.getElementById('username-display');
  
  if (state.user) {
    authButtons.classList.add('hidden');
    userInfo.classList.remove('hidden');
    usernameDisplay.textContent = state.user.username;
  } else {
    authButtons.classList.remove('hidden');
    userInfo.classList.add('hidden');
  }
}

// Books Functions
async function loadCategories() {
  try {
    const response = await fetch(`${API_BASE}/books/categories/list`);
    const categories = await response.json();
    
    const select = document.getElementById('category-filter');
    select.innerHTML = categories.map(cat => 
      `<option value="${cat}">${cat}</option>`
    ).join('');
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

async function loadBooks() {
  const loading = document.getElementById('loading');
  const emptyState = document.getElementById('empty-state');
  const grid = document.getElementById('books-grid');
  
  loading.classList.remove('hidden');
  grid.innerHTML = '';
  
  try {
    const params = new URLSearchParams();
    if (state.filters.category !== 'All') params.append('category', state.filters.category);
    if (state.filters.search) params.append('search', state.filters.search);
    if (state.filters.minPrice) params.append('minPrice', state.filters.minPrice);
    if (state.filters.maxPrice) params.append('maxPrice', state.filters.maxPrice);
    params.append('sortBy', state.filters.sortBy);
    
    const response = await fetch(`${API_BASE}/books?${params}`);
    const books = await response.json();
    
    state.books = books;
    
    if (books.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      books.forEach(book => {
        grid.appendChild(createBookCard(book));
      });
    }
  } catch (error) {
    showNotification('Error loading books', 'error');
  } finally {
    loading.classList.add('hidden');
  }
}

function createBookPlaceholder(title, author) {
  // Create a nice placeholder URL with book title
  const encodedTitle = encodeURIComponent(title.substring(0, 30));
  const encodedAuthor = encodeURIComponent(author.substring(0, 20));
  return `https://via.placeholder.com/300x400/2563eb/ffffff?text=${encodedTitle}+by+${encodedAuthor}`;
}

function createBookCard(book) {
  const card = document.createElement('div');
  card.className = 'book-card';
  card.style.cursor = 'pointer';
  card.addEventListener('click', (e) => {
    // Don't open modal if clicking the button
    if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
      showBookDetails(book);
    }
  });
  
  const placeholderUrl = createBookPlaceholder(book.title, book.author);
  const img = document.createElement('img');
  img.className = 'book-image';
  img.alt = book.title;
  img.src = book.image || placeholderUrl;
  img.onerror = function() {
    // Try Open Library with ISBN if available
    if (book.isbn) {
      const isbnClean = book.isbn.replace(/-/g, '');
      this.src = `https://covers.openlibrary.org/b/isbn/${isbnClean}-L.jpg`;
      this.onerror = function() {
        // Fallback to placeholder
        this.src = placeholderUrl;
      };
    } else {
      this.src = placeholderUrl;
    }
  };
  
  card.appendChild(img);
  
  const infoDiv = document.createElement('div');
  infoDiv.className = 'book-info';
  infoDiv.innerHTML = `
    <h3 class="book-title">${book.title}</h3>
    <p class="book-author">by ${book.author}</p>
    <span class="book-category">${book.category}</span>
    <div class="book-footer">
      <div>
        <div class="book-price">$${book.price.toFixed(2)}</div>
        <div class="book-rating">
          ⭐ ${book.rating.toFixed(1)} (${book.reviews} reviews)
        </div>
      </div>
      <button class="btn btn-primary" onclick="event.stopPropagation(); addToCart('${book._id}')">Add to Cart</button>
    </div>
  `;
  card.appendChild(infoDiv);
  
  return card;
}

function applyFilters() {
  state.filters.search = document.getElementById('search-input').value;
  state.filters.category = document.getElementById('category-filter').value;
  state.filters.sortBy = document.getElementById('sort-filter').value;
  state.filters.minPrice = document.getElementById('min-price').value;
  state.filters.maxPrice = document.getElementById('max-price').value;
  
  loadBooks();
}

// Cart Functions
async function addToCart(bookId) {
  if (!state.token) {
    openAuthModal('login');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ bookId, quantity: 1 })
    });
    
    if (response.ok) {
      await loadCart();
      showNotification('Book added to cart!');
    } else {
      const data = await response.json();
      showNotification(data.message || 'Error adding to cart', 'error');
    }
  } catch (error) {
    showNotification('Network error', 'error');
  }
}

async function loadCart() {
  if (!state.token) return;
  
  try {
    const response = await fetch(`${API_BASE}/cart`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    
    if (response.ok) {
      state.cart = await response.json();
      updateCartCount();
    }
  } catch (error) {
    console.error('Error loading cart:', error);
  }
}

function updateCartCount() {
  const count = state.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  document.getElementById('cart-count').textContent = count;
}

async function loadCartView() {
  const container = document.getElementById('cart-items');
  const emptyCart = document.getElementById('empty-cart');
  const summary = document.querySelector('.cart-summary');
  
  if (!state.token) {
    container.innerHTML = '<p>Please login to view your cart.</p>';
    return;
  }
  
  await loadCart();
  
  if (!state.cart || !state.cart.items || state.cart.items.length === 0) {
    container.innerHTML = '';
    emptyCart.classList.remove('hidden');
    summary.classList.add('hidden');
    return;
  }
  
  emptyCart.classList.add('hidden');
  summary.classList.remove('hidden');
  
  container.innerHTML = state.cart.items.map((item, index) => {
    const book = item.book;
    const total = book.price * item.quantity;
    return `
      <div class="cart-item">
        <img src="${book.image}" alt="${book.title}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/300x400?text=Book+Cover'">
        <div class="cart-item-details">
          <h3 class="cart-item-title">${book.title}</h3>
          <p class="cart-item-author">by ${book.author}</p>
          <div class="cart-item-controls">
            <div class="quantity-control">
              <button class="quantity-btn" onclick="updateCartItem('${item._id}', ${item.quantity - 1})">-</button>
              <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                     onchange="updateCartItem('${item._id}', parseInt(this.value))">
              <button class="quantity-btn" onclick="updateCartItem('${item._id}', ${item.quantity + 1})">+</button>
            </div>
            <div class="cart-item-price">$${total.toFixed(2)}</div>
            <button class="remove-item" onclick="removeCartItem('${item._id}')">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  const total = state.cart.items.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
  document.getElementById('cart-total').textContent = total.toFixed(2);
}

async function updateCartItem(itemId, quantity) {
  if (quantity < 1) {
    removeCartItem(itemId);
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/cart/update/${itemId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ quantity })
    });
    
    if (response.ok) {
      await loadCart();
      loadCartView();
    } else {
      const data = await response.json();
      showNotification(data.message || 'Error updating cart', 'error');
    }
  } catch (error) {
    showNotification('Network error', 'error');
  }
}

async function removeCartItem(itemId) {
  try {
    const response = await fetch(`${API_BASE}/cart/remove/${itemId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    
    if (response.ok) {
      await loadCart();
      loadCartView();
      showNotification('Item removed from cart');
    }
  } catch (error) {
    showNotification('Error removing item', 'error');
  }
}

// Checkout Functions
function openCheckoutModal() {
  if (!state.token) {
    openAuthModal('login');
    return;
  }
  
  const total = state.cart?.items?.reduce((sum, item) => sum + (item.book.price * item.quantity), 0) || 0;
  document.getElementById('checkout-total').textContent = total.toFixed(2);
  document.getElementById('checkout-modal').classList.remove('hidden');
}

function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.add('hidden');
  document.getElementById('checkout-form').reset();
}

async function handleCheckout(e) {
  e.preventDefault();
  
  const shippingAddress = {
    street: document.getElementById('street-input').value,
    city: document.getElementById('city-input').value,
    state: document.getElementById('state-input').value,
    zipCode: document.getElementById('zip-input').value,
    country: document.getElementById('country-input').value
  };
  
  try {
    const response = await fetch(`${API_BASE}/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify({ shippingAddress })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      closeCheckoutModal();
      await loadCart();
      showView('orders');
      await loadOrdersView();
      showNotification('Order placed successfully!');
    } else {
      showNotification(data.message || 'Error placing order', 'error');
    }
  } catch (error) {
    showNotification('Network error', 'error');
  }
}

// Orders Functions
async function loadOrdersView() {
  const container = document.getElementById('orders-list');
  const emptyOrders = document.getElementById('empty-orders');
  
  if (!state.token) {
    container.innerHTML = '<p>Please login to view your orders.</p>';
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/orders`, {
      headers: { 'Authorization': `Bearer ${state.token}` }
    });
    
    if (response.ok) {
      const orders = await response.json();
      
      if (orders.length === 0) {
        container.innerHTML = '';
        emptyOrders.classList.remove('hidden');
      } else {
        emptyOrders.classList.add('hidden');
        container.innerHTML = orders.map(order => {
          const date = new Date(order.createdAt).toLocaleDateString();
          return `
            <div class="order-card">
              <div class="order-header">
                <div>
                  <div class="order-id">Order #${order._id.slice(-8)}</div>
                  <div class="order-date">${date}</div>
                </div>
                <span class="order-status ${order.status}">${order.status}</span>
              </div>
              <div class="order-items">
                ${order.items.map(item => `
                  <div class="order-item">
                    <div>
                      <strong>${item.title}</strong> by ${item.author}
                      <div>Quantity: ${item.quantity}</div>
                    </div>
                    <div>$${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                `).join('')}
              </div>
              <div class="order-total">Total: $${order.totalAmount.toFixed(2)}</div>
            </div>
          `;
        }).join('');
      }
    }
  } catch (error) {
    showNotification('Error loading orders', 'error');
  }
}

// Book Details Functions
function showBookDetails(book) {
  const modal = document.getElementById('book-details-modal');
  const stars = '⭐'.repeat(Math.floor(book.rating)) + (book.rating % 1 >= 0.5 ? '⭐' : '');
  
  const detailImage = document.getElementById('book-detail-image');
  const placeholderUrl = createBookPlaceholder(book.title, book.author);
  
  // Set up image with fallback
  detailImage.src = book.image || placeholderUrl;
  detailImage.onerror = function() {
    // Try Open Library with ISBN if available
    if (book.isbn) {
      const isbnClean = book.isbn.replace(/-/g, '');
      this.src = `https://covers.openlibrary.org/b/isbn/${isbnClean}-L.jpg`;
      this.onerror = function() {
        this.src = placeholderUrl;
      };
    } else {
      this.src = placeholderUrl;
    }
  };
  
  document.getElementById('book-detail-title').textContent = book.title;
  document.getElementById('book-detail-author').textContent = `by ${book.author}`;
  document.getElementById('book-detail-category').textContent = book.category;
  document.getElementById('book-detail-isbn').textContent = book.isbn ? `ISBN: ${book.isbn}` : '';
  document.getElementById('book-detail-rating').textContent = stars || 'No rating';
  document.getElementById('book-detail-rating-text').textContent = `${book.rating.toFixed(1)} (${book.reviews} reviews)`;
  document.getElementById('book-detail-inventory').textContent = book.inventory > 0 
    ? `In Stock: ${book.inventory} available` 
    : 'Out of Stock';
  document.getElementById('book-detail-inventory').className = book.inventory > 0 
    ? 'book-detail-inventory in-stock' 
    : 'book-detail-inventory out-of-stock';
  document.getElementById('book-detail-price').textContent = `$${book.price.toFixed(2)}`;
  document.getElementById('book-detail-description').textContent = book.description || 'No description available.';
  document.getElementById('book-detail-add-cart').dataset.bookId = book._id;
  document.getElementById('book-detail-add-cart').disabled = book.inventory === 0;
  
  if (book.inventory === 0) {
    document.getElementById('book-detail-add-cart').textContent = 'Out of Stock';
    document.getElementById('book-detail-add-cart').classList.add('disabled');
  } else {
    document.getElementById('book-detail-add-cart').textContent = 'Add to Cart';
    document.getElementById('book-detail-add-cart').classList.remove('disabled');
  }
  
  modal.classList.remove('hidden');
}

function closeBookDetailsModal() {
  document.getElementById('book-details-modal').classList.add('hidden');
}

function handleBookDetailAddCart() {
  const bookId = document.getElementById('book-detail-add-cart').dataset.bookId;
  if (bookId) {
    addToCart(bookId);
    closeBookDetailsModal();
  }
}

// Utility Functions
function showNotification(message, type = 'success') {
  // Simple notification - can be enhanced with a proper notification library
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#ef4444' : '#10b981'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 6px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

