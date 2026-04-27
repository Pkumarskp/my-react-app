import { useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useDispatch } from 'react-redux';
import { clearCart } from '../features/cart/slices/cartSlice';

const useRazorpay = () => {
  const { addNotification } = useApp();
  const dispatch = useDispatch();

  const initiatePayment = useCallback(({ amount, userName, email }) => {
    return new Promise((resolve, reject) => {
      const options = {
        key: 'rzp_test_YOUR_KEY_HERE', // User should replace this with their actual key
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        name: 'AuraMarket',
        description: 'Thank you for your purchase',
        image: 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=200',
        handler: function (response) {
          // Success!
          addNotification('Payment Successful!', 'success');
          dispatch(clearCart());
          resolve(response);
        },
        prefill: {
          name: userName || 'Guest User',
          email: email || 'guest@example.com',
          contact: '9999999999',
        },
        notes: {
          address: 'AuraMarket Corporate Office',
        },
        theme: {
          color: '#3b82f6',
        },
        modal: {
          ondismiss: function() {
            addNotification('Payment Cancelled', 'info');
            reject(new Error('Payment cancelled by user'));
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  }, [addNotification, dispatch]);

  return { initiatePayment };
};

export default useRazorpay;
