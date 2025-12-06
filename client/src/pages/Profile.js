import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUser, updateProfile } from '../store/slices/authSlice';
import './auth/Auth.css';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        password: '',
        confirmPassword: ''
      });
    } else {
      dispatch(getCurrentUser());
    }
  }, [user, dispatch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      setSubmitting(false);
      return;
    }

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await dispatch(updateProfile(updateData)).unwrap();
      setSuccessMessage('Cập nhật thông tin thành công!');
      setFormData({
        ...formData,
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      alert(error || 'Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="main-content">
        <div className="auth-container">
          <div className="loading">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Thông tin cá nhân</h2>
          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div style={{ 
              background: '#d4edda', 
              color: '#155724', 
              padding: '12px', 
              borderRadius: '4px', 
              marginBottom: '20px' 
            }}>
              {successMessage}
            </div>
          )}
          {user && (
            <>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <label>Mã khách hàng</label>
                <input type="text" value={user.customer_code || ''} disabled />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Mật khẩu mới (để trống nếu không đổi)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength="6"
                  />
                </div>
                {formData.password && (
                  <div className="form-group">
                    <label>Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      minLength="6"
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Số dư</label>
                  <input 
                    type="text" 
                    value={new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND' 
                    }).format(user.balance || 0)} 
                    disabled 
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '10px' }}
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : 'Cập nhật thông tin'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

