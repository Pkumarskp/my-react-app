import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, Moon, Sun, Search, Menu, User, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { selectCartCount, toggleCart } from '../../features/cart/slices/cartSlice';
import { searchProducts } from '../../features/product/slices/productSlice';

const Header = () => {
  const { theme, toggleTheme, setIsSidebarOpen } = useApp();
  const cartCount = useSelector(selectCartCount);
  const dispatch = useDispatch();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(searchProducts(searchValue));
  };

  return (
    <header className="glass sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            className="p-2 lg:hidden hover:bg-muted rounded-full"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gradient">AuraMarket</span>
          </a>
        </div>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="pl-10 h-10 w-full"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          <button className="p-2 hover:bg-muted rounded-full relative">
            <User className="h-5 w-5" />
          </button>

          <button 
            onClick={() => dispatch(toggleCart())}
            className="p-2 hover:bg-muted rounded-full relative"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-fade-in">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
