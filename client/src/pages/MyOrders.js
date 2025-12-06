import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../store/slices/orderSlice';
import { formatCurrency } from '../utils/currency';
import BackButton from '../components/common/BackButton';
import './MyOrders.css';

const MyOrders = () => {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.orders);
  const { token } = useSelector(state => state.auth);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  const openDetail = async (orderId) => {
    try {
      setDetailLoading(true);
      const response = await axios.get(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedOrder(response.data.order);
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => setSelectedOrder(null);

  return (
    <div className="main-content">
      <div className="container">
        <BackButton />
        <h1>Lịch sử mua hàng</h1>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : items.length === 0 ? (
          <div className="empty-message">
            <p>Bạn chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="orders-history-table">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                  <th>Ngày đặt</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{formatCurrency(order.total)}</td>
                    <td>
                      <span className={`order-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>Số dư ví</td>
                    <td>{new Date(order.created_at).toLocaleString('vi-VN')}</td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => openDetail(order.id)}
                        disabled={detailLoading}
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedOrder && (
          <div className="modal-overlay" onClick={closeDetail}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Đơn hàng #{selectedOrder.id}</h2>
                <p>Đặt lúc: {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}</p>
              </div>
              <div className="order-detail-section">
                <h3>Địa chỉ giao hàng</h3>
                <p>{selectedOrder.shipping_address}</p>
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
                      {selectedOrder.items?.map(item => (
                        <tr key={item.id}>
                          <td>{item.product_name}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="order-items-total">
                  <span>Tổng cộng: {formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn" onClick={closeDetail}>Đóng</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;


