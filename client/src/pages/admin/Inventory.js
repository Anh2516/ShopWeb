import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import BackButton from '../../components/common/BackButton';
import './Admin.css';
import { formatCurrency } from '../../utils/currency';

const initialForm = {
  product_name: '',
  product_image: '',
  quantity: 1,
  unit_cost: 0,
  note: '',
  supplier_name: '',
  supplier_contact: '',
  supplier_email: '',
  supplier_address: ''
};

const Inventory = () => {
  const { token } = useSelector(state => state.auth);
  const [entries, setEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const authHeader = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  const fetchEntries = async (keyword = '') => {
    const response = await axios.get('/api/inventory', {
      ...authHeader,
      params: keyword ? { search: keyword } : {}
    });
    setEntries(response.data.entries || []);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchEntries(debouncedSearch);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      loadData();
    }
  }, [token, debouncedSearch]);

  const openModal = (entry = null) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        product_name: entry.product_name || '',
        product_image: entry.product_image || '',
        quantity: entry.quantity,
        unit_cost: entry.unit_cost,
        note: entry.note || '',
        supplier_name: entry.supplier_name || '',
        supplier_contact: entry.supplier_contact || '',
        supplier_email: entry.supplier_email || '',
        supplier_address: entry.supplier_address || ''
      });
    } else {
      setEditingEntry(null);
      setFormData(initialForm);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEntry(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        product_name: formData.product_name,
        product_image: formData.product_image,
        quantity: Number(formData.quantity),
        unit_cost: Number(formData.unit_cost),
        note: formData.note,
        supplier_name: formData.supplier_name,
        supplier_contact: formData.supplier_contact,
        supplier_email: formData.supplier_email,
        supplier_address: formData.supplier_address
      };

      if (!payload.product_name) {
        alert('Vui lòng nhập tên sản phẩm');
        setSubmitting(false);
        return;
      }
      if (!payload.product_image) {
        alert('Vui lòng nhập link ảnh sản phẩm');
        setSubmitting(false);
        return;
      }

      if (editingEntry) {
        await axios.put(`/api/inventory/${editingEntry.id}`, payload, authHeader);
      } else {
        await axios.post('/api/inventory', payload, authHeader);
      }
      await fetchEntries(debouncedSearch);
      closeModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể lưu phiếu nhập');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Xác nhận xóa phiếu nhập này?')) return;
    try {
      await axios.delete(`/api/inventory/${entryId}`, authHeader);
      await fetchEntries(debouncedSearch);
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể xóa phiếu nhập');
    }
  };

  const totalStockValue = entries.reduce((sum, entry) => sum + entry.total_cost, 0);

  return (
    <div className="main-content">
      <div className="container">
        <div className="admin-header">
          <h1>Quản lý nhập kho</h1>
          <div className="admin-filters">
            <BackButton />
            <input
              type="text"
              className="admin-search"
              placeholder="Tìm theo sản phẩm, nhà cung cấp, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => openModal()} className="btn btn-primary">
              Thêm phiếu nhập
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Số phiếu nhập</h3>
            <p className="stat-value">{entries.length}</p>
          </div>
          <div className="stat-card">
            <h3>Tổng giá trị nhập</h3>
            <p className="stat-value">{formatCurrency(totalStockValue)}</p>
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
                  <th>Sản phẩm</th>
                  <th>Ảnh</th>
                  <th>Nhà cung cấp</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Tổng giá trị</th>
                  <th>Ghi chú</th>
                  <th>Người tạo</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id}>
                    <td>{entry.id}</td>
                    <td>{entry.product_name}</td>
                    <td>
                      {entry.product_image ? (
                        <img src={entry.product_image} alt={entry.product_name} className="inventory-thumb" />
                      ) : 'N/A'}
                    </td>
                    <td>
                      <div><strong>{entry.supplier_name}</strong></div>
                      {entry.supplier_contact && <div>{entry.supplier_contact}</div>}
                      {entry.supplier_email && <div>{entry.supplier_email}</div>}
                      {entry.supplier_address && <div>{entry.supplier_address}</div>}
                    </td>
                    <td>{entry.quantity}</td>
                    <td>{formatCurrency(entry.unit_cost)}</td>
                    <td>{formatCurrency(entry.total_cost)}</td>
                    <td>{entry.note || '-'}</td>
                    <td>{entry.created_by_name || 'N/A'}</td>
                    <td>{new Date(entry.created_at).toLocaleString('vi-VN')}</td>
                    <td>
                      <button className="btn btn-primary" onClick={() => openModal(entry)}>
                        Sửa
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(entry.id)}>
                        Xóa
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
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingEntry ? 'Cập nhật phiếu nhập' : 'Thêm phiếu nhập mới'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Tên sản phẩm nhập kho</label>
                  <input
                    type="text"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Link ảnh sản phẩm</label>
                  <input
                    type="text"
                    value={formData.product_image}
                    onChange={(e) => setFormData({ ...formData, product_image: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Số lượng</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Đơn giá (VND)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Nhà cung cấp</label>
                  <input
                    type="text"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Liên hệ nhà cung cấp</label>
                  <input
                    type="text"
                    value={formData.supplier_contact}
                    onChange={(e) => setFormData({ ...formData, supplier_contact: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email nhà cung cấp</label>
                  <input
                    type="email"
                    value={formData.supplier_email}
                    onChange={(e) => setFormData({ ...formData, supplier_email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Địa chỉ nhà cung cấp</label>
                  <textarea
                    rows="2"
                    value={formData.supplier_address}
                    onChange={(e) => setFormData({ ...formData, supplier_address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Ghi chú</label>
                  <textarea
                    rows="3"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  />
                </div>
                <div className="form-summary">
                  <span>Tổng giá trị: </span>
                  <strong>{formatCurrency(Number(formData.quantity) * Number(formData.unit_cost))}</strong>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Đang lưu...' : editingEntry ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  <button type="button" className="btn" onClick={closeModal}>
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;


