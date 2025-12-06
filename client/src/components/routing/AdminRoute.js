import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, token, loading } = useSelector(state => state.auth);

  // Kiểm tra token trong localStorage để biết có đang đăng nhập không
  const hasToken = token || localStorage.getItem('token');

  // Nếu có token nhưng chưa xác thực xong (đang loading hoặc chưa authenticated), chờ đợi
  if (hasToken && (loading || !isAuthenticated)) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>Đang tải...</div>;
  }

  // Chỉ redirect khi chắc chắn không có token hoặc đã load xong nhưng không authenticated
  if (!hasToken || (!loading && !isAuthenticated)) {
    return <Navigate to="/login" />;
  }

  // Kiểm tra role admin sau khi đã xác thực xong
  // Chỉ redirect về trang chủ khi đã load xong và chắc chắn không phải admin
  if (!loading && isAuthenticated && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  // Nếu đang loading hoặc chưa có user data, chờ đợi
  if (loading || !user) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>Đang tải...</div>;
  }

  return children;
};

export default AdminRoute;

