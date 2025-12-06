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
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setShowUserMenu(false);
  };

  // Đóng menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

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
        {/* Tất cả trên cùng 1 hàng: Logo | Menu Links | User Info */}
        <div className="navbar-top">
          <Link to="/" className="navbar-brand">
            ShopWeb
          </Link>
          
          {/* Menu Links */}
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

          {/* User Section */}
          <div className="navbar-user-section">
            {isAuthenticated ? (
              <>
                {user?.role !== 'admin' && typeof user?.balance !== 'undefined' && (
                  <span className="navbar-balance" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Icon name="wallet" size={16} /> Số dư: {formatCurrency(user.balance)}
                  </span>
                )}
                <div className="user-menu-container">
                  <button 
                    className="user-menu-trigger"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-label="User menu"
                  >
                    <Icon name="user" size={20} />
                  </button>
                  {showUserMenu && (
                    <div className="user-menu-dropdown">
                      <div className="user-menu-header">
                        <Icon name="user" size={20} />
                        <div>
                          <div className="user-menu-name">{user?.name}</div>
                          <div className="user-menu-email">{user?.email}</div>
                        </div>
                      </div>
                      <div className="user-menu-divider"></div>
                      <Link 
                        to="/profile" 
                        className="user-menu-item"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Icon name="user" size={16} />
                        <span>Hồ sơ</span>
                      </Link>
                      {user?.role !== 'admin' && (
                        <>
                          <Link 
                            to="/wallet" 
                            className="user-menu-item"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Icon name="wallet" size={16} />
                            <span>Ví của tôi</span>
                          </Link>
                          <Link 
                            to="/orders/history" 
                            className="user-menu-item"
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Icon name="history" size={16} />
                            <span>Đơn hàng</span>
                          </Link>
                        </>
                      )}
                      <div className="user-menu-divider"></div>
                      <button 
                        className="user-menu-item user-menu-item-danger"
                        onClick={handleLogout}
                      >
                        <Icon name="signOut" size={16} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="user-menu-container">
                <button 
                  className="user-menu-trigger"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="Auth menu"
                >
                  <Icon name="menu" size={20} />
                </button>
                {showUserMenu && (
                  <div className="user-menu-dropdown">
                    <Link 
                      to="/login" 
                      className="user-menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Icon name="signIn" size={16} />
                      <span>Đăng nhập</span>
                    </Link>
                    <Link 
                      to="/register" 
                      className="user-menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Icon name="userPlus" size={16} />
                      <span>Đăng ký</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

