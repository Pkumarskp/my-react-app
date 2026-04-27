import React, { useEffect, useTransition } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, setCategory } from '../features/product/slices/productSlice';
import ProductCard from '../features/product/components/ProductCard';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

const Shop = () => {
  const dispatch = useDispatch();
  const { filteredItems, status, category } = useSelector((state) => state.products);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  const categories = ['all', "electronics", "jewelery", "men's clothing", "women's clothing"];

  const handleCategoryChange = (cat) => {
    startTransition(() => {
      dispatch(setCategory(cat));
    });
  };

  return (
    <div className="container py-12 space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-[#0f172a] text-white p-12 md:p-20 text-center space-y-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 mix-blend-overlay" />
        <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="h-3 w-3" /> New Collection 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Elevate Your <span className="text-primary">Lifestyle</span> With Aura
          </h1>
          <p className="text-slate-400 text-lg">
            Curated selection of premium products designed for quality and style.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div className="flex items-center gap-4 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
          <div className="flex items-center p-2 bg-muted rounded-xl mr-2">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                category === cat 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-muted hover:bg-border'
              }`}
            >
              {cat.charAt(0) ? cat.charAt(0).toUpperCase() + cat.slice(1) : ''}
            </button>
          ))}
        </div>
        
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {isPending ? 'Updating...' : `Showing ${filteredItems.length} products`}
        </div>
      </div>

      {/* Product Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
        {status === 'loading' ? (
          Array.from({ length: 8 }).map((_, i) => (
            <ProductCard key={i} isLoading={true} />
          ))
        ) : (
          filteredItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>

      {status === 'failed' && (
        <div className="text-center py-20 bg-muted/30 rounded-3xl">
          <p className="text-red-500 font-bold text-xl">Oops! Failed to load products.</p>
          <button 
            onClick={() => dispatch(fetchProducts())}
            className="mt-4 px-8 py-3 bg-primary text-white rounded-xl font-bold"
          >
            Retry Loading
          </button>
        </div>
      )}
    </div>
  );
};

export default Shop;
