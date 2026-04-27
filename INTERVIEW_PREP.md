# React Interview Preparation Guide (4+ YOE Level)

*Using Aura Market Project as Practical Examples*

---

## Table of Contents
1. [Fundamentals (Must Know)](#fundamentals)
2. [Intermediate Concepts](#intermediate)
3. [Advanced Patterns](#advanced)
4. [Performance & Optimization](#performance)
5. [State Management](#state-management)
6. [Common Interview Questions](#common-questions)
7. [Red Flags & Best Practices](#red-flags)
8. [Follow-up Questions to Ask](#follow-up-questions)
9. [Hands-On Topics & Exercises](#hands-on-topics)
10. [Quick Reference](#quick-reference)

---

# FUNDAMENTALS

## Q1: Explain React Hooks. Why were they introduced?

**Answer:**
Hooks let you use state and side effects in functional components without class components.

**Why Introduced:**
- Reuse stateful logic without wrapper hell (render props, HOC patterns)
- Simpler mental model than class lifecycle methods
- Cleaner code organization by feature, not lifecycle

**Project Example - `useLocalStorage` Hook:**
```javascript
// src/hooks/useLocalStorage.js
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
```

**Interview Talking Point:**
"This hook encapsulates localStorage sync logic. Any component can call `useLocalStorage('theme', 'light')` and get reactive state that persists. This prevents boilerplate in every component that needs persistence."

---

## Q2: What's the difference between useState and useReducer? When use each?

**Answer:**

| useState | useReducer |
|----------|-----------|
| Simple state updates | Complex state with multiple related updates |
| Synchronous | Handle complex action logic |
| Lightweight | Testable reducer functions |

**Project Example:**

**useState Used In Header.jsx:**
```javascript
const [searchValue, setSearchValue] = useState('');
// Simple state, simple update
```

**useReducer Would Be Better For:**
Complex cart state in Redux is like a built-in useReducer pattern:
```javascript
// src/features/cart/slices/cartSlice.js
const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], isOpen: false },
  reducers: {
    addToCart: (state, action) => { /* ... */ },
    removeFromCart: (state, action) => { /* ... */ },
    updateQuantity: (state, action) => { /* ... */ },
    clearCart: (state) => { /* ... */ }
  }
});
```

**When To Use What:**
- `useState`: `searchValue`, `isOpen`, `theme`
- `useReducer`/`Redux`: Cart items, filter state, user data (multiple interdependent updates)

---

## Q3: Explain useEffect dependency array. What happens without it?

**Answer:**

```javascript
// 1. No dependency array → runs after EVERY render (BAD)
useEffect(() => { fetchData(); });

// 2. Empty [] → runs ONCE on mount (good for initialization)
useEffect(() => { fetchData(); }, []);

// 3. [dependency] → runs when dependency changes
useEffect(() => { saveToStorage(items); }, [items]);

// 4. Cleanup function → runs on unmount or before re-run
useEffect(() => {
  const timer = setTimeout(() => removeNotification(id), 3000);
  return () => clearTimeout(timer);
}, [id]);
```

**Project Example - AppContext Theme Toggle:**
```javascript
// src/context/AppContext.jsx
useEffect(() => {
  // Apply theme to DOM + save to localStorage
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('aura_theme', theme);
}, [theme]); // ← Runs when theme changes
```

**Common Mistakes:**
```javascript
// ❌ WRONG: Missing dependency
useEffect(() => {
  const handleSearch = () => { 
    dispatch(searchProducts(searchValue)); // searchValue not in deps
  };
}, []);

// ✅ CORRECT
useEffect(() => {
  dispatch(searchProducts(searchValue));
}, [searchValue, dispatch]);
```

---

## Q4: Props vs State. When to use each?

**Answer:**

| Props | State |
|-------|-------|
| Data flowing DOWN (parent → child) | Data managed INSIDE component |
| Read-only | Mutable |
| For configuration | For dynamic data |

**Project Example - Header Component:**
```javascript
// src/components/layout/Header.jsx

const Header = () => {
  // STATE: managed here, internal to Header
  const [searchValue, setSearchValue] = useState('');
  
  // PROPS: would come from parent if Header needed configuration
  // const Header = ({ logoText, links }) => ...
  
  // Reading from Redux (like props but from store)
  const { theme, toggleTheme } = useApp();
  const cartCount = useSelector(selectCartCount);
};
```

**Data Flow Pattern:**
```
App (passes config as props)
  ↓
Layout (passes data as props)
  ↓
Header (manages internal search state)
  ↓
Search Input (reads from Header state)
```

---

## Q5: Explain Component Lifecycle. How does it translate to hooks?

**Answer:**

| Class Lifecycle | Hooks Equivalent |
|-----------------|-----------------|
| `componentDidMount` | `useEffect(() => {}, [])` |
| `componentDidUpdate` | `useEffect(() => {}, [deps])` |
| `componentWillUnmount` | `useEffect(() => { return () => {} })` |
| `shouldComponentUpdate` | `useMemo`, `useCallback` |
| `getDerivedStateFromProps` | State setter logic in render |

**Project Example - ErrorBoundary (still uses class):**
```javascript
// src/components/common/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
}
```

**Why Class Component Here?** Error boundaries haven't been implemented for functional components yet (hooks don't have equivalents). This is a valid use case for class components.

---

# INTERMEDIATE CONCEPTS

## Q6: Explain Context API. When NOT to use it?

**Answer:**

Context is for **passing data through multiple levels without prop drilling**.

**Use Context When:**
- UI theme/dark mode ✅
- User authentication ✅
- Language/i18n ✅
- Notifications system ✅

**DON'T Use Context When:**
- High-frequency updates (re-renders entire tree) ❌
- Complex state with many related updates ❌ → Use Redux
- Global domain data (cart, products) ❌ → Use Redux
- Performance-critical state ❌ → Use Redux + selectors

**Project Example - Correct Use:**
```javascript
// src/context/AppContext.jsx
const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(...);
  const [notifications, setNotifications] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const value = { theme, toggleTheme, notifications, ... };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Used in Header, Layout for UI-level state
const { theme, toggleTheme } = useApp();
```

**Why Not Redux Here?**
Theme/notifications change infrequently. If you put it in Redux, you'd add 5 extra files for something that's purely UI chrome.

---

## Q7: Controlled vs Uncontrolled Components

**Answer:**

**Controlled:** React state manages input value
```javascript
// src/components/layout/Header.jsx
const [searchValue, setSearchValue] = useState('');

<input 
  value={searchValue}
  onChange={(e) => setSearchValue(e.target.value)}
/>
```
✅ Predictable, testable, can validate in real-time

**Uncontrolled:** DOM manages input value
```javascript
const inputRef = useRef();
<input ref={inputRef} />
// Later: inputRef.current.value
```
❌ Less predictable, harder to test, for file uploads/native elements

**Interview Answer:**
"Always use controlled components for business logic - search, filters, forms. Use uncontrolled only for file uploads or integrating with third-party libraries."

---

## Q8: What is prop drilling? How to avoid it?

**Answer:**

**Prop Drilling:** Passing props through many levels even if intermediate components don't need them.

```javascript
// ❌ BAD: drilling theme through many levels
<App theme="dark">
  <Layout theme={theme}>
    <Header theme={theme}>
      <ThemeToggle theme={theme} />
    </Header>
  </Layout>
</App>
```

**Solutions:**

1. **Context API** (UI state):
```javascript
// ✅ GOOD: Theme via Context
const App = () => <AppProvider><Layout /></AppProvider>;

// Inside any component:
const { theme } = useApp();
```

2. **Redux** (domain state):
```javascript
// ✅ GOOD: Cart via Redux
const cartCount = useSelector(selectCartCount);
```

3. **Composition** (pass components as children):
```javascript
// ✅ GOOD: Avoid drilling entirely
<Layout header={<Header />} />
```

**Project Pattern:**
The project uses Context for theme (low-frequency UI state) and Redux for cart (high-frequency domain state). Perfect balance!

---

## Q9: Explain React.memo and when to use it

**Answer:**

`React.memo` prevents re-render if props haven't changed.

```javascript
// Without memo: re-renders every time parent renders
const ProductCard = ({ product, onAddToCart }) => (
  <div onClick={() => onAddToCart(product)}>
    {product.title}
  </div>
);

// With memo: only re-renders if product/onAddToCart changes
const ProductCard = React.memo(({ product, onAddToCart }) => (
  <div onClick={() => onAddToCart(product)}>
    {product.title}
  </div>
));
```

**Gotcha:**
```javascript
// ❌ PROBLEM: inline function new reference every render
<ProductCard product={p} onAddToCart={() => dispatch(addToCart(p))} />

// ✅ SOLUTION: useCallback memoizes function
const handleAddToCart = useCallback(
  (product) => dispatch(addToCart(product)),
  [dispatch]
);
<ProductCard product={p} onAddToCart={handleAddToCart} />
```

**When to Use:**
- ✅ Components that render lists (ProductCard in Shop)
- ✅ Expensive computations
- ❌ NOT needed for simple components
- ❌ Premature optimization

---

## Q10: Explain closures in React. Why do they matter?

**Answer:**

Closures capture variables from surrounding scope.

**Project Example - useLocalStorage:**
```javascript
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = (value) => {
    // setValue "closes over" the key variable
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue];
}

// When called: useLocalStorage('aura_theme', 'light')
// setValue still has access to 'key' = 'aura_theme'
```

**Common Closure Bug - Stale Closure:**
```javascript
// ❌ WRONG: useEffect dependency missing
const CartDrawer = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // cartItems is stale! It's from the first render
      console.log(cartItems.length);
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []); // ← missing cartItems dependency
};

// ✅ CORRECT
useEffect(() => {
  // ...
}, [cartItems]);
```

**Interview Answer:**
"Closures are fundamental to how React works. Every hook is a closure capturing component state and context. Missing dependencies in useEffect happen because people forget that event handlers close over stale state."

---

# ADVANCED PATTERNS

## Q11: Compound Components Pattern

**Answer:**

Compound components are a set of components that work together as a cohesive unit.

```javascript
// Example structure (not in your project, but common pattern)
<Card>
  <Card.Header title="Cart" />
  <Card.Body items={cartItems} />
  <Card.Footer onCheckout={handleCheckout} />
</Card>
```

**Benefits:**
- Flexible composition
- Better encapsulation than lots of props
- Explicit component structure

**Project Equivalent - CartDrawer Structure:**
```javascript
// src/components/layout/CartDrawer.jsx could be refactored to:
<CartDrawer>
  <CartDrawer.Header />
  <CartDrawer.Items />
  <CartDrawer.Total />
  <CartDrawer.Checkout />
</CartDrawer>
```

**Interview Pattern to Mention:**
"I use compound components for complex UI elements like modals, dropdowns, or sidebars. It makes the API clearer than passing 10 props."

---

## Q12: Render Props Pattern

**Answer:**

Pass a function as a prop that returns JSX.

```javascript
// Example: Render props for data fetching
<DataFetcher url="/products" render={products => (
  <ProductList items={products} />
)} />
```

**Your Project Uses Higher-Order Components Instead:**
```javascript
// src/components/common/withAuth.jsx (scaffold)
export const withAuth = (Component) => {
  return (props) => {
    const isAuthenticated = // check auth
    return isAuthenticated ? <Component {...props} /> : <Redirect />;
  };
};

// Usage: const ProtectedShop = withAuth(Shop);
```

**Why HOCs Over Render Props Here?**
- Cleaner syntax for wrapping routes
- Easy to apply multiple HOCs: `withAuth(withErrorBoundary(Shop))`

**Interview Answer:**
"Both patterns solve component composition. Render props are flexible but create nested JSX hell. HOCs are cleaner but have naming collisions. Modern React prefers custom hooks which are simpler."

---

## Q13: Custom Hooks - Creating Reusable Logic

**Answer:**

Extract component logic into functions that use hooks.

**Project Example - useLocalStorage Hook:**
```javascript
// src/hooks/useLocalStorage.js
export default function useLocalStorage(key, initialValue) {
  const readValue = () => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState(readValue);

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
```

**Benefits:**
- ✅ Reusable across components
- ✅ Testable logic
- ✅ Separated concerns

**Interview Answer:**
"Custom hooks are how I extract common logic. Any time I see state + effect logic repeated, I extract it to a hook. For example, useLocalStorage encapsulates all localStorage sync logic with error handling, so components just use `const [value, setValue] = useLocalStorage('key')`."

---

## Q14: Higher-Order Components (HOC)

**Answer:**

Function that takes a component and returns a new component with extra functionality.

```javascript
// Pattern: withFeature(Component)
const withAuth = (Component) => {
  return (props) => {
    const isAuthenticated = useAuth();
    
    if (!isAuthenticated) {
      return <Redirect to="/login" />;
    }
    
    return <Component {...props} />;
  };
};

// Usage:
const ProtectedShop = withAuth(Shop);
```

**Project Use Case:**
```javascript
// src/components/common/withAuth.jsx (scaffolding ready)
// Could be used:
const ProtectedCart = withAuth(CartDrawer);
```

**Comparison:**

| HOC | Custom Hook | Render Props |
|-----|-------------|--------------|
| Wraps component | Extracts logic | Passes function |
| `withAuth(Shop)` | `useAuth()` | `<Auth render={() => {}}` |

**Modern Preference:** Custom hooks > render props > HOC

---

# PERFORMANCE & OPTIMIZATION

## Q15: Explain Code Splitting and Lazy Loading

**Answer:**

Split bundle into smaller chunks, load only when needed.

**Project Implementation:**
```javascript
// src/App.jsx - Code Splitting
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}
```

**Benefits:**
- ✅ Shop page only loaded when user navigates to /
- ✅ ProductDetail only loaded when user clicks a product
- ✅ Smaller initial bundle → faster first paint
- ✅ LoadingScreen shown while chunk is being fetched

**Interview Answer:**
"For a marketplace with multiple pages, I use lazy loading per route. When the user navigates to a new page, React loads only that page's code. This reduces initial bundle size significantly - Shop and ProductDetail are only in the user's browser when they actually need them."

---

## Q16: useMemo and useCallback - When to use?

**Answer:**

Memoize expensive computations to prevent re-calculations.

**useMemo:** Memoize computed values
```javascript
// ❌ PROBLEM: recalculates on every render
const cartTotal = cartItems.reduce((sum, item) => 
  sum + (item.price * item.quantity), 0
);

// ✅ SOLUTION: use Redux selector (automatically memoized)
export const selectCartTotal = (state) => 
  state.cart.items.reduce((total, item) => 
    total + item.price * item.quantity, 0
  );
```

**useCallback:** Memoize functions
```javascript
// ❌ PROBLEM: new function every render
<Header 
  onSearch={(query) => dispatch(searchProducts(query))} 
/>

// ✅ SOLUTION: wrap in useCallback
const handleSearch = useCallback(
  (query) => dispatch(searchProducts(query)),
  [dispatch]
);
<Header onSearch={handleSearch} />
```

**When NOT to use:** Don't prematurely optimize! Only use if:
- Component renders frequently
- Computation is expensive
- Child components are wrapped in React.memo

---

## Q17: Why did you use Redux Toolkit instead of plain Redux?

**Answer:**

Redux Toolkit (RTK) solves common Redux pain points:

| Plain Redux | Redux Toolkit |
|-------------|--------------|
| Boilerplate (action types, action creators, reducers) | Less code, auto-generated |
| Manual immutability | Immer integrated (can "mutate" directly) |
| Verbose async setup | createAsyncThunk |
| DevTools manual | Auto-enabled |

**Project Implementation:**
```javascript
// src/features/product/slices/productSlice.js
const productSlice = createSlice({
  name: 'products',
  initialState: { items: [], status: 'idle' },
  reducers: {
    setCategory: (state, action) => {
      // Immer handles immutability - looks like mutation
      state.category = action.payload;
      state.filteredItems = state.items.filter(...);
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload;
    });
  }
});
```

**vs Plain Redux (before):**
```javascript
// ❌ Old Way
const SET_CATEGORY = 'SET_CATEGORY';
const setCategory = (category) => ({ type: SET_CATEGORY, payload: category });
const productReducer = (state, action) => {
  switch(action.type) {
    case SET_CATEGORY:
      return { ...state, category: action.payload };
  }
};
```

**Interview Answer:**
"Redux Toolkit reduces boilerplate by 80%. With createSlice, I define the state shape, reducers, and selectors all together. Immer lets me write 'mutations' that are automatically converted to immutable updates. For async data (products, cart), createAsyncThunk handles the loading/success/error states automatically."

---

## Q18: Selector Pattern in Redux

**Answer:**

Selectors extract data from Redux state. They're testable and memoize automatically with Redux Toolkit.

**Project Examples:**
```javascript
// src/features/cart/slices/cartSlice.js
export const selectCartItems = (state) => state.cart.items;

export const selectCartTotal = (state) => 
  state.cart.items.reduce((total, item) => 
    total + item.price * item.quantity, 0
  );

export const selectCartCount = (state) => 
  state.cart.items.reduce((count, item) => 
    count + item.quantity, 0
  );
```

**Usage in Component:**
```javascript
// src/components/layout/Header.jsx
const cartCount = useSelector(selectCartCount);
// Only re-renders if cartCount changes
```

**Why Selectors?**
1. Centralized state access
2. Memoization prevents unnecessary re-renders
3. Easy to test
4. Single source of truth for computed values

**Interview Answer:**
"I always create explicit selectors for derived state. Instead of computing `cartTotal` in every component that needs it, I define it once in the slice. The component just uses `useSelector(selectCartTotal)`. This way, if the computation changes, I update one place, not ten components."

---

# STATE MANAGEMENT

## Q19: When to use Redux vs Context API vs Local State?

**Answer:**

Choose based on state characteristics:

| Type | Use Case | Example |
|------|----------|---------|
| **Local State** | Component-specific, low frequency | search input, form fields |
| **Context API** | Cross-cutting UI concerns, low-mid frequency | theme, language, notifications |
| **Redux** | Shared domain data, high frequency, complex updates | cart, products, user profile |

**Project Pattern:**
```javascript
// Local State - simple toggle
const [searchValue, setSearchValue] = useState('');

// Context API - UI chrome, low frequency
const { theme, toggleTheme, notifications } = useApp();

// Redux - domain data, complex updates
const cartItems = useSelector(selectCartItems);
const cartTotal = useSelector(selectCartTotal);
const filteredProducts = useSelector(state => state.products.filteredItems);
```

**Decision Tree:**
```
Is it shared between many components?
  NO → Local State
  YES → Does it update frequently (>100x/sec)?
    NO → Context API
    YES → Redux
```

**Interview Answer:**
"The key is matching state management complexity to state complexity. Using Redux for theme is overkill. Using local state for cart would cause prop drilling hell. I analyze the state: if it's shared and changes frequently, Redux. If it's UI-level and low-frequency, Context. If it's isolated, useState."

---

## Q20: Async State Management - Patterns and Anti-patterns

**Answer:**

How to handle API calls, loading, errors, caching.

**Project Pattern - createAsyncThunk:**
```javascript
// src/features/product/slices/productSlice.js
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800)); // simulate API
      return productsData;
    } catch (error) {
      return rejectWithValue('Failed to load products');
    }
  }
);

// Automatic handling of pending/fulfilled/rejected states
extraReducers: (builder) => {
  builder
    .addCase(fetchProducts.pending, (state) => {
      state.status = 'loading';
    })
    .addCase(fetchProducts.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.items = action.payload;
    })
    .addCase(fetchProducts.rejected, (state, action) => {
      state.status = 'failed';
      state.error = action.payload;
    });
}
```

**Anti-patterns to avoid:**
```javascript
// ❌ WRONG: Not handling loading/error states
const products = useSelector(state => state.products.items);
// No loading indicator, no error message

// ❌ WRONG: Multiple API calls with same data
useEffect(() => { fetchProducts(); }, []); // Shop.jsx
useEffect(() => { fetchProducts(); }, []); // ProductDetail.jsx

// ✅ CORRECT: Check if already loaded
export const selectProducts = (state) => {
  if (state.products.status === 'idle') {
    // Trigger fetch
  }
  return state.products.items;
};
```

**Interview Answer:**
"For async data, I use Redux Thunk with proper state tracking: idle → loading → succeeded/failed. This gives me fine-grained control over UI feedback. Never skip loading states - users need to know what's happening. Also, prevent multiple requests for the same data by checking state."

---

# COMMON INTERVIEW QUESTIONS

## Q21: Tell me about your React architecture in Aura Market

**Perfect Answer:**

"Aura Market is an e-commerce marketplace demonstrating enterprise React patterns. Here's my architecture:

**State Management - Hybrid Approach:**
- **Redux:** For complex shared state (cart, products). Using Redux Toolkit with createSlice and createAsyncThunk. This handles async data fetching, filtering, and normalization.
- **Context API:** For UI chrome (theme, notifications, sidebar). These are low-frequency updates that don't need Redux complexity.
- **Local State:** For component-scoped state like search input or form fields.

**Code Organization - Feature-Based:**
I structure files by feature, not layers. Each feature (cart, product, auth) has its own folder with slices, components, hooks, and services. This makes scaling easier - adding a new feature means adding a new folder, not touching five different directories.

**Performance Optimizations:**
- Code splitting with React.lazy and Suspense for route-based pages
- Selector memoization to prevent unnecessary re-renders
- Proper Redux selector pattern (selectCartTotal, selectCartCount)
- localStorage persistence for cart without server calls

**Error Handling:**
- ErrorBoundary for render errors
- Try-catch in hooks for safe localStorage access
- Redux error state tracking

**Reusable Patterns:**
- Custom hooks (useLocalStorage) for encapsulating logic
- HOC scaffolding (withAuth) for route protection
- Compound component structure for Layout

**Why This Approach?**
It scales from small teams to large projects. Each developer can work on a feature without touching others. Clear separation of concerns means bugs are isolated. And the hybrid state management - not over-engineering with Redux for everything - keeps the codebase lean."

---

## Q22: How would you add TypeScript to this project?

**Answer:**

"I'd add TypeScript incrementally:

1. Install dependencies:
\`\`\`bash
npm install --save-dev typescript @types/react @types/react-dom @types/node
\`\`\`

2. Create tsconfig.json with strict mode
3. Rename .jsx to .tsx files
4. Add types to Redux slices:

\`\`\`typescript
// src/features/cart/slices/cartSlice.ts
interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: loadCartFromStorage(),
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      // now type-safe
    }
  }
});
\`\`\`

5. Add types to custom hooks:

\`\`\`typescript
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // now type-safe
}
\`\`\`

**Benefits:**
- ✅ Catch errors at compile time, not runtime
- ✅ Better IDE autocomplete and refactoring
- ✅ Self-documenting code through types
- ✅ Easier onboarding for new developers

**Interview Answer:** 'I'd add TypeScript incrementally, not all at once. Start with strict mode disabled, migrate files gradually, then enable strict mode when critical files are typed. This prevents a 2-week rewrite and lets the team adapt.'"

---

## Q23: How would you optimize this project further?

**Answer:**

"Several improvements I'd make:

1. **Replace manual async with React Query:**
\`\`\`javascript
// Instead of createAsyncThunk
import { useQuery } from '@tanstack/react-query';

const { data: products, isLoading, error } = useQuery({
  queryKey: ['products'],
  queryFn: () => api.getProducts(),
  staleTime: 5 * 60 * 1000, // cache for 5 min
});
\`\`\`
Benefit: Automatic caching, retry logic, background refetching

2. **Image Optimization:**
- Use next/image or img with srcset for responsive images
- WebP format with fallbacks
- Lazy loading for below-fold images

3. **Testing:**
- Jest + React Testing Library for components
- Redux store tests for reducers
- E2E tests with Playwright

4. **Add Pagination:**
Currently loading all products at once. For thousands of products, add pagination.

5. **Implement Real Payments:**
The useRazorpay hook is scaffolding - integrate with actual Razorpay API

6. **Performance Monitoring:**
- Add Sentry for error tracking
- Web Vitals to monitor Lighthouse scores

7. **Accessibility:**
- Add ARIA labels (partially done)
- Keyboard navigation for cart drawer
- Screen reader testing

**Interview Pattern:**
'After building the MVP, I'd focus on these areas: performance (monitoring with Web Vitals), reliability (error tracking with Sentry), user experience (accessibility testing), and developer experience (better testing).'
"

---

## Q24: Explain your error handling strategy

**Answer:**

"I use a layered error handling approach:

**Layer 1 - Component Level (ErrorBoundary):**
\`\`\`javascript
// src/components/common/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Could send to Sentry here
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
\`\`\`

**Layer 2 - Redux Async (state tracking):**
\`\`\`javascript
// Track loading/error states in Redux
state: { status: 'idle' | 'loading' | 'succeeded' | 'failed', error: null | string }

// In component:
{status === 'failed' && <ErrorMessage error={error} retry={fetchProducts} />}
{status === 'loading' && <LoadingSpinner />}
{status === 'succeeded' && <ProductList items={items} />}
\`\`\`

**Layer 3 - Hook Level (try-catch):**
\`\`\`javascript
// src/hooks/useLocalStorage.js
const setValue = (value) => {
  try {
    // ... save logic
  } catch (error) {
    console.warn(\`Error setting localStorage key '\${key}':\`, error);
    // Graceful degradation - app still works
  }
};
\`\`\`

**Layer 4 - Context (User Notifications):**
\`\`\`javascript
// Show errors to users via toast notifications
const addNotification = (message, type = 'info') => {
  setNotifications(prev => [...prev, { id: Date.now(), message, type }]);
};

// Usage: addNotification('Failed to add to cart', 'error');
\`\`\`

**Interview Answer:**
'I use a layered approach: ErrorBoundary catches render errors, Redux tracks async state (loading/failed), hooks use try-catch for risky operations, and Context notifies users. This way, errors never crash the app - they're either recovered gracefully or shown to the user with actionable messages.'"

---

## Q25: How do you handle large lists efficiently?

**Answer:**

"For large product lists, I'd use virtualization:

**Current Issue:**
If we had 10,000 products, rendering them all would cause:
- Large DOM
- Slow initial render
- High memory usage

**Solution: React Virtualization**
\`\`\`javascript
import { FixedSizeList as List } from 'react-window';

const ProductList = ({ products }) => {
  return (
    <List
      height={600}
      itemCount={products.length}
      itemSize={150}
      width=\"100%\"
    >
      {({ index, style }) => (
        <ProductCard style={style} product={products[index]} />
      )}
    </List>
  );
};
\`\`\`

**How it works:**
- Only renders visible items (e.g., 10 products in viewport)
- Reuses DOM nodes as user scrolls
- Renders new items for off-screen areas

**Other optimizations for lists:**
1. Pagination (load 50 at a time, not 10,000)
2. Filtering (server-side for large datasets)
3. Memoization (React.memo for ProductCard)
4. Unique stable keys (id, not index)

**Interview Answer:**
'For large lists, never render all items. Use virtualization libraries like react-window to render only visible items. Or use pagination - load data in chunks. The key principle: render only what the user sees.'"

---

# RED FLAGS & BEST PRACTICES

## Q26: Common React Mistakes and How to Fix Them

**Answer:**

### Mistake 1: Missing Dependencies in useEffect
```javascript
// ❌ WRONG - searchValue is stale
useEffect(() => {
  api.search(searchValue);
}, []);

// ✅ CORRECT
useEffect(() => {
  api.search(searchValue);
}, [searchValue]);
```

### Mistake 2: Setting State in Render
```javascript
// ❌ WRONG - causes infinite loop
function ProductDetail() {
  const [products, setProducts] = useState([]);
  setProducts(data); // RUNS EVERY RENDER
}

// ✅ CORRECT - use effect
useEffect(() => {
  setProducts(data);
}, [data]);
```

### Mistake 3: Key Prop with Array Index
```javascript
// ❌ WRONG - items reordering breaks identity
{items.map((item, index) => <Item key={index} {...item} />)}

// ✅ CORRECT - use stable unique ID
{items.map((item) => <Item key={item.id} {...item} />)}
```

### Mistake 4: Mutating Props
```javascript
// ❌ WRONG
function CartItem({ item }) {
  item.quantity += 1; // Directly mutate
}

// ✅ CORRECT - Redux dispatch
const dispatch = useDispatch();
dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }));
```

### Mistake 5: Props Prop Drilling
```javascript
// ❌ WRONG - drilling through 5 levels
<App theme={theme} setTheme={setTheme} user={user} cart={cart} />

// ✅ CORRECT - use Redux/Context
<AppProvider>...</AppProvider>
```

---

## Q27: React Performance Red Flags

**Interview Red Flags to Mention:**

❌ **Storing derived state:**
```javascript
const [allProducts, setAllProducts] = useState([]);
const [filteredProducts, setFilteredProducts] = useState([]);
// Problem: duplicate data, sync issues
```

✅ **Computed from single source:**
```javascript
const filteredProducts = useMemo(
  () => allProducts.filter(...),
  [allProducts, filterCriteria]
);
```

---

❌ **Creating functions in render:**
```javascript
<CartItem onRemove={() => dispatch(remove(id))} />
// New function every render, breaks React.memo
```

✅ **Memoize with useCallback:**
```javascript
const handleRemove = useCallback(
  () => dispatch(remove(id)),
  [id, dispatch]
);
```

---

❌ **Missing Redux selectors:**
```javascript
const { cart } = useSelector(state => state);
// Re-renders whenever any cart property changes
```

✅ **Specific selectors:**
```javascript
const cartItems = useSelector(selectCartItems);
// Re-renders only when cartItems changes
```

---

# FOLLOW-UP QUESTIONS TO ASK

## During Your Interview, Ask These Questions:

1. **"What's your testing strategy?"** 
   - Shows you care about reliability

2. **"How do you handle state management at scale?"**
   - Signals thinking about architecture

3. **"What are the performance requirements?"**
   - Helps you propose appropriate solutions

4. **"How is error tracking handled?"**
   - Shows maturity (Sentry, LogRocket, etc.)

5. **"What's the deployment pipeline?"**
   - Understanding CI/CD shows ops awareness

6. **"How do you handle analytics?"**
   - Shows product thinking

7. **"What's the testing coverage?"**
   - Indicates code quality expectations

8. **"How are environment-specific configs managed?"**
   - (.env files, secrets, etc.)

---

# HANDS-ON TOPICS & EXERCISES

Build these hands-on skills to actually DO what you talk about in interviews.

## Exercise 1: Create a Custom Hook (Difficulty: Easy)

**Goal:** Extract reusable logic into a custom hook

**Task:** Create `useAsync` hook for fetching data

```javascript
// src/hooks/useAsync.js
import { useState, useEffect } from 'react';

export function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = async () => {
    setStatus('pending');
    setData(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (error) {
      setError(error);
      setStatus('error');
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return { execute, status, data, error };
}
```

**Then use it:**
```javascript
// In ProductDetail.jsx
const { status, data: product, error } = useAsync(
  () => api.getProduct(id),
  true
);

return (
  <>
    {status === 'pending' && <Loading />}
    {status === 'success' && <Product item={product} />}
    {status === 'error' && <Error error={error} />}
  </>
);
```

**What you're learning:**
- ✓ Custom hook patterns
- ✓ Error handling in async
- ✓ State machine pattern (idle → pending → success/error)

---

## Exercise 2: Build a Custom Hook from Project Need

**Goal:** Create `useCart` hook to simplify cart operations

**Task:** Encapsulate cart logic from Redux

```javascript
// src/hooks/useCart.js
import { useDispatch, useSelector } from 'react-redux';
import { 
  addToCart, 
  removeFromCart, 
  updateQuantity,
  selectCartItems,
  selectCartTotal,
  selectCartCount
} from '../features/cart/slices/cartSlice';

export function useCart() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);

  return {
    items,
    total,
    count,
    add: (product) => dispatch(addToCart(product)),
    remove: (productId) => dispatch(removeFromCart(productId)),
    updateQty: (id, quantity) => dispatch(updateQuantity({ id, quantity })),
  };
}
```

**Usage is now clean:**
```javascript
// Before: useSelector, useDispatch everywhere
const items = useSelector(selectCartItems);
const dispatch = useDispatch();
dispatch(addToCart(product));

// After: Simple API
const { items, add } = useCart();
add(product);
```

**What you're learning:**
- ✓ Redux hook abstraction
- ✓ Cleaner component code
- ✓ Reusability across features

---

## Exercise 3: Refactor for Performance (Difficulty: Medium)

**Goal:** Identify and fix performance issues

**Task:** Add `React.memo` and `useCallback` to ProductCard

```javascript
// src/features/product/components/ProductCard.jsx
import React, { useCallback } from 'react';

// Step 1: Wrap with memo
const ProductCard = React.memo(({ product, onAddToCart, onViewDetail }) => {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.title} />
      <h3>{product.title}</h3>
      <p className="price">${product.price}</p>
      
      <button onClick={() => onViewDetail(product.id)}>
        View
      </button>
      <button onClick={() => onAddToCart(product)}>
        Add to Cart
      </button>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;

// Step 2: Use in parent with useCallback
// src/pages/Shop.jsx
const Shop = () => {
  const products = useSelector(state => state.products.filteredItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Memoize callbacks so ProductCard doesn't re-render
  const handleAddToCart = useCallback(
    (product) => dispatch(addToCart(product)),
    [dispatch]
  );

  const handleViewDetail = useCallback(
    (productId) => navigate(`/product/${productId}`),
    [navigate]
  );

  return (
    <div className="grid gap-4">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
          onViewDetail={handleViewDetail}
        />
      ))}
    </div>
  );
};
```

**Benchmark before/after:**
```javascript
// Install: npm install why-did-you-render
import whyDidYouRender from '@why-did-you-render/react';
whyDidYouRender(React, { logOnDifferentValues: true });

// Now open DevTools Console and see which components re-render unnecessarily
```

**What you're learning:**
- ✓ React.memo when/how to use
- ✓ useCallback with dependencies
- ✓ Performance debugging tools
- ✓ Why prop identity matters

---

## Exercise 4: Implement Error Boundary (Difficulty: Easy)

**Goal:** Handle component render errors gracefully

**Task:** Wrap your app routes with ErrorBoundary

```javascript
// src/components/common/ErrorBoundary.jsx (already exists, study it)
// NOW: Wrap routes to catch errors
// src/App.jsx

import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<ErrorBoundary><Shop /></ErrorBoundary>} />
              <Route path="/product/:id" element={<ErrorBoundary><ProductDetail /></ErrorBoundary>} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}
```

**Test it by throwing an error:**
```javascript
// src/pages/Shop.jsx - temporarily add this
throw new Error('Test error'); // See ErrorBoundary catch it!
```

**What you're learning:**
- ✓ Error boundaries prevent full app crashes
- ✓ How to test error scenarios
- ✓ Error recovery strategies

---

## Exercise 5: Form Handling with Validation (Difficulty: Medium)

**Goal:** Build a reusable form hook with validation

**Task:** Create `useForm` hook

```javascript
// src/hooks/useForm.js
import { useState, useCallback } from 'react';

export function useForm(initialValues, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        setErrors({ submit: error.message });
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setErrors,
  };
}
```

**Use in a checkout form:**
```javascript
// src/pages/Checkout.jsx
const Checkout = () => {
  const form = useForm(
    { email: '', address: '', cardNumber: '' },
    async (values) => {
      // Validate
      const errors = {};
      if (!values.email.includes('@')) errors.email = 'Invalid email';
      if (values.address.length < 10) errors.address = 'Address too short';
      if (values.cardNumber.length !== 16) errors.cardNumber = 'Invalid card';
      
      if (Object.keys(errors).length > 0) {
        throw new Error('Validation failed');
      }
      
      // Submit
      await api.checkout(values);
    }
  );

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        name="email"
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />
      {form.touched.email && form.errors.email && (
        <span className="error">{form.errors.email}</span>
      )}
      
      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Processing...' : 'Checkout'}
      </button>
    </form>
  );
};
```

**What you're learning:**
- ✓ Form state management
- ✓ Validation patterns
- ✓ Error handling in forms
- ✓ Controlled components best practices

---

## Exercise 6: State Management - Redux vs Context (Difficulty: Medium)

**Goal:** Understand when to use each pattern

**Task A - Add to Context:** User preferences (language, currency)
```javascript
// src/context/AppContext.jsx - EXTEND this
const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(...);
  const [language, setLanguage] = useState('en'); // ADD
  const [currency, setCurrency] = useState('USD'); // ADD

  const value = {
    theme, toggleTheme,
    language, setLanguage,
    currency, setCurrency,
    notifications, addNotification, removeNotification,
    isSidebarOpen, setIsSidebarOpen
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
```

**Task B - Add to Redux:** Order history (complex, frequent updates)
```javascript
// src/features/orders/slices/orderSlice.js - CREATE this
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchOrders = createAsyncThunk('orders/fetchOrders', async (userId) => {
  return api.getOrders(userId);
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { items: [], status: 'idle', error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.error = action.error.message;
        state.status = 'failed';
      });
  }
});

