import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../store/slices/authSlice';
import { formatCurrency } from '../utils/currency';
import './Wallet.css';
import BackButton from '../components/common/BackButton';

const Wallet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector(state => state.auth);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [qrModal, setQrModal] = useState(false);
  const [pendingTopup, setPendingTopup] = useState(null);
  const statusLabel = {
    pending: 'Chờ duyệt',
    approved: 'Đã cộng',
    rejected: 'Từ chối'
  };

  const authHeader = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/wallet', authHeader);
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTransactions();
  }, [token, navigate]);

  const handleTopUp = (e) => {
    e.preventDefault();
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      alert('Số tiền nạp phải lớn hơn 0');
      return;
    }
    setPendingTopup({ amount: value });
    setQrModal(true);
  };

  const handleConfirmTransfer = async () => {
    if (!pendingTopup) return;
    setSubmitting(true);
    try {
      const response = await axios.post('/api/wallet/topup', {
        amount: pendingTopup.amount,
        method: 'vietqr',
        note: user?.customer_code
      }, authHeader);
      
      // Trigger event TRƯỚC khi làm bất cứ điều gì khác để cập nhật ngay lập tức
      // Trigger event để cập nhật pending count trong admin users page
      window.dispatchEvent(new CustomEvent('newTopupRequest', { 
        detail: { 
          userId: user?.id,
          amount: pendingTopup.amount 
        },
        bubbles: true,
        cancelable: true
      }));
      
      // Trigger refresh cho Navbar admin để cập nhật chấm đỏ ngay lập tức
      window.dispatchEvent(new CustomEvent('pendingCountsUpdate', { 
        detail: { immediate: true },
        bubbles: true,
        cancelable: true
      }));
      
      // Không cần refresh user vì nạp tiền chưa được duyệt
      await fetchTransactions();
      
      setAmount('');
      setQrModal(false);
      setPendingTopup(null);
      alert('Đã gửi yêu cầu nạp tiền, vui lòng chờ admin xác nhận!');
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể nạp tiền');
    } finally {
      setSubmitting(false);
    }
  };

  const qrUrl = pendingTopup && user?.customer_code
    ? `https://img.vietqr.io/image/mbbank-2516999999999-compact2.png?amount=${encodeURIComponent(pendingTopup.amount)}&addInfo=${encodeURIComponent(user.customer_code)}&accountName=DANG%20TUAN%20ANH`
    : null;

  return (
    <div className="main-content">
      <div className="container wallet-container">
        <div className="wallet-header">
          <BackButton />
          <h1>Ví ShopWeb</h1>
          <div className="wallet-balance-card">
            <p>Số dư hiện tại</p>
            <strong>{formatCurrency(user?.balance || 0)}</strong>
          </div>
        </div>

        <div className="wallet-grid">
          <div className="wallet-card">
            <h2>Nạp tiền vào ví</h2>
            <form onSubmit={handleTopUp}>
              <div className="form-group">
                <label>Số tiền (VND)</label>
                <input
                  type="number"
                  min="10000"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="form-note">
                <p>Hệ thống sẽ tạo QR VietQR MB Bank. Nội dung chuyển khoản phải là <strong>{user?.customer_code || 'mã khách hàng'}</strong>.</p>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                Tạo mã QR
              </button>
            </form>
          </div>

          <div className="wallet-card">
            <h2>Lịch sử giao dịch</h2>
            {loading ? (
              <div className="loading">Đang tải...</div>
            ) : transactions.length === 0 ? (
              <p>Chưa có giao dịch nào</p>
            ) : (
              <div className="wallet-history">
                {transactions.map((txn) => (
                  <div key={txn.id} className="wallet-history-item">
                    <div>
                      <p className="wallet-history-amount">{formatCurrency(txn.amount)}</p>
                      <p className="wallet-history-note">{txn.note || 'Nạp tiền ví'}</p>
                    </div>
                    <div className="wallet-history-meta">
                      <span className="wallet-status" data-status={txn.status}>
                        {statusLabel[txn.status] || txn.status}
                      </span>
                      <span className="wallet-method">{txn.method?.toUpperCase()}</span>
                      <span>{new Date(txn.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {qrModal && pendingTopup && (
          <div
            className="modal-overlay"
            onClick={() => {
              if (submitting) return;
              setQrModal(false);
              setPendingTopup(null);
            }}
          >
            <div className="modal-content wallet-qr-modal" onClick={(e) => e.stopPropagation()}>
              <h2>Quét QR để nạp tiền</h2>
              <p>Số tiền: <strong>{formatCurrency(pendingTopup.amount)}</strong></p>
              <p>Nội dung chuyển khoản (ID khách hàng): <strong className="wallet-code">{user?.customer_code}</strong></p>
              {qrUrl && (
                <div className="wallet-qr-wrapper">
                  <img src={qrUrl} alt="QR thanh toán" />
                </div>
              )}
              <div className="wallet-qr-actions">
                <button
                  className="btn"
                  onClick={() => {
                    if (submitting) return;
                    setQrModal(false);
                    setPendingTopup(null);
                  }}
                  disabled={submitting}
                >
                  Quay lại
                </button>
                <button className="btn btn-primary" onClick={handleConfirmTransfer} disabled={submitting}>
                  {submitting ? 'Đang xác nhận...' : 'Xác nhận đã chuyển'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wallet;


