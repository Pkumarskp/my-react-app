import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * A Higher Order Component to protect routes.
 * In a real app, this would check a token or Redux auth state.
 */
const withAuth = (WrappedComponent) => {
  return (props) => {
    // Mocking auth check. In interview, explain how you'd use a selector here.
    const isAuthenticated = localStorage.getItem('aura_token'); 

    if (!isAuthenticated) {
      // Redirect to login or home if not authenticated
      return <Navigate to="/" replace />;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
