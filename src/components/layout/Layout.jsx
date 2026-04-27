import React from 'react';
import Header from './Header';
import CartDrawer from './CartDrawer';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = ({ children }) => {
  const { notifications, removeNotification } = useApp();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <CartDrawer />
      
      {/* Toast Notifications */}
      <div className="fixed bottom-6 right-6 z-[200] space-y-2">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => removeNotification(n.id)}
              className={`p-4 rounded-lg shadow-lg glass border flex items-center gap-3 cursor-pointer min-w-[250px] ${
                n.type === 'error' ? 'border-red-500/50' : 'border-primary/50'
              }`}
            >
              <div className={`h-2 w-2 rounded-full ${
                n.type === 'error' ? 'bg-red-500' : 'bg-primary'
              }`} />
              <p className="text-sm font-medium">{n.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <footer className="border-t py-12 bg-muted/50 mt-20">
        <div className="container grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gradient">AuraMarket</h3>
            <p className="text-sm text-muted-foreground">
              Premium curated goods for the modern lifestyle.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#">Electronics</a></li>
              <li><a href="#">Jewelry</a></li>
              <li><a href="#">Men's Clothing</a></li>
              <li><a href="#">Women's Clothing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Sustainability</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#">Shipping Policy</a></li>
              <li><a href="#">Returns & Refunds</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="container mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © 2026 AuraMarket. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
