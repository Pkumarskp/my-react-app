# Full-Stack Interview Mastery (React + Backend + Database)

*Complete guide for React + Laravel/Node.js developers - 100% interview ready*

---

## Table of Contents

1. [Frontend Mastery](#frontend-mastery)
2. [Backend Architecture](#backend-architecture)
3. [Database Design](#database-design)
4. [API Design & REST](#api-design)
5. [Authentication & Security](#authentication-security)
6. [System Design](#system-design)
7. [Full-Stack Projects](#full-stack-projects)
8. [DevOps & Deployment](#devops)
9. [Real-World Scenarios](#real-world)
10. [Common Interview Patterns](#patterns)
11. [Hands-On Checklist](#checklist)

---

# FRONTEND MASTERY (React)

## Q1: React Rendering Lifecycle & Optimization

**Question:** "Walk me through how React renders a component and how you'd optimize it."

**Answer:**

```javascript
// 1. INITIAL RENDER
const App = () => {
  const [products, setProducts] = useState([]); // Render triggers
  const [filter, setFilter] = useState('');
  
  // 2. EFFECT RUNS
  useEffect(() => {
    fetchProducts(); // Side effect after render
  }, []);
  
  // 3. RE-RENDER on state change
  const handleFilter = (newFilter) => {
    setFilter(newFilter); // Triggers re-render
  };
  
  // 4. OPTIMIZATION: Memoize expensive components
  return (
    <>
      <SearchBar value={filter} onChange={handleFilter} />
      
      {/* Only re-renders if products changes */}
      <ProductList products={products} filter={filter} />
    </>
  );
};

// Optimize ProductList
const ProductList = React.memo(({ products, filter }) => {
  // Only re-renders if products or filter changes
  const filtered = useMemo(
    () => products.filter(p => p.name.includes(filter)),
    [products, filter]
  );
  
  return (
    <div>
      {filtered.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
});
```

**Lifecycle phases:**
1. **Mount** → Initial render
2. **Update** → State/props change
3. **Unmount** → Component removed

**Optimization checklist:**
- ✓ useCallback for callbacks passed to memoized children
- ✓ useMemo for expensive computations
- ✓ React.memo for component memoization
- ✓ Virtual lists for large datasets
- ✓ Code splitting with lazy()

---

## Q2: State Management at Scale

**Question:** "How would you structure state for an e-commerce platform with 10,000 products?"

**Answer:**

```javascript
// ❌ WRONG: All in one Redux slice
const store = {
  products: [/* 10,000 items */],
  cart: [],
  filters: {},
  user: {}
}; // Every filter change re-renders entire list

// ✅ CORRECT: Normalized, separated concerns
const store = {
  // Domain data (cached, infrequently updated)
  products: {
    byId: { '1': {...}, '2': {...} }, // O(1) access
    allIds: ['1', '2', ...], // For iteration
    total: 10000,
    lastFetch: timestamp,
    status: 'idle' // | 'loading' | 'failed'
  },
  
  // UI state (frequent updates)
  ui: {
    filters: { category: 'electronics', price: [0, 1000] },
    sort: 'price_asc',
    page: 1,
    pageSize: 20
  },
  
  // User session
  user: { id: 1, token: '...', preferences: {} },
  
  // Shopping context
  cart: {
    itemIds: ['1', '2'], // IDs only, data in products.byId
    isOpen: false
  }
};

// Selectors for memoization
export const selectFilteredProducts = (state) => {
  const { products, ui } = state;
  
  return ui.filters.category
    ? Object.values(products.byId).filter(
        p => p.category === ui.filters.category
      )
    : Object.values(products.byId);
};

export const selectCartTotal = (state) => {
  const { cart, products } = state;
  return cart.itemIds.reduce(
    (sum, itemId) => sum + (products.byId[itemId]?.price || 0),
    0
  );
};
```

**Key principles:**
- Normalize data (no duplication)
- Separate domain data from UI state
- Use selectors for derived state
- Keep frequently-changing state separate

---

## Q3: Context vs Redux Decision Tree

**Question:** "When do you use Context API vs Redux?"

**Answer:**

```
START: Do multiple components need this state?
  ├─ NO → useState (local state)
  └─ YES ↓
  
  Does it change frequently (>10x per minute)?
    ├─ NO ↓
    │   └─ Context API good (theme, language, notifications)
    └─ YES ↓
        Does it have complex updates (multiple interdependent fields)?
        ├─ NO → Context + useReducer
        └─ YES ↓
            Is it accessed by >5 components?
            ├─ NO → useReducer
            └─ YES ↓
                → REDUX ✅
```

**Your project example:**

```javascript
// CONTEXT - Theme, Notifications (low frequency)
const AppContext = createContext();
const { theme, notifications } = useApp();

// REDUX - Cart, Products (high frequency, complex)
const products = useSelector(selectFilteredProducts);
const dispatch = useDispatch();
dispatch(addToCart(product));
```

**Interview answer:** "I analyze the state along three dimensions: frequency of updates, complexity of updates, and number of consumers. If it's infrequent and simple, Context. If it's frequent and complex with many consumers, Redux."

---

## Q4: Performance Monitoring & Metrics

**Question:** "How would you monitor React performance in production?"

**Answer:**

```javascript
// 1. Web Vitals - Core metrics
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log); // Cumulative Layout Shift
getFID(console.log); // First Input Delay
getFCP(console.log); // First Contentful Paint
getLCP(console.log); // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte

// 2. React Profiler - Component render time
import { Profiler } from 'react';

const onRenderCallback = (
  id, // Component name
  phase, // "mount" | "update"
  actualDuration, // Time to render
  baseDuration,
  startTime,
  commitTime,
  interactions
) => {
  // Send to analytics
  if (actualDuration > 1000) { // Slow render
    console.warn(`Slow render: ${id} took ${actualDuration}ms`);
  }
};

<Profiler id="Shop" onRender={onRenderCallback}>
  <Shop />
</Profiler>

// 3. Custom Performance Marks
performance.mark('products-fetch-start');
await fetchProducts();
performance.mark('products-fetch-end');
performance.measure('products-fetch', 'products-fetch-start', 'products-fetch-end');

const measure = performance.getEntriesByName('products-fetch')[0];
console.log(`Fetch took ${measure.duration}ms`);

// 4. Send to monitoring service
const reportMetrics = (metric) => {
  if (window.analytics) {
    window.analytics.track('perf_metric', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating // good|needs-improvement|poor
    });
  }
};
getCLS(reportMetrics);
getLCP(reportMetrics);
```

**Monitoring checklist:**
- ✓ Web Vitals (CLS, FID, LCP, FCP, TTFB)
- ✓ React Profiler for component performance
- ✓ Custom metrics for business logic
- ✓ Error tracking (Sentry, LogRocket)
- ✓ User session replay

---

# BACKEND ARCHITECTURE

## Q5: RESTful API Design Principles

**Question:** "Design a REST API for the Aura Market e-commerce platform."

**Answer:**

```javascript
// CORRECT RESTful Design

// Products
GET    /api/v1/products              // List (with pagination, filters)
GET    /api/v1/products/:id          // Get single
POST   /api/v1/products              // Create (admin only)
PATCH  /api/v1/products/:id          // Update
DELETE /api/v1/products/:id          // Delete

// Cart
GET    /api/v1/cart                  // Get cart items
POST   /api/v1/cart/items            // Add to cart
PATCH  /api/v1/cart/items/:itemId    // Update quantity
DELETE /api/v1/cart/items/:itemId    // Remove from cart

// Orders
GET    /api/v1/orders                // List user's orders
POST   /api/v1/orders                // Create order (checkout)
GET    /api/v1/orders/:id            // Get order details
GET    /api/v1/orders/:id/status     // Track order

// Authentication
POST   /api/v1/auth/register         // Sign up
POST   /api/v1/auth/login            // Sign in
POST   /api/v1/auth/refresh          // Refresh token
POST   /api/v1/auth/logout           // Sign out

// Request/Response Format
{
  "status": "success", // or "error"
  "code": 200,         // HTTP status code
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1000,
      "hasMore": true
    }
  },
  "error": null        // If status is "error"
}

// Query Parameters (Filtering, Pagination, Sorting)
GET /api/v1/products?
    category=electronics&
    priceMin=100&
    priceMax=1000&
    sort=-price&         // Descending
    page=1&
    limit=20

// API Versioning
/api/v1/...             // Stable version
/api/v2/...             // New version (breaking changes)

// Status Codes
200 OK                  // Successful GET, PATCH, DELETE
201 Created             // Successful POST
204 No Content          // Successful DELETE (no body)
400 Bad Request         // Invalid input
401 Unauthorized        // Not authenticated
403 Forbidden           // Authenticated but not authorized
404 Not Found           // Resource not found
409 Conflict            // State conflict (duplicate email)
429 Too Many Requests   // Rate limited
500 Internal Error      // Server error
```

**API Design checklist:**
- ✓ Use HTTP verbs correctly (GET, POST, PATCH, DELETE)
- ✓ Consistent resource naming (plural nouns)
- ✓ Pagination for large datasets
- ✓ Filtering and sorting
- ✓ API versioning
- ✓ Proper status codes
- ✓ Consistent response format
- ✓ Rate limiting

---

## Q6: Error Handling & Recovery

**Question:** "How do you design error handling for a production API?"

**Answer:**

```javascript
// Express.js Backend
const express = require('express');
const app = express();

// 1. Custom Error Class
class APIError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode; // For frontend
  }
}

// 2. Async Wrapper (catch errors in async routes)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 3. API Routes with Error Handling
app.get('/api/v1/products/:id', asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new APIError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }
  
  res.json({ status: 'success', data: { product } });
}));

app.post('/api/v1/cart/items', asyncHandler(async (req, res, next) => {
  const { productId, quantity } = req.body;
  
  if (!productId || quantity < 1) {
    throw new APIError('Invalid input', 400, 'INVALID_INPUT');
  }
  
  const product = await Product.findById(productId);
  if (!product) {
    throw new APIError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }
  
  const cartItem = await CartItem.create({
    userId: req.user.id,
    productId,
    quantity
  });
  
  res.status(201).json({ status: 'success', data: { cartItem } });
}));

// 4. Global Error Handler Middleware
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const errorCode = error.errorCode || 'INTERNAL_ERROR';
  
  console.error(`[${errorCode}] ${error.message}`);
  
  res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    error: {
      code: errorCode,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }
  });
});

// React Frontend - Error Handling
const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new APIError(
            errorData.error.message,
            errorData.error.code
          );
        }
        
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        // Handle different error types
        if (err.code === 'PRODUCT_NOT_FOUND') {
          setError('Product is no longer available');
        } else if (err.code === 'INVALID_INPUT') {
          setError('Please check your input');
        } else if (err instanceof TypeError) {
          setError('Network error. Please check your connection');
        } else {
          setError(err.message || 'Something went wrong');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  const retry = () => {
    setLoading(true);
    setError(null);
    // Retry logic
  };

  return { data, error, loading, retry };
};
```

**Error handling strategy:**
- ✓ Custom error classes with codes
- ✓ Async error catching middleware
- ✓ Proper HTTP status codes
- ✓ Consistent error response format
- ✓ Frontend error interpretation
- ✓ User-friendly messages
- ✓ Logging for debugging

---

## Q7: Authentication & Authorization

**Question:** "Design authentication for a full-stack app. Handle tokens, refresh, CORS, XSS."

**Answer:**

```javascript
// ===== BACKEND (Node.js/Express) =====

// 1. Token Generation
const jwt = require('jsonwebtoken');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Short-lived
  );
  
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Long-lived, stored in DB
  );
  
  return { accessToken, refreshToken };
};

// 2. Login Route
app.post('/api/v1/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  if (!user || !await user.comparePassword(password)) {
    throw new APIError('Invalid credentials', 401, 'AUTH_FAILED');
  }
  
  const { accessToken, refreshToken } = generateTokens(user.id);
  
  // Store refresh token in DB (for revocation)
  await RefreshToken.create({ userId: user.id, token: refreshToken });
  
  // Send refresh token as HTTP-Only cookie (XSS protection)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,      // Prevents JS access (XSS protection)
    secure: true,        // HTTPS only
    sameSite: 'strict',  // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
  
  // Send access token in response (or session)
  res.json({
    status: 'success',
    data: {
      user: { id: user.id, email: user.email },
      accessToken // Frontend stores in memory, NOT localStorage
    }
  });
}));

// 3. Refresh Token Route
app.post('/api/v1/auth/refresh', asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    throw new APIError('No refresh token', 401, 'NO_REFRESH_TOKEN');
  }
  
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  
  // Check if token exists in DB (revocation list)
  const storedToken = await RefreshToken.findOne({
    userId: decoded.userId,
    token: refreshToken
  });
  
  if (!storedToken) {
    throw new APIError('Refresh token revoked', 401, 'TOKEN_REVOKED');
  }
  
  const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
  
  // Update refresh token
  await storedToken.updateOne({ token: newRefreshToken });
  res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true });
  
  res.json({ status: 'success', data: { accessToken } });
}));

// 4. Auth Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // "Bearer TOKEN"
  
  if (!token) {
    throw new APIError('No token provided', 401, 'NO_TOKEN');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new APIError('Token expired', 401, 'TOKEN_EXPIRED');
    }
    throw new APIError('Invalid token', 401, 'INVALID_TOKEN');
  }
};

app.get('/api/v1/user/profile', authMiddleware, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.json({ status: 'success', data: { user } });
}));

// 5. Logout (invalidate refresh token)
app.post('/api/v1/auth/logout', authMiddleware, asyncHandler(async (req, res) => {
  await RefreshToken.deleteOne({ userId: req.user.userId });
  res.clearCookie('refreshToken');
  res.json({ status: 'success' });
}));

// ===== FRONTEND (React) =====

// 1. Store tokens securely
// - Access token: Memory (lost on refresh, but prevents XSS)
// - Refresh token: HTTP-Only cookie (server sets it)

const [accessToken, setAccessToken] = useState(null);

// 2. API interceptor to add token to requests
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true // Include cookies
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 3. Handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && error.response?.data?.error?.code === 'TOKEN_EXPIRED') {
      try {
        // Try to refresh
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        setAccessToken(response.data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// 4. Login component
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      setAccessToken(response.data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
};
```

**Security checklist:**
- ✓ Access token: Short-lived (15 min), in memory
- ✓ Refresh token: Long-lived (7 days), HTTP-Only cookie
- ✓ Token in Authorization header (not URL param)
- ✓ HTTPS only (never HTTP)
- ✓ CORS properly configured
- ✓ XSS protection (HTTP-Only cookies)
- ✓ CSRF protection (SameSite cookie)
- ✓ Token revocation on logout
- ✓ Rate limiting on auth endpoints

---

# DATABASE DESIGN

## Q8: Database Schema Design

**Question:** "Design a database schema for an e-commerce platform."

**Answer:**

```sql
-- ===== USERS TABLE =====
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===== PRODUCTS TABLE =====
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  sku VARCHAR(100) UNIQUE NOT NULL,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_category (category),
  INDEX idx_price (price),
  INDEX idx_sku (sku)
);

-- ===== CATEGORIES TABLE =====
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_id) REFERENCES categories(id),
  INDEX idx_parent_id (parent_id)
);

-- ===== CART TABLE =====
CREATE TABLE cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id),
  INDEX idx_user_id (user_id)
);

-- ===== ORDERS TABLE =====
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  order_number VARCHAR(20) UNIQUE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50),
  shipping_address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- ===== ORDER ITEMS TABLE =====
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  INDEX idx_order_id (order_id)
);

-- ===== PAYMENT TRANSACTIONS TABLE =====
CREATE TABLE payment_transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  transaction_id VARCHAR(100),
  payment_gateway VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_order_id (order_id)
);

-- ===== REVIEWS TABLE =====
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_user_product_review (product_id, user_id),
  INDEX idx_product_id (product_id),
  INDEX idx_rating (rating)
);

-- ===== INDEXES FOR PERFORMANCE =====
-- Already added above, but here's the strategy:
-- - Foreign keys: Always index
-- - WHERE clauses: Index columns used in WHERE
-- - JOIN conditions: Index both sides
-- - ORDER BY: Index if possible
-- - Low cardinality (many duplicates): Maybe skip
-- - High cardinality (unique values): Always index
```

**Query optimization:**

```sql
-- ❌ SLOW: Full table scan
SELECT * FROM orders WHERE user_id = 1;
-- Without index on user_id, MySQL scans all rows

-- ✅ FAST: Index used
SELECT * FROM orders WHERE user_id = 1;
-- With index on user_id, MySQL does B-tree lookup (O(log n))

-- ❌ SLOW: Multiple joins without proper selection
SELECT * FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id;

-- ✅ FAST: Specific columns, proper indexes
SELECT o.id, o.order_number, COUNT(oi.id) as item_count
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 1 AND o.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 20;

-- ❌ SLOW: N+1 problem
$orders = Order::all(); // Gets 100 orders
foreach ($orders as $order) {
  $items = $order->items(); // 100 separate queries!
}

-- ✅ FAST: Eager loading
$orders = Order::with('items', 'user')->get(); // 3 queries total
```

**Database design checklist:**
- ✓ Proper primary keys (INT AUTO_INCREMENT)
- ✓ Foreign keys with ON DELETE CASCADE/RESTRICT
- ✓ Indexes on frequently queried columns
- ✓ Denormalization where needed for performance
- ✓ Appropriate data types
- ✓ Constraints (UNIQUE, NOT NULL)
- ✓ Avoid N+1 queries (eager loading)
- ✓ Query optimization (EXPLAIN ANALYZE)

---

## Q9: Database Queries & Performance

**Question:** "Write an optimized query to get user's recent orders with items."

**Answer:**

```php
// Laravel (similar to Node.js/Sequelize)

// ❌ WRONG: N+1 problem
$orders = Order::where('user_id', auth()->id())
  ->orderBy('created_at', 'desc')
  ->limit(10)
  ->get();

foreach ($orders as $order) {
  $items = $order->items; // SEPARATE QUERY FOR EACH ORDER
  $total = $items->sum('price'); // Another query
}

// ✅ CORRECT: Eager loading
$orders = Order::with(['items.product', 'paymentTransaction'])
  ->where('user_id', auth()->id())
  ->orderBy('created_at', 'desc')
  ->limit(10)
  ->get();

// Only 3 queries total:
// 1. Get orders
// 2. Get items for those orders
// 3. Get products for those items

// React Component
const useUserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/v1/user/orders?limit=10');
        const data = await response.json();
        setOrders(data.data.orders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return { orders, loading };
};

// Backend route optimization
app.get('/api/v1/user/orders', authMiddleware, asyncHandler(async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const offset = (page - 1) * limit;

  // One optimized query with eager loading
  const orders = await Order.findAll({
    where: { userId: req.user.userId },
    include: [
      {
        model: OrderItem,
        include: [{ model: Product, attributes: ['id', 'title', 'price'] }]
      },
      { model: PaymentTransaction }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: offset
  });

  const total = await Order.count({ where: { userId: req.user.userId } });

  res.json({
    status: 'success',
    data: {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        hasMore: offset + orders.length < total
      }
    }
  });
}));
```

**Query patterns:**
- ✓ Eager loading (load relations in one query)
- ✓ Pagination (LIMIT/OFFSET)
- ✓ Indexing for WHERE clauses
- ✓ Select only needed columns
- ✓ Avoid subqueries (use JOIN)
- ✓ Batch operations (INSERT multiple rows at once)

---

# API DESIGN

## Q10: Pagination, Filtering, Sorting

**Question:** "Design pagination, filtering, and sorting for a product listing API."

**Answer:**

```javascript
// Backend implementation

app.get('/api/v1/products', asyncHandler(async (req, res) => {
  const {
    // Pagination
    page = 1,
    limit = 20,
    
    // Filtering
    category,
    priceMin,
    priceMax,
    search,
    inStock,
    
    // Sorting
    sort = '-createdAt', // - means descending
  } = req.query;

  // 1. Build WHERE clause
  const where = {};
  
  if (category) {
    where.category = category;
  }
  
  if (search) {
    where.title = { [Op.like]: `%${search}%` };
  }
  
  if (priceMin || priceMax) {
    where.price = {};
    if (priceMin) where.price[Op.gte] = parseFloat(priceMin);
    if (priceMax) where.price[Op.lte] = parseFloat(priceMax);
  }
  
  if (inStock === 'true') {
    where.stock = { [Op.gt]: 0 };
  }

  // 2. Build ORDER clause
  const order = [];
  const sortFields = sort.split(',');
  
  sortFields.forEach(field => {
    if (field.startsWith('-')) {
      order.push([field.substring(1), 'DESC']);
    } else {
      order.push([field, 'ASC']);
    }
  });

  // 3. Pagination
  const offset = (page - 1) * limit;

  // 4. Execute query
  const products = await Product.findAll({
    where,
    order,
    limit: parseInt(limit),
    offset: offset,
    attributes: { exclude: ['createdAt', 'updatedAt'] }
  });

  const total = await Product.count({ where });

  res.json({
    status: 'success',
    data: {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    }
  });
}));

// Frontend component

const Products = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    category: '',
    priceMin: '',
    priceMax: '',
    search: '',
    sort: '-createdAt'
  });

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryString = new URLSearchParams(filters).toString();
        const response = await fetch(`/api/v1/products?${queryString}`);
        const data = await response.json();
        
        setProducts(data.data.products);
        setPagination(data.data.pagination);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div>
      <FilterBar 
        filters={filters} 
        onFilterChange={handleFilterChange}
      />
      
      <ProductList products={products} />
      
      <Pagination
        current={pagination.page}
        total={pagination.pages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};
```

---

# AUTHENTICATION & SECURITY

## Q11: Security Best Practices

**Question:** "List security vulnerabilities and how to prevent them."

**Answer:**

```javascript
// ===== SECURITY VULNERABILITIES & PREVENTION =====

// 1. SQL INJECTION
// ❌ VULNERABLE:
const query = `SELECT * FROM users WHERE email = '${email}'`;
db.query(query);

// ✅ SAFE: Use parameterized queries
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email]);

// 2. XSS (Cross-Site Scripting)
// ❌ VULNERABLE:
<div>{userComment}</div> // If comment contains <script>alert('hack')</script>

// ✅ SAFE: React automatically escapes
<div>{userComment}</div> // React escapes HTML

// But if you use dangerouslySetInnerHTML:
// ❌ VULNERABLE:
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ SAFE: Sanitize first
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userComment) }} />

// 3. CSRF (Cross-Site Request Forgery)
// ❌ VULNERABLE: No token verification
app.post('/api/transfer-money', (req, res) => {
  transfer(req.body.amount);
});

// ✅ SAFE: Verify CSRF token
app.post('/api/transfer-money', csrfMiddleware, (req, res) => {
  transfer(req.body.amount);
});

// 4. BROKEN AUTHENTICATION
// ❌ VULNERABLE: Weak password hashing
const hash = sha256(password);
db.save({ email, password: hash });

// ✅ SAFE: Use bcrypt (slow, salted)
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 10); // 10 rounds
db.save({ email, password: hash });

// 5. INSECURE DIRECT OBJECT REFERENCES
// ❌ VULNERABLE: User can access any ID
app.get('/api/orders/:id', (req, res) => {
  const order = Order.findById(req.params.id);
  res.json(order); // No ownership check!
});

// ✅ SAFE: Verify ownership
app.get('/api/orders/:id', authMiddleware, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (order.userId !== req.user.id) {
    throw new APIError('Forbidden', 403, 'FORBIDDEN');
  }
  
  res.json(order);
}));

// 6. SENSITIVE DATA EXPOSURE
// ❌ VULNERABLE: Sending passwords in logs
console.log('User login:', { email, password });

// ✅ SAFE: Never log passwords
console.log('User login:', { email });
// Store passwords hashed, never in plain text

// 7. MISSING ACCESS CONTROL
// ❌ VULNERABLE: No authorization check
app.delete('/api/products/:id', (req, res) => {
  Product.destroy(req.params.id);
  res.json({ status: 'success' });
});

// ✅ SAFE: Check authorization
app.delete('/api/products/:id', authMiddleware, adminMiddleware, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    throw new APIError('Unauthorized', 403, 'FORBIDDEN');
  }
  
  await Product.destroy(req.params.id);
  res.json({ status: 'success' });
}));

// 8. SECURITY HEADERS
// ✅ SAFE: Set security headers
const helmet = require('helmet');
app.use(helmet()); // Sets multiple security headers

// Manually:
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
  );
  
  next();
});

// 9. RATE LIMITING
// ✅ SAFE: Prevent brute force attacks
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

app.post('/api/auth/login', loginLimiter, asyncHandler(async (req, res) => {
  // Login logic
}));

// 10. HTTPS ONLY
// ✅ SAFE: Force HTTPS
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(`https://${req.host}${req.url}`);
  }
  next();
});

// React Frontend: Use HTTPS only
// Set cookie: Secure flag (HTTPS only)
// Set cookie: HttpOnly flag (JS can't access)
// Set cookie: SameSite flag (CSRF protection)

// 11. ENVIRONMENT VARIABLES
// ✅ SAFE: Store secrets in .env
// .env file (never commit)
DATABASE_URL=mysql://user:pass@localhost/dbname
JWT_SECRET=super_secret_key_2048_chars
API_KEY=abc123def456

// Use in code:
const dbUrl = process.env.DATABASE_URL;
const secret = process.env.JWT_SECRET;

// .env.example (share this)
DATABASE_URL=<your_database_url>
JWT_SECRET=<your_jwt_secret>

// 12. DEPENDENCY VULNERABILITIES
// ✅ SAFE: Regular updates
npm audit // Check for vulnerabilities
npm audit fix // Auto-fix if possible
npm update // Update packages
```

**Security checklist:**
- ✓ Parameterized queries (prevent SQL injection)
- ✓ Input validation and sanitization
- ✓ Output encoding (prevent XSS)
- ✓ CSRF token validation
- ✓ Bcrypt for password hashing
- ✓ Authorization checks (ownership verification)
- ✓ Security headers (helmet.js)
- ✓ HTTPS only
- ✓ Rate limiting
- ✓ Environment variables for secrets
- ✓ Regular dependency updates
- ✓ No console.log of sensitive data

---

# SYSTEM DESIGN

## Q12: Full-Stack System Design - Design a Scalable E-Commerce Platform

**Question:** "Design an e-commerce platform that can handle 1 million users and 10,000 concurrent orders/minute."

**Answer:**

```
ARCHITECTURE OVERVIEW:

┌─────────────────────────────────────────────────────────────────┐
│                        CDN (CloudFlare)                         │
│              Cache static assets globally                       │
└──────────────────────────────────┬──────────────────────────────┘
                                   │
┌──────────────────────────────────┴──────────────────────────────┐
│                     Load Balancer (Nginx)                       │
│              Distribute traffic across servers                  │
└──────────────┬──────────────────────────────────┬───────────────┘
               │                                  │
        ┌──────▼────────┐                  ┌─────▼──────────┐
        │ Server 1-10   │                  │  Server 11-20  │
        │ (Node.js)     │                  │  (Node.js)     │
        └──────┬────────┘                  └─────┬──────────┘
               │                                  │
        ┌──────▼──────────────────────────────────▼──────────┐
        │          Redis Cache Cluster                        │
        │  - Sessions (30 min TTL)                            │
        │  - Product listings (1 hour TTL)                    │
        │  - Cart data (session duration)                     │
        │  - Rate limiting counters                           │
        └──────────────┬─────────────────────────────────────┘
                       │
        ┌──────────────▼──────────────────┐
        │   MySQL Cluster (Primary-Secondary) │
        │                                  │
        │  - Primary: Write operations     │
        │  - Secondary: Read operations    │
        │  - Replication lag: <100ms       │
        │  - Automatic failover            │
        └──────────────┬──────────────────┘
                       │
        ┌──────────────▼──────────────────────┐
        │  Message Queue (RabbitMQ/Kafka)     │
        │                                     │
        │  - Order processing                 │
        │  - Email notifications              │
        │  - Analytics events                 │
        │  - Inventory updates                │
        └──────────────┬──────────────────────┘
                       │
        ┌──────────────▼──────────────────────┐
        │   Background Jobs (Bull/Celery)     │
        │                                     │
        │  - Process 10,000 orders/min        │
        │  - Send notifications               │
        │  - Generate reports                 │
        │  - Update analytics                 │
        └──────────────────────────────────────┘

DATABASE STRATEGY:
├─ Read Replicas: Scale read operations
├─ Sharding: Partition by user_id for horizontal scaling
├─ Caching: Redis for frequently accessed data
└─ Archiving: Move old orders to separate table

CACHING LAYERS:
1. CDN: Static assets (JS, CSS, images)
2. Browser: Service worker for offline
3. Redis: Session, products, cart (30 min)
4. Database: Indexed queries
```

**Implementation details:**

```javascript
// 1. Load Balancing (Nginx config)
upstream backend {
  least_conn; // Route to server with fewest connections
  server localhost:3000;
  server localhost:3001;
  server localhost:3002;
}

server {
  location /api {
    proxy_pass http://backend;
    proxy_set_header Connection "";
    proxy_http_version 1.1;
  }
}

// 2. Caching Strategy
const redis = require('redis');
const client = redis.createClient();

const CACHE_KEYS = {
  PRODUCT_LIST: 'products:list',
  PRODUCT_DETAIL: (id) => `product:${id}`,
  CART: (userId) => `cart:${userId}`,
  USER_ORDERS: (userId) => `user:${userId}:orders`,
  SESSION: (sessionId) => `session:${sessionId}`
};

const getCachedProducts = async () => {
  // Try cache first
  const cached = await client.get(CACHE_KEYS.PRODUCT_LIST);
  if (cached) return JSON.parse(cached);
  
  // Cache miss: fetch from DB
  const products = await Product.findAll();
  
  // Store in cache for 1 hour
  await client.setex(
    CACHE_KEYS.PRODUCT_LIST,
    3600, // 1 hour
    JSON.stringify(products)
  );
  
  return products;
};

// 3. Database Read Replica
const sequelize = require('sequelize');

const masterDB = new sequelize(process.env.DATABASE_MASTER_URL);
const replicaDB = new sequelize(process.env.DATABASE_REPLICA_URL);

// Writes to master
const createOrder = async (orderData) => {
  return await masterDB.transaction(async (t) => {
    const order = await Order.create(orderData, { transaction: t });
    // Invalidate cache
    await client.del(CACHE_KEYS.USER_ORDERS(orderData.userId));
    return order;
  });
};

// Reads from replica (eventually consistent)
const getUserOrders = async (userId) => {
  // Check cache first
  const cached = await client.get(CACHE_KEYS.USER_ORDERS(userId));
  if (cached) return JSON.parse(cached);
  
  // Read from replica
  const orders = await replicaDB.query(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    { replacements: [userId] }
  );
  
  // Cache for 5 minutes
  await client.setex(
    CACHE_KEYS.USER_ORDERS(userId),
    300,
    JSON.stringify(orders)
  );
  
  return orders;
};

// 4. Message Queue for Async Processing
const amqp = require('amqplib');

const publishOrderEvent = async (order) => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  
  // Declare queue
  await channel.assertQueue('orders', { durable: true });
  
  // Publish order event
  channel.sendToQueue('orders', Buffer.from(JSON.stringify(order)), {
    persistent: true // Survive broker restart
  });
};

// Background worker consuming messages
const processOrders = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  
  await channel.assertQueue('orders', { durable: true });
  
  // Prefetch: Process 10 orders in parallel
  channel.prefetch(10);
  
  channel.consume('orders', async (msg) => {
    try {
      const order = JSON.parse(msg.content.toString());
      
      // Process order
      await processPayment(order);
      await updateInventory(order);
      await sendConfirmationEmail(order);
      
      // Acknowledge message
      channel.ack(msg);
    } catch (error) {
      // Dead letter queue
      channel.nack(msg, false, false);
    }
  });
};

// 5. Horizontal Scaling
// When a single server reaches capacity:
// 1. Spin up new server
// 2. Add to load balancer
// 3. Share Redis cache (stateless servers)
// 4. Database connections pooled

// 6. Monitoring & Alerts
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route.path, res.statusCode)
      .observe(duration);
  });
  next();
});

// Alert when response time > 1 second:
// IF avg(http_request_duration) > 1
// THEN trigger scaling
```

**Scaling checklist:**
- ✓ Stateless servers (enables horizontal scaling)
- ✓ Load balancer (distribute traffic)
- ✓ Redis cache (reduce DB load)
- ✓ Read replicas (scale read operations)
- ✓ Message queues (async processing)
- ✓ CDN (serve static assets faster)
- ✓ Database connection pooling
- ✓ Monitoring and alerts
- ✓ Auto-scaling based on metrics

---

# FULL-STACK PROJECTS

## Project 1: Build Complete Checkout Feature

This project combines everything:

```javascript
// REQUIREMENTS:
// 1. User adds products to cart
// 2. Checkout page with form
// 3. Payment processing
// 4. Order confirmation
// 5. Email notification
// 6. Inventory update

// ===== BACKEND =====

// 1. Checkout initiation
app.post('/api/v1/checkout', authMiddleware, asyncHandler(async (req, res) => {
  const { cartItems, shippingAddress, paymentMethod } = req.body;
  
  // Validate cart
  if (!cartItems || cartItems.length === 0) {
    throw new APIError('Cart is empty', 400, 'EMPTY_CART');
  }
  
  // Start transaction
  const transaction = await sequelize.transaction();
  
  try {
    // Calculate total
    let totalAmount = 0;
    const orderItems = [];
    
    for (const cartItem of cartItems) {
      const product = await Product.findByPk(cartItem.productId, { transaction });
      
      if (!product) {
        throw new APIError('Product not found', 404, 'PRODUCT_NOT_FOUND');
      }
      
      if (product.stock < cartItem.quantity) {
        throw new APIError('Insufficient stock', 400, 'INSUFFICIENT_STOCK');
      }
      
      totalAmount += product.price * cartItem.quantity;
      
      orderItems.push({
        productId: product.id,
        quantity: cartItem.quantity,
        unitPrice: product.price
      });
      
      // Deduct inventory
      await product.decrement('stock', {
        by: cartItem.quantity,
        transaction
      });
    }
    
    // Create order
    const orderNumber = `ORD-${Date.now()}`;
    const order = await Order.create({
      userId: req.user.id,
      orderNumber,
      totalAmount,
      status: 'pending',
      paymentMethod,
      shippingAddress
    }, { transaction });
    
    // Create order items
    await OrderItem.bulkCreate(
      orderItems.map(item => ({ orderId: order.id, ...item })),
      { transaction }
    );
    
    // Process payment
    const paymentResult = await processPayment({
      orderId: order.id,
      amount: totalAmount,
      method: paymentMethod,
      token: req.body.paymentToken
    });
    
    if (!paymentResult.success) {
      // Rollback everything
      throw new APIError('Payment failed', 400, 'PAYMENT_FAILED');
    }
    
    // Record transaction
    await PaymentTransaction.create({
      orderId: order.id,
      amount: totalAmount,
      status: 'completed',
      transactionId: paymentResult.transactionId,
      paymentGateway: paymentMethod
    }, { transaction });
    
    // Commit transaction
    await transaction.commit();
    
    // Publish async events
    await publishOrderEvent({ orderId: order.id, userId: req.user.id });
    
    // Clear user's cart from Redis
    await redis.del(`cart:${req.user.id}`);
    
    res.status(201).json({
      status: 'success',
      data: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          status: order.status
        }
      }
    });
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}));

