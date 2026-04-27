# Full-Stack Hands-On Exercises

Complete these practical projects to master full-stack development for interviews.

---

## Exercise 1: Build Complete Authentication System (Easy → Medium)

**Duration:** 3-4 hours

**Requirements:**
1. User registration with email validation
2. Login with JWT tokens
3. Refresh token rotation
4. Logout with token revocation
5. Protected routes

**Backend Implementation:**

```javascript
// 1. User registration
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

app.post('/api/v1/auth/register', asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  // Validate
  if (!email || !password) {
    throw new APIError('Email and password required', 400, 'INVALID_INPUT');
  }
  
  // Check if user exists
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw new APIError('User already exists', 409, 'USER_EXISTS');
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Create user
  const user = await User.create({
    email,
    passwordHash,
    firstName,
    lastName,
    emailVerified: false
  });
  
  // Generate verification token
  const verificationToken = jwt.sign(
    { userId: user.id, type: 'verification' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  // Send verification email
  await sendVerificationEmail(user.email, verificationToken);
  
  res.status(201).json({
    status: 'success',
    data: {
      message: 'Registration successful. Please verify your email.',
      user: { id: user.id, email: user.email }
    }
  });
}));

// 2. Verify email
app.post('/api/v1/auth/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.userId);
    if (!user) throw new Error('User not found');
    
    await user.update({ emailVerified: true });
    
    res.json({
      status: 'success',
      data: { message: 'Email verified successfully' }
    });
  } catch (error) {
    throw new APIError('Invalid or expired token', 400, 'INVALID_TOKEN');
  }
}));

// 3. Login
app.post('/api/v1/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ where: { email } });
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    throw new APIError('Invalid credentials', 401, 'AUTH_FAILED');
  }
  
  if (!user.emailVerified) {
    throw new APIError('Email not verified', 403, 'EMAIL_NOT_VERIFIED');
  }
  
  // Generate tokens
  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  // Save refresh token
  await RefreshToken.create({
    userId: user.id,
    token: refreshToken
  });
  
  res.json({
    status: 'success',
    data: {
      user: { id: user.id, email: user.email, firstName: user.firstName },
      accessToken,
      refreshToken // Send both for demo
    }
  });
}));

// 4. Refresh token
app.post('/api/v1/auth/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    throw new APIError('Refresh token required', 400, 'NO_REFRESH_TOKEN');
  }
  
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Check if token still valid in DB
    const tokenRecord = await RefreshToken.findOne({
      where: { userId: decoded.userId, token: refreshToken }
    });
    
    if (!tokenRecord) {
      throw new Error('Token revoked');
    }
    
    // Generate new tokens
    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const newRefreshToken = jwt.sign(
      { userId: decoded.userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    // Rotate refresh token
    await tokenRecord.destroy();
    await RefreshToken.create({
      userId: decoded.userId,
      token: newRefreshToken
    });
    
    res.json({
      status: 'success',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    throw new APIError('Invalid refresh token', 401, 'INVALID_TOKEN');
  }
}));

// 5. Logout
app.post('/api/v1/auth/logout', authMiddleware, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  
  if (refreshToken) {
    await RefreshToken.destroy({
      where: { userId: req.user.userId, token: refreshToken }
    });
  }
  
  res.json({ status: 'success', data: { message: 'Logged out' } });
}));
```

**Frontend Implementation:**

```javascript
// 1. Register component
const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error.message);
      }

      alert('Registration successful! Check your email to verify.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating account...' : 'Register'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

// 2. Auth context for managing tokens
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = async (email, password) => {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    
    // Store refresh token securely (HttpOnly in production)
    localStorage.setItem('refreshToken', data.data.refreshToken);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    await fetch('/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ refreshToken })
    });

    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Protected route
const ProtectedRoute = ({ children }) => {
  const { accessToken } = useContext(AuthContext);
  
  if (!accessToken) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Usage
<Routes>
  <Route path="/register" element={<Register />} />
  <Route path="/login" element={<Login />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
</Routes>
```

