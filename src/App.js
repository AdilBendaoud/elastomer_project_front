import './App.css';
import { Route, Routes, Navigate } from "react-router-dom";
import Login from './pages/Login';
import ProtectedRoute from './ProtectedRoute';
import ForgotPass from './pages/ForgotPass';
import ErrorPage from './pages/404Page';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';
import BlockedPage from './pages/BlockedPage';
import { useAuth } from './context/authContext';
import { useEffect } from 'react';
import RequestList from './pages/RequestList';

function App() {
  const { isAuthenticated, mustChangePassword, isBlocked, user } = useAuth();
  useEffect(() => console.log({ isAuthenticated, mustChangePassword, isBlocked, user }), [])
  return (
    <Routes>
      {/* unauthorized route */}
      {!isAuthenticated && (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPass />} />
        </>
      )}

      {mustChangePassword && !isBlocked && (
        <>
          <Route path="/" element={<ChangePassword />} />
        </>
      )}

      {isBlocked && (
        <>
          <Route path="/blocked" element={<BlockedPage />} />
          <Route path="/" element={<BlockedPage />} />
        </>
      )}

      {/* ProtectedRoutes */}
      {isAuthenticated && !isBlocked && !mustChangePassword && (
        <>
          <Route element={<ProtectedRoute />}>
            <Route path="/change-password" element={<Navigate to="/" />} />
            <Route path="/login" element={<Navigate to="/" />} />
            <Route path='/' element={<Layout />}>
              { !user.roles.includes('A') ? (
                <>
                  <Route path='/' element={<RequestList />} />
                </>) : (
                <>
                  <Route index element={<Dashboard />} />
                  <Route path='/request-list' element={<RequestList />} />
                  <Route path="settings" element={<Settings />} />
                </>)}
            </Route>
          </Route>
        </>
      )}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;