export default orderSlice.reducer;
```

**Question to answer:**
- Why Context for language but Redux for orders?
- Answer: Language changes ~1x per session (low frequency), orders query involves complex filtering, sorting, pagination (high frequency, complex state)

**What you're learning:**
- ✓ Making architectural decisions
- ✓ Understanding state complexity
- ✓ Knowing trade-offs

---

## Exercise 7: Code Splitting & Lazy Loading (Difficulty: Medium)

**Goal:** Reduce initial bundle size

**Task:** Already done in App.jsx, now VERIFY it works

```bash
# Run build and check bundle sizes
npm run build

# Output should show:
# dist/index.js        (main bundle)
# dist/Shop.*.js       (lazy loaded route)
# dist/ProductDetail.*.js (lazy loaded route)
```

**Now add Suspense fallback improvements:**
```javascript
// src/App.jsx - IMPROVE loading UI

const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));

// Better loading screen
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    <p className="text-sm text-muted-foreground">Loading page...</p>
  </div>
);

const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <p className="text-red-500">Failed to load page</p>
    <button onClick={resetErrorBoundary}>Retry</button>
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </Router>
  );
}
```

**What you're learning:**
- ✓ Bundle analysis
- ✓ Lazy loading patterns
- ✓ Suspense with error boundaries
- ✓ Performance metrics

---

## Exercise 8: Redux DevTools Debugging (Difficulty: Easy)

**Goal:** Master Redux debugging

**Task 1:** Install Redux DevTools browser extension

**Task 2:** Inspect cart operations:
```bash
1. Open Redux DevTools (Chrome DevTools → Redux tab)
2. Add item to cart
3. Watch the dispatch: { type: 'cart/addToCart', payload: {...} }
4. See state before/after: { items: [...], isOpen: false }
5. Time-travel: Click previous actions to see state rewind
```

**Task 3:** Test performance:
```javascript
// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/slices/cartSlice';
import productReducer from '../features/product/slices/productSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer,
  },
  // DevTools auto-enabled in dev, disabled in production
  devTools: process.env.NODE_ENV !== 'production',
});
```

**What you're learning:**
- ✓ Debugging Redux state
- ✓ Time-travel debugging
- ✓ Action history inspection

---

## Exercise 9: Convert Class Component to Hooks (Difficulty: Hard)

**Goal:** Understand functional component patterns

**Task:** ErrorBoundary is a class component. Study why, then try Hooks alternative:

**Current Class Component:**
```javascript
// src/components/common/ErrorBoundary.jsx - CLASS
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**Why still class?**
- Error boundaries don't have Hook equivalents yet (React team still working on it)
- getDerivedStateFromError & componentDidCatch are class-only

