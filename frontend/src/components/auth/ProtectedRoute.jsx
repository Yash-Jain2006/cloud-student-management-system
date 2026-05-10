import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();

  // Basic check for token existence
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // In a real app, you would decode the JWT here to check the role.
  // For now, we'll assume the user is authorized if they have a token.
  // We can refine this later by adding a global auth state.
  
  return children;
};

export default ProtectedRoute;
