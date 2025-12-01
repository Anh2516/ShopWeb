import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import axios from 'axios';
import Icon from '../common/Icon';
import './Navbar.css';
import { formatCurrency } from '../../utils/currency';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user, token } = useSelector(state => state.auth);
  const cartItems = useSelector(state => state.cart.items);
  const [pendingTopupCount, setPendingTopupCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch pending counts for admin
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin' && token) {
      const fetchPendingCounts = async () => {
        try {
          const response = await axios.get('/api/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPendingTopupCount(response.data.stats.pendingTopupCount || 0);
          setPendingOrdersCount(response.data.stats.pendingOrdersCount || 0);
        } catch (error) {
          console.error('Lỗi lấy số lượng pending:', error);
        }
      };

      fetchPendingCounts();
      // Polling mỗi 5 giây để cập nhật real-time
      const interval = setInterval(fetchPendingCounts, 5000);
      
      // Lắng nghe event để refresh ngay lập tức
      const handleUpdate = (e) => {
        // Nếu có immediate flag, refresh ngay không delay
        if (e.detail?.immediate) {
          fetchPendingCounts();
        } else {
          fetchPendingCounts();
        }
      };
      window.addEventListener('pendingCountsUpdate', handleUpdate);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('pendingCountsUpdate', handleUpdate);
      };
    }
  }, [isAuthenticated, user?.role, token]);

  const baseLinks = [{ to: '/products', label: 'Sản phẩm', icon: 'shoppingBag' }];
  let navLinks = baseLinks;

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      navLinks = [
        ...baseLinks,
        { to: '/admin', label: 'Dashboard', icon: 'chartLine' },
        { to: '/admin/products', label: 'QL sản phẩm', icon: 'box' },
        { to: '/admin/orders', label: 'QL đơn hàng', icon: 'shoppingCart' },
        { to: '/admin/users', label: 'QL người dùng', icon: 'users' },
        { to: '/admin/inventory', label: 'QL nhập kho', icon: 'warehouse' }
      ];
    } else {
      navLinks = [
        ...baseLinks,
        { to: '/orders/history', label: 'Đơn hàng', icon: 'history' },
        { to: '/wallet', label: 'Nạp tiền', icon: 'wallet' },
        { to: '/cart', label: 'Giỏ hàng', icon: 'shoppingCart' }
      ];
    }
  }

  return (
    <nav className="navbar">
      <div className="container">
        {/* Hàng 1: Logo và User Info */}
        <div className="navbar-top">
          <Link to="/" className="navbar-brand">
            ShopWeb
          </Link>
          <div className="navbar-user-section">
            {isAuthenticated ? (
              <>
                {user?.role !== 'admin' && typeof user?.balance !== 'undefined' && (
                  <span className="navbar-balance" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Icon name="wallet" size={16} /> Số dư: {formatCurrency(user.balance)}
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Link to="/profile" className="navbar-user" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="user" size={16} /> Xin chào, {user?.name}
                  </Link>
                  <button onClick={handleLogout} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="signOut" size={16} /> Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="signIn" size={16} /> Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="userPlus" size={16} /> Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* Hàng 2: Menu Links */}
        <div className="navbar-menu">
          {navLinks.map(link => (
            <Link 
              key={link.to} 
              to={link.to} 
              className="navbar-link" 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}
            >
              <Icon name={link.icon} size={16} />
              {link.label}
              {link.to === '/cart' && cartItemCount > 0 && (
                <span className="cart-badge">{cartItemCount}</span>
              )}
              {link.to === '/admin/users' && pendingTopupCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  minWidth: '20px'
                }}>
                  {pendingTopupCount > 99 ? '99+' : pendingTopupCount}
                </span>
              )}
              {link.to === '/admin/orders' && pendingOrdersCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  minWidth: '20px'
                }}>
                  {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