**If you want Hook version now (library):**
```javascript
// Install: npm install react-error-boundary
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({error, resetErrorBoundary}) {
  return (
    <div>
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

// Use:
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <App />
</ErrorBoundary>
```

**What you're learning:**
- ✓ Class vs Hooks trade-offs
- ✓ When libraries are better than manual
- ✓ React ecosystem maturity

---

## Exercise 10: Build Authentication Feature (Difficulty: Hard)

**Goal:** Complete a full feature end-to-end (scaffolding exists)

**Task:** Implement authentication with Redux + Context

```javascript
// Step 1: Create auth slice
// src/features/auth/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const login = createAsyncThunk('auth/login', async ({ email, password }) => {
  const response = await api.login(email, password);
  localStorage.setItem('token', response.token);
  return response.user;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await api.logout();
  localStorage.removeItem('token');
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, status: 'idle', error: null },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.status = 'loading'; })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
      });
  }
});

export default authSlice.reducer;

// Step 2: Create useAuth hook
// src/hooks/useAuth.js
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '../features/auth/slices/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const { user, status, error } = useSelector(state => state.auth);

  return {
    user,
    isLoading: status === 'loading',
    error,
    login: (email, password) => dispatch(login({ email, password })),
    logout: () => dispatch(logout()),
  };
}

// Step 3: Create withAuth HOC
// src/components/common/withAuth.jsx
export const withAuth = (Component) => {
  return (props) => {
    const { user } = useAuth();
    
    if (!user) {
      return <Navigate to="/login" />;
    }
    
    return <Component {...props} />;
  };
};

// Step 4: Use it
const ProtectedCheckout = withAuth(Checkout);

// Step 5: In router
<Route path="/checkout" element={<ProtectedCheckout />} />
```

