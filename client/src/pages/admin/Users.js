import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { updateBalance } from '../../store/slices/authSlice';
import './Admin.css';
import { formatCurrency } from '../../utils/currency';
import BackButton from '../../components/common/BackButton';

const Users = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    role: 'user',
    balance: 0
  });
  const [submitting, setSubmitting] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletModalUser, setWalletModalUser] = useState(null);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [walletLoading, setWalletLoading] = useState(false);

  const fetchUsers = async (keyword = '') => {
    try {
      const response = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: keyword ? { search: keyword } : {}
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Lỗi lấy users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchUsers(debouncedSearch);
  }, [token, debouncedSearch]);

  // Lắng nghe event khi có người dùng nạp tiền mới
  useEffect(() => {
    const handleNewTopup = (event) => {
      const { userId } = event.detail || {};
      if (!userId) return;
      
      // Cập nhật pending_topup_count ngay lập tức cho user đó
      setUsers(prevUsers => {
        const updated = prevUsers.map(u => {
          if (u.id === userId) {
            const newCount = (u.pending_topup_count || 0) + 1;
            return { ...u, pending_topup_count: newCount };
          }
          return u;
        });
        return updated;
      });
    };

    // Sử dụng capture phase để đảm bảo nhận event sớm nhất
    window.addEventListener('newTopupRequest', handleNewTopup, true);
    return () => {
      window.removeEventListener('newTopupRequest', handleNewTopup, true);
    };
  }, []);

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        password: '',
        role: user.role || 'user',
        balance: Number(user.balance || 0)
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        password: '',
        role: 'user',
        balance: 0
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Chuẩn bị dữ liệu để gửi
      const submitData = { ...formData };
      
      // Nếu đang sửa và password rỗng, không gửi password
      if (editingUser && !submitData.password) {
        delete submitData.password;
      }
      
      // Đảm bảo balance là số
      if (submitData.balance !== undefined) {
        submitData.balance = Number(submitData.balance);
      }
      
      if (editingUser) {
        await axios.put(`/api/users/${editingUser.id}`, submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/users', submitData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      await fetchUsers(debouncedSearch);
      closeModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          error.message || 
                          'Có lỗi xảy ra';
      alert(errorMessage);
      console.error('Lỗi cập nhật user:', error.response?.data || error);
    } finally {
      setSubmitting(false);
    }
  };

  const openWalletModal = async (user) => {
    setWalletModalUser(user);
    setWalletModalOpen(true);
    setWalletLoading(true);
    try {
      const response = await axios.get('/api/wallet/admin/pending', {
        headers: { Authorization: `Bearer ${token}` },
        params: { userId: user.id }
      });
      setWalletTransactions(response.data.transactions || []);
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể tải giao dịch chờ duyệt');
      setWalletTransactions([]);
    } finally {
      setWalletLoading(false);
    }
  };

  const closeWalletModal = () => {
    setWalletModalOpen(false);
    setWalletModalUser(null);
    setWalletTransactions([]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa user này?')) return;
    try {
      await axios.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchUsers(debouncedSearch);
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể xóa user');
    }
  };

  const handleApproveTopup = async (transactionId) => {
    try {
      const response = await axios.post(`/api/wallet/admin/${transactionId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Cập nhật balance cho user nếu họ đang đăng nhập (broadcast event)
      if (response.data.user) {
        window.dispatchEvent(new CustomEvent('balanceUpdated', { 
          detail: { 
            userId: response.data.user.id,
            newBalance: response.data.user.balance 
          } 
        }));
      }
      
      // Cập nhật chấm đỏ ngay lập tức bằng cách giảm count
      setWalletTransactions(prev => {
        const filtered = prev.filter(txn => txn.id !== transactionId);
        // Cập nhật pending_topup_count trong users list ngay lập tức
        setUsers(prevUsers => prevUsers.map(u => {
          if (u.id === walletModalUser?.id) {
            return { ...u, pending_topup_count: Math.max(0, (u.pending_topup_count || 0) - 1) };
          }
          return u;
        }));
        return filtered;
      });
      
      // Trigger refresh cho Navbar ngay lập tức
      window.dispatchEvent(new CustomEvent('pendingCountsUpdate', { detail: { immediate: true } }));
      await fetchUsers(debouncedSearch);
      alert('Đã duyệt nạp tiền');
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể duyệt giao dịch');
    }
  };

  const handleRejectTopup = async (transactionId) => {
    const reason = window.prompt('Lý do từ chối (có thể bỏ trống)', '');
    if (reason === null) return; // User cancelled
    try {
      await axios.post(`/api/wallet/admin/${transactionId}/reject`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Cập nhật chấm đỏ ngay lập tức bằng cách giảm count
      setWalletTransactions(prev => {
        const filtered = prev.filter(txn => txn.id !== transactionId);
        // Cập nhật pending_topup_count trong users list ngay lập tức
        setUsers(prevUsers => prevUsers.map(u => {
          if (u.id === walletModalUser?.id) {
            return { ...u, pending_topup_count: Math.max(0, (u.pending_topup_count || 0) - 1) };
          }
          return u;
        }));
        return filtered;
      });
      
      // Trigger refresh cho Navbar ngay lập tức
      window.dispatchEvent(new CustomEvent('pendingCountsUpdate', { detail: { immediate: true } }));
      alert('Đã từ chối giao dịch');
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể từ chối giao dịch');
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        <div className="admin-header">
          <h1>Quản lý người dùng</h1>
          <div className="admin-filters">
            <BackButton />
            <input
              type="text"
              className="admin-search"
              placeholder="Tìm theo tên, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => openModal()} className="btn btn-primary">
              Thêm người dùng
            </button>
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
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Mã KH</th>
                  <th>Số điện thoại</th>
                  <th>Số dư</th>
                  <th>Vai trò</th>
                  <th>Ngày đăng ký</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.customer_code}</td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>{formatCurrency(user.balance || 0)}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => openModal(user)}>
                        Sửa
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(user.id)}>
                        Xóa
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => openWalletModal(user)}
                        style={{ position: 'relative' }}
                      >
                        Duyệt nạp
                        {user.pending_topup_count > 0 && (
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
                            fontWeight: 'bold'
                          }}>
                            {user.pending_topup_count}
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <h2>{editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Họ tên</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                {editingUser && (
                  <div className="form-group">
                    <label>Mã khách hàng</label>
                    <input type="text" value={editingUser.customer_code} disabled />
                  </div>
                )}
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Địa chỉ</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows="2"
                  />
                </div>
                <div className="form-group">
                  <label>Số dư (VND)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.balance}
                    onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Vai trò</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="user">Người dùng</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Mật khẩu {editingUser && '(để trống nếu không đổi)'}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? '••••••' : ''}
                    required={!editingUser}
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Đang lưu...' : editingUser ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                  <button type="button" className="btn" onClick={closeModal}>
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {walletModalOpen && (
          <div className="modal-overlay" onClick={closeWalletModal}>
            <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
              <h2>Duyệt nạp tiền - {walletModalUser?.name}</h2>
              {walletLoading ? (
                <div className="loading">Đang tải...</div>
              ) : walletTransactions.length === 0 ? (
                <p>Không có giao dịch chờ duyệt.</p>
              ) : (
                <div className="admin-table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Số tiền</th>
                        <th>Phương thức</th>
                        <th>Thời gian</th>
                        <th>Ghi chú</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {walletTransactions.map(txn => (
                        <tr key={txn.id}>
                          <td>{txn.id}</td>
                          <td>{formatCurrency(txn.amount)}</td>
                          <td>{txn.method?.toUpperCase()}</td>
                          <td>{new Date(txn.created_at).toLocaleString('vi-VN')}</td>
                          <td>{txn.note || '-'}</td>
                          <td>
                            <button className="btn btn-primary" onClick={() => handleApproveTopup(txn.id)}>
                              Duyệt
                            </button>
                            <button className="btn btn-danger" onClick={() => handleRejectTopup(txn.id)}>
                              Từ chối
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="modal-actions">
                <button className="btn" onClick={closeWalletModal}>
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;

