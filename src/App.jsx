import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Lazy load pages for performance (Senior Best Practice)
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));

// Simple loading spinner for Suspense
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
            <Route path="*" element={<Shop />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