**What you're learning:**
- ✓ Building features from scratch
- ✓ Combining Redux + Hooks
- ✓ HOC patterns in practice
- ✓ Token management
- ✓ Protected routes

---

## Exercise 11: Testing Components (Difficulty: Medium)

**Goal:** Write testable code and tests

**Install testing tools:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

**Write tests for useCart hook:**
```javascript
// src/hooks/useCart.test.js
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { useCart } from './useCart';
import store from '../store';

const wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;

describe('useCart', () => {
  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.add({ id: 1, title: 'Product', price: 100 });
    });
    
    expect(result.current.count).toBe(1);
    expect(result.current.items).toHaveLength(1);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.add({ id: 1, title: 'Product', price: 100 });
      result.current.remove(1);
    });
    
    expect(result.current.count).toBe(0);
  });

  it('should calculate total correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.add({ id: 1, title: 'Product', price: 100 });
      result.current.add({ id: 2, title: 'Product 2', price: 50 });
    });
    
    expect(result.current.total).toBe(150);
  });
});
```

**Run tests:**
```bash
npm run test
```

**What you're learning:**
- ✓ Testing hooks
- ✓ Test isolation with mocking
- ✓ Testing Redux with Provider wrapper
- ✓ Code coverage

---

## Exercise 12: Implement Caching Strategy (Difficulty: Hard)

