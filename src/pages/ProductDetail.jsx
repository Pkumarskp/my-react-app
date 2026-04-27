import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingBag, ArrowLeft, Star, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { addToCart } from '../features/cart/slices/cartSlice';
import { useApp } from '../context/AppContext';
import ProductCard from '../features/product/components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { addNotification } = useApp();
  
  const product = useSelector((state) => 
    state.products.items.find((p) => p.id === parseInt(id))
  );
  
  const relatedProducts = useSelector((state) => 
    state.products.items
      .filter((p) => p.category === product?.category && p.id !== product?.id)
      .slice(0, 4)
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link to="/" className="text-primary mt-4 inline-block">Back to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    addNotification(`Added ${product.title} to cart`, 'success');
  };

  return (
    <div className="container py-12 space-y-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Collection
      </Link>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        {/* Product Image */}
        <div className="bg-white rounded-3xl p-12 border flex items-center justify-center sticky top-24 h-fit">
          <img 
            src={product.image} 
            alt={product.title} 
            className="max-h-[500px] w-full object-contain mix-blend-multiply transition-transform hover:scale-105 duration-500"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
              {product.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold">{product.title}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-orange-500">
                <Star className="h-5 w-5 fill-current" />
                <span className="font-bold text-lg">{product.rating?.rate}</span>
              </div>
              <span className="text-muted-foreground text-sm">|</span>
              <span className="text-muted-foreground text-sm">{product.rating?.count} customer reviews</span>
            </div>
            <p className="text-4xl font-bold text-primary">${product.price}</p>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" /> Add to Cart
            </button>
            <button className="flex-1 bg-muted text-foreground py-4 rounded-2xl font-bold hover:bg-border transition-all">
              Add to Wishlist
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-8 border-t">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-muted rounded-xl text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Free Shipping</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-muted rounded-xl text-primary">
                <RotateCcw className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">30-Day Returns</p>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-3 bg-muted rounded-xl text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Genuine Brand</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-8 pt-12 border-t">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">You Might Also Like</h2>
            <Link to="/" className="text-primary font-bold text-sm">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
