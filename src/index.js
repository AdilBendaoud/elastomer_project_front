import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthProvider from "./context/authContext";
import Login from './pages/Login';
import ProtectedRoute from './ProtectedRoute';
import ForgotPass from './pages/ForgotPass';
import ErrorPage from './pages/404Page';
import Layout from './Layout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route element={<ProtectedRoute/>}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path='settings' element={<Settings />} />
          </Route>
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path='/forgotpassword' element={<ForgotPass />} />
        <Route path='*' element={<ErrorPage />} />
        {/* <Route path="catalogue" element={<Catalogue />} />
        <Route path='/test/:testId/:title' element={<Test />}/>
        <Route path='/result/:personality' element={<Result />}/> */}
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

reportWebVitals();