**Goal:** Prevent unnecessary API calls

**Task:** Add caching to product fetching

```javascript
// src/features/product/slices/productSlice.js
const initialState = {
  items: [],
  filteredItems: [],
  status: 'idle',
  error: null,
  category: 'all',
  lastFetch: null, // ADD: timestamp
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { getState, rejectWithValue }) => {
    const state = getState();
    const { lastFetch, cacheTimeout } = state.products;
    
    // Return cached data if fresh
    if (lastFetch && Date.now() - lastFetch < cacheTimeout) {
      return state.products.items;
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      return productsData;
    } catch (error) {
      return rejectWithValue('Failed to load products');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.items = action.payload;
      state.filteredItems = action.payload;
      state.lastFetch = Date.now(); // ADD: track time
      state.status = 'succeeded';
    });
  }
});
```

**Usage:**
```javascript
// First fetch: makes API call
dispatch(fetchProducts()); // Fetches from API

// Second fetch within 5 min: uses cache
dispatch(fetchProducts()); // Returns cached data

// After 5 min: refreshes
dispatch(fetchProducts()); // Fetches from API again
```

**What you're learning:**
- ✓ Caching strategy
- ✓ getState in thunks
- ✓ Preventing over-fetching
- ✓ User experience optimization

---

## Interview-Ready Hands-On Checklist

