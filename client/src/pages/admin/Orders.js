import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../../store/slices/orderSlice';
import BackButton from '../../components/common/BackButton';
import './Admin.css';
import { formatCurrency } from '../../utils/currency';

const Orders = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.orders);
  const { token } = useSelector(state => state.auth);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(fetchAllOrders({
      status: statusFilter || undefined,
      search: debouncedSearch || undefined
    }));
  }, [dispatch, debouncedSearch, statusFilter]);

  const handleStatusChange = async (e, orderId) => {
    e.preventDefault();
    e.stopPropagation();
    const newStatus = e.target.value;
    
    try {
      await dispatch(updateOrderStatus({ id: orderId, status: newStatus })).unwrap();
      
      // Cập nhật orderDetail nếu đang mở modal cho order này
      if (showDetail && orderDetail && orderDetail.id === orderId) {
        setOrderDetail({ ...orderDetail, status: newStatus });
      }
      // Trigger refresh cho Navbar để cập nhật chấm đỏ
      window.dispatchEvent(new Event('pendingCountsUpdate'));
    } catch (error) {
      alert(error || 'Có lỗi xảy ra khi cập nhật trạng thái');
      console.error('Lỗi cập nhật trạng thái:', error);
    }
  };

  const filteredOrders = items;

  const fetchOrderDetail = async (orderId) => {
    try {
      setDetailLoading(true);
      setSelectedOrderId(orderId);
      const response = await axios.get(`/api/orders/admin/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrderDetail(response.data.order);
      setShowDetail(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể lấy chi tiết đơn hàng');
    } finally {
      setDetailLoading(false);
      setSelectedOrderId(null);
    }
  };

  const closeDetailModal = () => {
    setShowDetail(false);
    setOrderDetail(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      processing: '#17a2b8',
      shipped: '#007bff',
      completed: '#28a745',
      cancelled: '#dc3545'
    };
    return colors[status] || '#666';
  };

  return (
    <div className="main-content">
      <div className="container">
        <div className="admin-header">
          <h1>Quản lý đơn hàng</h1>
          <div className="admin-filters">
            <BackButton />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo ID, tên khách, email..."
              className="admin-search"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xử lý</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đã giao hàng</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : (
          <div className="admin-table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Cổng thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.user_name} ({order.user_email})</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>Số dư ví</td>
                    <td>
                      <span
                        style={{
                          backgroundColor: getStatusColor(order.status),
                          color: 'white',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(e, order.id)}
                        className="status-select"
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="shipped">Đã giao hàng</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                      <button
                        className="btn btn-secondary"
                        style={{ marginTop: 8 }}
                        onClick={() => fetchOrderDetail(order.id)}
                        disabled={detailLoading && selectedOrderId === order.id}
                      >
                        {detailLoading && selectedOrderId === order.id ? 'Đang tải...' : 'Xem chi tiết'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showDetail && orderDetail && (
          <div className="modal-overlay" onClick={closeDetailModal}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Đơn hàng #{orderDetail.id}</h2>
                <p>Đặt lúc: {new Date(orderDetail.created_at).toLocaleString('vi-VN')}</p>
              </div>

              <div className="order-detail-section">
                <h3>Thông tin khách hàng</h3>
                <div className="order-detail-grid">
                  <div><strong>Họ tên:</strong> {orderDetail.user_name || 'N/A'}</div>
                  <div><strong>Email:</strong> {orderDetail.user_email || 'N/A'}</div>
                  <div><strong>Số điện thoại:</strong> {orderDetail.user_phone || 'N/A'}</div>
                  <div><strong>Địa chỉ:</strong> {orderDetail.user_address || orderDetail.shipping_address}</div>
                </div>
              </div>

              <div className="order-detail-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="order-detail-grid">
                  <div><strong>Trạng thái:</strong> {orderDetail.status}</div>
                  <div><strong>Phương thức thanh toán:</strong> Số dư ví</div>
                  <div><strong>Cổng thanh toán:</strong> Số dư ví</div>
                  <div><strong>Địa chỉ giao hàng:</strong> {orderDetail.shipping_address}</div>
                </div>
              </div>

              <div className="order-detail-section order-detail-items">
                <h3>Sản phẩm</h3>
                <div className="admin-table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderDetail.items?.map(item => (
                        <tr key={item.id}>
                          <td>{item.product_name} (#{item.product_id})</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="order-items-total">
                  <span>Tổng cộng: {formatCurrency(orderDetail.total)}</span>
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn" onClick={closeDetailModal}>Đóng</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