**Testing:**
```bash
# Test registration
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","firstName":"John"}'

# Test login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Test protected route
curl -X GET http://localhost:3000/api/v1/user/profile \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**What You Learn:**
- ✓ JWT token generation and validation
- ✓ Password hashing with bcrypt
- ✓ Email verification
- ✓ Token rotation
- ✓ React Context for auth state
- ✓ Protected routes

---

## Exercise 2: Build Product Listing with Filters (Easy → Medium)

**Duration:** 2-3 hours

**Backend:**

```javascript
// Database query with pagination, filtering, sorting
app.get('/api/v1/products', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category, search, sortBy = 'createdAt', order = 'DESC' } = req.query;

  const where = {};
  if (category) where.category = category;
  if (search) where.title = { [Op.like]: `%${search}%` };

  const offset = (page - 1) * limit;

  const { count, rows } = await Product.findAndCountAll({
    where,
    order: [[sortBy, order]],
    limit: parseInt(limit),
    offset: offset
  });

  res.json({
    status: 'success',
    data: {
      products: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    }
  });
}));

// Get categories
app.get('/api/v1/categories', asyncHandler(async (req, res) => {
  const categories = await Category.findAll();
  res.json({ status: 'success', data: { categories } });
}));
```

**Frontend:**

```javascript
const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    category: '',
    search: '',
    sortBy: 'createdAt'
  });
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchCategories = async () => {
    const response = await fetch('/api/v1/categories');
    const data = await response.json();
    setCategories(data.data.categories);
  };

  const fetchProducts = async () => {
    setLoading(true);
    const queryString = new URLSearchParams(filters).toString();
    const response = await fetch(`/api/v1/products?${queryString}`);
    const data = await response.json();
    setProducts(data.data.products);
    setPagination(data.data.pagination);
    setLoading(false);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  return (
    <div className="product-listing">
      <aside className="filters">
        <h3>Filters</h3>
        <div>
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
          />
        </div>
        <div>
          <label>Category</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Sort By</label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
          >
            <option value="createdAt">Newest</option>
            <option value="price">Price: Low to High</option>
          </select>
        </div>
      </aside>

      <main className="products">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="product-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Pagination
              current={pagination.page}
              total={pagination.pages}
              onPageChange={(newPage) => handleFilterChange({ page: newPage })}
            />
          </>
        )}
      </main>
    </div>
  );
};
```

**What You Learn:**
- ✓ Pagination implementation
- ✓ Filtering and searching
- ✓ Sorting
- ✓ Query parameter handling
- ✓ Optimized database queries

---

## Exercise 3: Build Shopping Cart with Redux (Medium)

**Duration:** 2-3 hours

**Redux Setup:**

```javascript
// Already done in your project, but understand deeply:

// 1. Create slice
import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCartFromStorage(),
    isOpen: false
  },
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      saveCartToStorage(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      saveCartToStorage(state.items);
    },
    updateQuantity: (state, action) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity;
        saveCartToStorage(state.items);
      }
    }
  }
});

// 2. Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
export const selectCartCount = (state) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);

// 3. Use in component
const ShoppingCart = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          {item.title} x {item.quantity} = ${item.price * item.quantity}
          <button onClick={() => dispatch(removeFromCart(item.id))}>Remove</button>
        </div>
      ))}
      <h3>Total: ${total.toFixed(2)}</h3>
    </div>
  );
};
```

**What You Learn:**
- ✓ Redux state management
- ✓ Reducer functions
- ✓ Selectors for derived state
- ✓ localStorage integration

---

## Exercise 4: Build Checkout with Transactions (Hard)

**Duration:** 4-5 hours

**This combines everything:**
- Backend transactions (ACID properties)
- Concurrent order handling
- Payment processing
- Email notifications
- Frontend form validation

```javascript
// Backend checkout with transaction
app.post('/api/v1/checkout', authMiddleware, asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { items, shippingAddress, paymentMethod, paymentToken } = req.body;
    
    if (!items || items.length === 0) {
      throw new APIError('Cart is empty', 400, 'EMPTY_CART');
    }
    
    let totalAmount = 0;
    const orderItems = [];
    
    // Verify stock and calculate total
    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        transaction,
        lock: transaction.LOCK.UPDATE // Row-level lock to prevent race conditions
      });
      
      if (!product) {
        throw new APIError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }
      
      if (product.stock < item.quantity) {
        throw new APIError(`Only ${product.stock} units available`, 400, 'INSUFFICIENT_STOCK');
      }
      
      totalAmount += product.price * item.quantity;
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price
      });
      
      // Deduct stock
      await product.decrement('stock', { by: item.quantity, transaction });
    }
    
    // Create order
    const orderNumber = `ORD-${Date.now()}`;
    const order = await Order.create({
      userId: req.user.id,
      orderNumber,
      totalAmount,
      status: 'pending',
      shippingAddress
    }, { transaction });
    
    // Create order items
    await OrderItem.bulkCreate(
      orderItems.map(item => ({ ...item, orderId: order.id })),
      { transaction }
    );
    
    // Process payment
    const paymentResult = await stripe.charges.create({
      amount: Math.round(totalAmount * 100), // cents
      currency: 'usd',
      source: paymentToken,
      description: `Order ${orderNumber}`
    });
    
    // Record payment
    await PaymentTransaction.create({
      orderId: order.id,
      amount: totalAmount,
      status: 'completed',
      transactionId: paymentResult.id,
      paymentGateway: 'stripe'
    }, { transaction });
    
    // Commit everything
    await transaction.commit();
    
    // Async: Send email, clear cart
    publishOrderEvent({ orderId: order.id, userId: req.user.id });
    
    res.status(201).json({
      status: 'success',
      data: { order }
    });
    
  } catch (error) {
    await transaction.rollback(); // Rollback everything if error
    throw error;
  }
}));