Mark these as done to be confident in interviews:

- [ ] **Custom Hooks** - Built 3+ custom hooks (useAsync, useCart, useForm)
- [ ] **Redux** - Created slices, thunks, selectors, used DevTools
- [ ] **Performance** - Implemented React.memo, useCallback, measured improvements
- [ ] **Error Handling** - Added ErrorBoundary, error states in Redux
- [ ] **Forms** - Built controlled components with validation
- [ ] **Testing** - Written tests for hooks, components, Redux
- [ ] **Code Splitting** - Implemented lazy loading, verified bundle sizes
- [ ] **State Management Decision** - Explained Context vs Redux in detail
- [ ] **Debugging** - Used Redux DevTools, React DevTools, console
- [ ] **Feature Build** - Built authentication feature end-to-end
- [ ] **Caching** - Implemented simple cache with timestamp logic
- [ ] **Async Patterns** - Handled pending/fulfilled/rejected states

---

# QUICK REFERENCE CHEATSHEET

```javascript
// 1. State Management Decision Tree
useState()             → Local component state
useContext()           → UI concerns (theme, notifications)
Redux + useSelector()  → Shared domain data

// 2. Performance Checklist
✓ Code splitting with lazy()
✓ Selectors for computed state
✓ React.memo for expensive components
✓ useCallback for functions passed as props
✓ Key prop with stable IDs (not index)

// 3. Error Handling Layers
ErrorBoundary → Render errors
Redux reducers → Async errors  
Try-catch → Operation errors
Context → User notifications

// 4. Redux Pattern
createSlice (reducers + initial state)
createAsyncThunk (async operations)
Selectors (derived state)
useSelector (subscribe to state)
useDispatch (dispatch actions)

// 5. Custom Hooks Pattern
Extract logic → function using hooks
Encapsulate side effects
Return clean API
Make it testable

// 6. Common Props Pattern
Controlled components → onChange + value
Key prop → item.id (not index)
ref → uncontrolled access (rare)
```

---

## Final Interview Tip:

**Always show your thought process.** Instead of:
> "I'd use Redux"

Say:
> "I'd analyze the state: Is it shared? Yes. Does it update frequently? Yes. Then Redux is appropriate. I'd use Redux Toolkit for less boilerplate, with createSlice for synchronous reducers and createAsyncThunk for async operations. I'd also create explicit selectors to memoize derived state and prevent unnecessary re-renders."

This shows you're not just picking libraries randomly - you're making deliberate architectural decisions.

Good luck! 🚀
