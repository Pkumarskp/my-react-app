import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShoppingBag, Star, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { addToCart } from '../../cart/slices/cartSlice';
import { useApp } from '../../../context/AppContext';

const ProductCard = ({ product, isLoading }) => {
  const dispatch = useDispatch();
  const { addNotification } = useApp();

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border p-4 space-y-4 animate-pulse">
        <div className="aspect-square bg-muted rounded-xl" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
        <div className="h-10 bg-muted rounded-xl" />
      </div>
    );
  }

  const handleAddToCart = (e) => {
    e.stopPropagation();
    dispatch(addToCart(product));
    addNotification(`Added ${product.title.slice(0, 20)}... to cart`, 'success');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group bg-card rounded-2xl border p-4 hover:shadow-xl transition-all duration-300 relative"
    >
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square relative overflow-hidden rounded-xl bg-white p-6 mb-4">
          <img 
            src={product.image} 
            alt={product.title} 
            className="h-full w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-muted text-foreground">
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
            {product.category}
          </div>
          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col">
              <span className="text-lg font-bold">${product.price}</span>
              <div className="flex items-center gap-1 text-[10px] text-orange-500">
                <Star className="h-3 w-3 fill-current" />
                <span>{product.rating?.rate} ({product.rating?.count})</span>
              </div>
            </div>
            
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className="h-10 w-10 flex items-center justify-center bg-foreground text-background dark:bg-primary dark:text-white rounded-xl hover:bg-primary transition-colors shadow-lg"
            >
              <ShoppingBag className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
