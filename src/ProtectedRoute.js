import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/authContext';

const ProtectedRoute = () => {
  const auth = useAuth();
    return auth.isAuthenticated ? <Outlet/> : <Navigate to={"/login"} />
};

export default ProtectedRoute;