// 2. Background worker: Send email & update inventory
const processOrderQueue = async () => {
  channel.consume('orders', async (msg) => {
    const { orderId, userId } = JSON.parse(msg.content.toString());
    
    try {
      const order = await Order.findByPk(orderId);
      const user = await User.findByPk(userId);
      
      // Send confirmation email
      await emailService.sendOrderConfirmation(user.email, order);
      
      // Update order status
      await order.update({ status: 'confirmed' });
      
      channel.ack(msg);
    } catch (error) {
      console.error('Failed to process order:', error);
      channel.nack(msg, false, false);
    }
  });
};

// ===== FRONTEND =====

// 1. Checkout Page
const CheckoutPage = () => {
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    address: '',
    city: '',
    zipCode: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch cart
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCart(response.data.data.cartItems);
    } catch (error) {
      setError('Failed to load cart');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Tokenize card with Stripe/Razorpay
      const paymentToken = await stripe.createToken(formData);

      // Send checkout request
      const response = await api.post('/checkout', {
        cartItems: cart,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.zipCode}`,
        paymentMethod: 'stripe',
        paymentToken: paymentToken.token.id
      });

      // Success
      navigate(`/order-confirmation/${response.data.data.order.id}`);
    } catch (error) {
      setError(error.response?.data?.error?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="checkout-container">
      <div className="order-summary">
        <h2>Order Summary</h2>
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <span>{item.title}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="total">
          Total: ${total.toFixed(2)}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Shipping Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Zip Code</label>
            <input
              type="text"
              name="zipCode"
              value={formData.zipCode}
              onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Card Number</label>
          <input
            type="text"
            name="cardNumber"
            placeholder="1234 5678 9012 3456"
            value={formData.cardNumber}
            onChange={(e) => setFormData({...formData, cardNumber: e.target.value})}
            required
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};

// 2. Order Confirmation
const OrderConfirmation = ({ orderId }) => {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);
        setOrder(response.data.data.order);
      } catch (error) {
        console.error('Failed to fetch order:', error);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (!order) return <div>Loading...</div>;

  return (
    <div className="order-confirmation">
      <h1>Order Confirmed!</h1>
      <p>Order Number: {order.orderNumber}</p>
      <p>Total: ${order.totalAmount.toFixed(2)}</p>
      <p>Status: {order.status}</p>
      <p>A confirmation email has been sent.</p>
      <button onClick={() => window.location.href = '/orders'}>
        View All Orders
      </button>
    </div>
  );
};
```

---

# DEVOPS & DEPLOYMENT

## Q13: Deployment Strategy

**Question:** "How would you deploy this application to production?"

**Answer:**

```bash
# 1. Environment Setup (AWS/DigitalOcean)

# EC2 instances for backend (2+ for redundancy)
# RDS MySQL with automated backups
# ElastiCache Redis
# S3 for static files and media
# CloudFront CDN
# Lambda for background jobs (optional)

# 2. Docker Containerization

# Dockerfile for backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]

# Dockerfile for frontend
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# docker-compose.yml for local development
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mysql://root:password@mysql:3306/aura_market
      REDIS_URL: redis://redis:6379
    depends_on:
      - mysql
      - redis
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: aura_market
    volumes:
      - mysql_data:/var/lib/mysql
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:

# 3. CI/CD Pipeline (GitHub Actions)

name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test
  
  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: docker build -t aura-market:latest .
      
      - name: Push to ECR
        run: |
          aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_REGISTRY
          docker tag aura-market:latest $ECR_REGISTRY/aura-market:latest
          docker push $ECR_REGISTRY/aura-market:latest
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service --cluster production --service api --force-new-deployment

# 4. Environment Configuration

# .env.production
NODE_ENV=production
DATABASE_URL=mysql://user:pass@rds-endpoint:3306/aura_market
REDIS_URL=redis://elasticache-endpoint:6379
JWT_SECRET=<your-very-long-secret-key>
STRIPE_API_KEY=<stripe-key>
CORS_ORIGIN=https://aura-market.com

# 5. Database Migrations

# Initial deployment
npm run db:migrate

# After changes
npm run db:migrate:new
npm run db:migrate

# 6. Monitoring & Logging

# CloudWatch logs
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

logger.info('Server started');

# 7. Health Checks

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    database: 'connected', // Check DB connection
    redis: 'connected'     // Check Redis connection
  });
});

# Load balancer checks /health every 10 seconds
# If fails 3 times, removes instance from pool
```

---

# REAL-WORLD SCENARIOS

## Q14: Handling Race Conditions in Cart

**Question:** "Two browser tabs add the same product to cart simultaneously. How do you prevent duplicate entries?"

**Answer:**

```javascript
// ❌ PROBLEM: Race condition
// Tab 1: GET /cart → empty
// Tab 2: GET /cart → empty
// Tab 1: POST /cart { product: 1 }
// Tab 2: POST /cart { product: 1 }
// Result: Two identical cart items!

// ✅ SOLUTION 1: Database unique constraint
CREATE TABLE cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  
  // Prevents duplicate user-product combinations
  UNIQUE KEY unique_user_product (user_id, product_id)
);

// ✅ SOLUTION 2: ON DUPLICATE UPDATE
app.post('/api/v1/cart/items', authMiddleware, asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  
  // Atomic: Insert or update if exists
  const [cartItem, created] = await CartItem.findOrCreate({
    where: { userId: req.user.id, productId },
    defaults: { quantity }
  });
  
  if (!created) {
    // Already exists, increment
    await cartItem.increment('quantity', { by: quantity });
    await cartItem.reload();
  }
  
  res.json({ status: 'success', data: { cartItem } });
}));

// ✅ SOLUTION 3: Optimistic Locking
const cartItem = await CartItem.findOne({
  where: { userId, productId }
});

if (cartItem) {
  // Update with version check
  const result = await CartItem.update(
    { quantity: cartItem.quantity + quantity, version: cartItem.version + 1 },
    {
      where: {
        id: cartItem.id,
        version: cartItem.version // Only update if version matches
      }
    }
  );
  
  if (result[0] === 0) {
    // Version mismatch, retry
    throw new APIError('Cart modified, please retry', 409, 'CONFLICT');
  }
}

// ✅ SOLUTION 4: Distributed Lock (Redis)
const redis = require('redis');
const Redlock = require('redlock');
const client = redis.createClient();
const redlock = new Redlock([client], {
  driftFactor: 0.01,
  retryCount: 3,
  retryDelay: 200
});

app.post('/api/v1/cart/items', authMiddleware, asyncHandler(async (req, res) => {
  const lockKey = `cart:${req.user.id}`;
  
  let lock;
  try {
    // Acquire lock
    lock = await redlock.lock(lockKey, 1000); // 1 second
    
    // Now safe to access
    let cartItem = await CartItem.findOne({
      where: { userId: req.user.id, productId: req.body.productId }
    });
    
    if (cartItem) {
      await cartItem.increment('quantity', { by: req.body.quantity });
    } else {
      cartItem = await CartItem.create({
        userId: req.user.id,
        productId: req.body.productId,
        quantity: req.body.quantity
      });
    }
    
    res.json({ status: 'success', data: { cartItem } });
  } catch (error) {
    if (error instanceof Redlock.LockError) {
      throw new APIError('Cart is busy, please retry', 429, 'RETRY_LATER');
    }
    throw error;
  } finally {
    // Release lock
    if (lock) await lock.unlock().catch(() => {});
  }
}));

// RECOMMENDED: Solution 1 (database unique constraint)
// It's simple, no external dependencies, and handles most cases
// For high contention (10k+ concurrent), use Solution 4 (Redlock)
```

---

## Q15: Handling Inventory Depletion Under Load

**Question:** "Product has 10 units. 100 users try to buy simultaneously. How do you ensure only 10 succeed?"

**Answer:**

```javascript
// ❌ PROBLEM: Overselling
// All 100 users see stock=10
// All 100 place orders
// Result: 100 orders for 10 units!

// ✅ SOLUTION: Optimistic Locking
app.post('/api/v1/orders', authMiddleware, asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    for (const item of req.body.items) {
      const product = await Product.findByPk(item.productId, {
        transaction,
        lock: transaction.LOCK.UPDATE // Row-level lock
      });
      
      if (product.stock < item.quantity) {
        throw new APIError(
          `Only ${product.stock} units available`,
          400,
          'INSUFFICIENT_STOCK'
        );
      }
      
      // Atomically deduct stock
      await product.decrement('stock', {
        by: item.quantity,
        transaction
      });
    }
    
    // Create order
    const order = await Order.create(req.body, { transaction });
    
    await transaction.commit();
    res.json({ status: 'success', data: { order } });
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}));

// DATABASE EXECUTION:
// SELECT * FROM products WHERE id = 1 FOR UPDATE; -- Lock the row
// IF stock >= 5 THEN
//   UPDATE products SET stock = stock - 5 WHERE id = 1;
//   COMMIT; -- Others wait for lock
// END IF;

// RESULT:
// - First 10 orders succeed
// - 11th order fails: "Only 0 units available"
// - Row lock ensures serial execution
```

---

## Q16: Handling Concurrent Checkout (Double Charging)

**Question:** "User clicks 'Pay' button twice before page redirects. How to prevent double charges?"

**Answer:**

```javascript
// ❌ PROBLEM: Idempotency missing
// Click 1: POST /checkout → Payment successful
// Click 2: POST /checkout → Another payment!
// Result: User charged twice

// ✅ SOLUTION: Idempotency Key
app.post('/api/v1/checkout', authMiddleware, asyncHandler(async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];
  
  if (!idempotencyKey) {
    throw new APIError('Idempotency-Key header required', 400, 'MISSING_IDEMPOTENCY_KEY');
  }
  
  // Check if request already processed
  const existingCheckout = await CheckoutRequest.findOne({
    where: { idempotencyKey }
  });
  
  if (existingCheckout) {
    // Return cached response
    return res.json(existingCheckout.response);
  }
  
  try {
    const transaction = await sequelize.transaction();
    
    // ... Process checkout ...
    
    const order = await Order.create(orderData, { transaction });
    
    // Store request + response for idempotency
    await CheckoutRequest.create({
      idempotencyKey,
      userId: req.user.id,
      response: { status: 'success', data: { order } }
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      status: 'success',
      data: { order }
    });
    
  } catch (error) {
    // Don't cache errors
    throw error;
  }
}));

// FRONTEND: Generate unique key and retry
const generateIdempotencyKey = () => {
  return `${userId}-${Date.now()}-${Math.random()}`;
};

const handleCheckout = async () => {
  const idempotencyKey = generateIdempotencyKey();
  
  try {
    const response = await api.post('/checkout', {
      cartItems,
      shippingAddress,
      paymentMethod
    }, {
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    });
    
    // Success
  } catch (error) {
    if (error.response?.status === 409 || error.response?.status === 500) {
      // Retry with same key
      setTimeout(() => handleCheckout(), 1000);
    }
  }
};

// Even better: Disable button immediately
const [isProcessing, setIsProcessing] = useState(false);

<button 
  onClick={handleCheckout}
  disabled={isProcessing}
>
  {isProcessing ? 'Processing...' : 'Pay'}
</button>
```

---

# COMMON INTERVIEW PATTERNS

## Pattern 1: "Build This Feature"

**Approach:**
1. **Clarify requirements** - Ask 5 questions
2. **Define API** - REST endpoints
3. **Design database** - Schema with indexes
4. **Implement backend** - Logic with error handling
5. **Implement frontend** - UI with loading/error states
6. **Test** - Edge cases, race conditions
7. **Optimize** - Caching, pagination, indexing

**Example:** Build a product review system

```
1. CLARIFY:
   - Anonymous reviews or require login? → Require login
   - Rating required? → Yes, 1-5 stars
   - Moderation? → Flag inappropriate reviews
   - Can edit reviews? → Yes, anytime
   - Sort by? → Recent first, or helpful first?

2. API:
   POST   /api/reviews
   GET    /api/products/:id/reviews
   PATCH  /api/reviews/:id
   DELETE /api/reviews/:id

3. DATABASE:
   reviews (id, product_id, user_id, rating, comment, helpful_count, flagged)
   Indexes: (product_id, rating), (user_id)

4. BACKEND:
   - Validate rating (1-5)
   - Check user hasn't already reviewed
   - Paginate results
   - Calculate average rating

5. FRONTEND:
   - Star rating input
   - Character count for comment
   - Show average rating
   - Pagination for reviews

6. TESTING:
   - Two reviews by same user? Fail
   - Invalid rating? Fail
   - Rate limit? 1 review per 10 seconds

7. OPTIMIZATION:
   - Cache average rating
   - Denormalize rating in products table
   - Paginate by 20 per page
```

---

# HANDS-ON CHECKLIST

Complete these to be 100% interview-ready:

**Frontend:**
- [ ] Build useAsync hook (fetch with states)
- [ ] Build useCart hook (Redux abstraction)
- [ ] Implement checkout form with validation
- [ ] Add error boundaries
- [ ] Optimize components (memo, useCallback)
- [ ] Implement pagination UI
- [ ] Add loading skeletons
- [ ] Handle token refresh

**Backend:**
- [ ] Design full REST API
- [ ] Implement authentication (JWT + refresh tokens)
- [ ] Add error handling middleware
- [ ] Implement pagination, filtering, sorting
- [ ] Add rate limiting
- [ ] Implement transactions (checkout)
- [ ] Setup message queue (orders)
- [ ] Add health checks

**Database:**
- [ ] Design complete schema
- [ ] Add indexes for performance
- [ ] Write optimized queries
- [ ] Implement eager loading
- [ ] Handle N+1 queries

**Security:**
- [ ] Parameterized queries
- [ ] CSRF token validation
- [ ] Input sanitization
- [ ] Security headers
- [ ] Rate limiting
- [ ] Password hashing (bcrypt)
- [ ] Authorization checks

**System Design:**
- [ ] Design for 10k users
- [ ] Plan caching strategy
- [ ] Setup read replicas
- [ ] Implement message queues
- [ ] Monitor and alert setup

---

## Final Interview Tips

**Your 4-Year Experience Advantage:**
1. **You know PHP** → Talk about Laravel patterns, Eloquent ORM
2. **You know MySQL** → Discuss schema design, query optimization
3. **You know JavaScript** → Connect React to backend concepts
4. **You've built full-stack** → Show thinking about scalability

**Answer Pattern:**
> "For [requirement], I'd first consider the scale and constraints. If [scenario], I'd use [solution] because [trade-offs]. For example, in Aura Market, I [specific implementation]. Let me walk you through the code..."

**Red Flags to Avoid:**
- ❌ Saying "I don't know" without thinking
- ❌ Choosing tools randomly
- ❌ Forgetting error cases
- ❌ Missing security considerations
- ❌ Not asking clarifying questions

**Green Flags:**
- ✅ Ask clarifying questions
- ✅ Consider scale and constraints
- ✅ Mention trade-offs
- ✅ Handle error cases
- ✅ Include security
- ✅ Show code examples
- ✅ Walk through your thinking

Good luck! 🚀
