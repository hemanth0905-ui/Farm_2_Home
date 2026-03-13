import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { Toaster } from '../components/ui/sonner';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Products from '../pages/Products';
import ProductDetails from '../pages/ProductDetails';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import Profile from '../pages/Profile';
import Messages from '../pages/Messages';

import FarmerDashboard from '../pages/farmer/Dashboard';
import FarmerProducts from '../pages/farmer/Products';

import ConsumerDashboard from '../pages/consumer/Dashboard';

import AdminDashboard from '../pages/admin/Dashboard';
import AdminFarmers from '../pages/admin/Farmers';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          
          <Route
            path="/cart"
            element={
              <ProtectedRoute roles={['consumer']}>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute roles={['consumer']}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute roles={['farmer']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/products"
            element={
              <ProtectedRoute roles={['farmer']}>
                <FarmerProducts />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/consumer/dashboard"
            element={
              <ProtectedRoute roles={['consumer']}>
                <ConsumerDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/farmers"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminFarmers />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;