// Frontend checkout form
const CheckoutForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cart = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Tokenize card
      const { token } = await stripe.createToken({
        number: formData.cardNumber
      });

      // Send checkout request
      const response = await fetch('/api/v1/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Idempotency-Key': generateIdempotencyKey()
        },
        body: JSON.stringify({
          items: cart,
          shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
          paymentMethod: 'stripe',
          paymentToken: token.id
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error.message);
      }

      const data = await response.json();
      navigate(`/order-confirmation/${data.data.order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <div className="order-total">
        Total: ${total.toFixed(2)}
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Complete Purchase'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

**What You Learn:**
- ✓ Database transactions (ACID)
- ✓ Row-level locking (prevent race conditions)
- ✓ Rollback on error
- ✓ Payment processing
- ✓ Idempotent operations
- ✓ Async background jobs

---

## Exercise 5: API Versioning & Breaking Changes (Medium)

**Duration:** 1-2 hours

```javascript
// v1 API (legacy)
app.get('/api/v1/products', (req, res) => {
  // Returns: { products: [...] }
});

// v2 API (breaking changes)
app.get('/api/v2/products', (req, res) => {
  // Returns: { data: { products: [...], pagination: {...} } }
});

// Migration strategy:
// 1. Release v2 alongside v1
// 2. Communicate deprecation date
// 3. Maintain v1 for 6 months
// 4. Sunset v1

// Frontend version detection
const API_VERSION = 'v2';
const BASE_URL = `/api/${API_VERSION}`;

// If response format changes, handle both:
const parseResponse = (data) => {
  if (data.data) { // v2 format
    return data.data;
  }
  return data; // v1 format
};
```

---

## Exercise 6: Database Query Optimization (Medium)

**Duration:** 2-3 hours

```javascript
// Problem: N+1 queries

// ❌ WRONG (11 queries for 10 orders)
const orders = await Order.findAll();
for (const order of orders) {
  order.items = await order.getItems(); // 10 separate queries
}

// ✅ CORRECT (3 queries total)
const orders = await Order.findAll({
  include: [
    {
      model: OrderItem,
      include: [{ model: Product }]
    },
    { model: User }
  ]
});

// Measure:
console.time('fetch-orders');
const orders = await Order.findAll({ include: [...] });
console.timeEnd('fetch-orders');
// Shows time taken

// Database indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_products_category ON products(category);

// Verify index usage
EXPLAIN SELECT * FROM orders WHERE user_id = 1;
// Check if it uses index
```

---

## Exercise 7: Rate Limiting & Throttling (Medium)

**Duration:** 1-2 hours

```javascript
const rateLimit = require('express-rate-limit');

// General rate limit: 100 requests per 15 minutes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});

// Strict limit on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true // Don't count successful logins
});

app.use(generalLimiter);
app.post('/api/v1/auth/login', authLimiter, loginHandler);

// Frontend throttling for search
const throttledSearch = _.throttle((query) => {
  dispatch(searchProducts(query));
}, 300); // Max 1 request per 300ms

<input
  onChange={(e) => throttledSearch(e.target.value)}
  placeholder="Search products..."
/>
```

---

## Exercise 8: Error Handling & Recovery (Hard)

**Duration:** 3-4 hours

```javascript
// Complete error handling system

// 1. Custom error class
class APIError extends Error {
  constructor(message, statusCode, errorCode, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
  }
}

// 2. Error handling middleware
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const errorCode = error.errorCode || 'INTERNAL_ERROR';

  console.error(`[${errorCode}] ${error.message}`);

  // Send to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error);
  }

  res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    error: {
      code: errorCode,
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.details : {}
    }
  });
});

