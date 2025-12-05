import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import './Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // Phần cart của người B, tạm thời comment logic để không lỗi
  // const { cartItems } = useSelector((state) => state.cart);
  // const cartCount = cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        {/* Tầng trên: Logo và User Info */}
        <div className="navbar-top">
          <Link to="/" className="navbar-brand">
            ShopWeb
          </Link>

          <div className="navbar-user-section">
            {user ? (
              <>
                <span className="navbar-user">Hi, {user.name}</span>
                {/* Ví (Wallet) - chờ người B làm */}
                {/* <div className="navbar-balance">0 đ</div> */}
                
                <button onClick={handleLogout} className="navbar-link" style={{border: 'none', background: 'transparent', cursor: 'pointer'}}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="navbar-link">Login</Link>
                <Link to="/register" className="navbar-link">Register</Link>
              </>
            )}
          </div>
        </div>

        {/* Tầng dưới: Menu điều hướng */}
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/products" className="navbar-link">Products</Link>
          
          <Link to="/cart" className="navbar-link">
            Cart
            {/* Badge số lượng (tạm ẩn) */}
            {/* <span className="cart-badge">{cartCount}</span> */}
          </Link>
          
          {user && user.role === 'admin' && (
             <Link to="/admin/dashboard" className="navbar-link">Admin Dashboard</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;