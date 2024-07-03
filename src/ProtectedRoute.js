import React, { useContext, useEffect } from 'react';
import { Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/authContext';

const ProtectedRoute = () => {
  const auth = useAuth();
    return auth.isAuthenticated ? <Outlet/> : <Navigate to={"/login"} />
};

export default ProtectedRoute;