// 3. Frontend error recovery
const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const fetch = useCallback(async () => {
    try {
      const response = await apiClient.get(url);
      setData(response.data.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 429) { // Rate limited
        setTimeout(() => retry(), 1000 * (retryCount + 1));
      } else {
        setError(err.response?.data?.error?.message || 'Error');
      }
    } finally {
      setLoading(false);
    }
  }, [url]);

  const retry = () => {
    setRetryCount(prev => prev + 1);
    setLoading(true);
    fetch();
  };

  useEffect(() => {
    fetch();
  }, [url]);

  return { data, error, loading, retry };
};
```

---

## Exercise 9: Caching Strategy (Hard)

**Duration:** 3-4 hours

```javascript
// Implement multi-level caching

// 1. Redis cache layer
const getCachedProducts = async (filters) => {
  const cacheKey = `products:${JSON.stringify(filters)}`;
  
  // Try cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Cache miss
  const products = await Product.findAll(buildWhere(filters));
  
  // Store in cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(products));
  
  return products;
};

// 2. Cache invalidation
const invalidateProductCache = async () => {
  // Clear all product-related cache
  const keys = await redis.keys('products:*');
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};

// When product is updated
app.patch('/api/v1/products/:id', adminMiddleware, asyncHandler(async (req, res) => {
  const product = await Product.update(req.body, { where: { id: req.params.id } });
  
  // Invalidate cache
  await invalidateProductCache();
  
  res.json({ status: 'success', data: { product } });
}));

// 3. Frontend caching with SWR
import useSWR from 'swr';

const Products = () => {
  const { data: products, error, isLoading, mutate } = useSWR(
    '/api/v1/products',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  // Manual refresh
  const handleRefresh = () => {
    mutate();
  };

  return (
    <>
      {products?.map(p => <ProductCard key={p.id} product={p} />)}
      <button onClick={handleRefresh}>Refresh</button>
    </>
  );
};
```

---

## Checklist: Full-Stack Ready for Interview

Mark off as you complete:

**Authentication (Exercise 1)**
- [ ] User registration with email verification
- [ ] Login with JWT tokens
- [ ] Token refresh mechanism
- [ ] Logout with token revocation
- [ ] Protected routes in React
- [ ] Password hashing (bcrypt)

**Data Management (Exercises 2-3)**
- [ ] Pagination working
- [ ] Filters working
- [ ] Sorting working
- [ ] Redux cart management
- [ ] localStorage persistence
- [ ] Query optimization

**Transactions (Exercise 4)**
- [ ] Checkout form with validation
- [ ] Payment processing
- [ ] Database transaction (ACID)
- [ ] Inventory deduction
- [ ] Order confirmation
- [ ] Email notification

**Production Readiness (Exercises 5-9)**
- [ ] API versioning strategy
- [ ] N+1 query prevention
- [ ] Indexes for performance
- [ ] Rate limiting
- [ ] Complete error handling
- [ ] Multi-level caching
- [ ] Cache invalidation

**Testing & Monitoring**
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Error monitoring (Sentry)
- [ ] Performance monitoring
- [ ] Health checks
- [ ] Logging strategy

---

## Time Estimation

| Exercise | Duration | Difficulty |
|----------|----------|------------|
| 1. Authentication | 3-4 hrs | Medium |
| 2. Product Listing | 2-3 hrs | Easy-Med |
| 3. Shopping Cart | 2-3 hrs | Easy-Med |
| 4. Checkout | 4-5 hrs | Hard |
| 5. API Versioning | 1-2 hrs | Medium |
| 6. Query Optimization | 2-3 hrs | Medium |
| 7. Rate Limiting | 1-2 hrs | Easy |
| 8. Error Handling | 3-4 hrs | Hard |
| 9. Caching | 3-4 hrs | Hard |

**Total: ~25-30 hours**

---

## Interview Angles When Discussing These

**After Exercise 1:**
- "Tell me about JWT token security"
- "Why refresh token rotation?"
- "How would you handle token expiration?"

**After Exercise 4:**
- "Walk me through the checkout flow"
- "What if payment fails mid-transaction?"
- "How do you prevent double charging?"

**After Exercise 6:**
- "Optimize this query for 1 million records"
- "How would you add caching?"
- "Explain database indexes"

**After Exercise 9:**
- "When would you invalidate cache?"
- "How to handle cache coherency?"
- "Design caching for 10k concurrent users"

Good luck! Complete these and you'll be unstoppable in interviews! 🚀
