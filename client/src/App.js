import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser, updateBalance } from './store/slices/authSlice';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Cart from './pages/Cart';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import AdminUsers from './pages/admin/Users';
import AdminInventory from './pages/admin/Inventory';
import Wallet from './pages/Wallet';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import PrivateRoute from './components/routing/PrivateRoute';
import AdminRoute from './components/routing/AdminRoute';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { token, isAuthenticated, user } = useSelector(state => state.auth);

  // Gọi getCurrentUser ngay khi app mount nếu có token trong localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]); // Chỉ chạy một lần khi mount

  // Cũng gọi khi token thay đổi (trường hợp login)
  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, isAuthenticated]);

  // Lắng nghe event để cập nhật balance khi admin duyệt nạp tiền
  useEffect(() => {
    const handleBalanceUpdate = (event) => {
      const { userId, newBalance } = event.detail;
      // Chỉ cập nhật nếu user đang đăng nhập là user được duyệt
      if (user && user.id === userId) {
        dispatch(updateBalance(newBalance));
      }
    };

    window.addEventListener('balanceUpdated', handleBalanceUpdate);
    return () => {
      window.removeEventListener('balanceUpdated', handleBalanceUpdate);
    };
  }, [dispatch, user]);

  return (
    <div className="App">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/cart" element={<PrivateRoute allowAdmin={false}><Cart /></PrivateRoute>} />
        <Route path="/wallet" element={<PrivateRoute allowAdmin={false}><Wallet /></PrivateRoute>} />
        <Route path="/orders/history" element={<PrivateRoute allowAdmin={false}><MyOrders /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/inventory" element={<AdminRoute><AdminInventory /></AdminRoute>} />
      </Routes>
    </div>
  );
}

export default App;

