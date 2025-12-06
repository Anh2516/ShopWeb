import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, createProduct, updateProduct, deleteProduct, toggleProductVisibility } from '../../store/slices/productSlice';
import axios from 'axios';
import './Admin.css';
import BackButton from '../../components/common/BackButton';
import { formatCurrency } from '../../utils/currency';

const Products = () => {
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);
  const { items, loading } = useSelector(state => state.products);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image: '',
    is_visible: true
  });
  const [productImages, setProductImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [token]);

  useEffect(() => {
    dispatch(fetchProducts({ admin: true, limit: 1000, search: debouncedSearch || undefined }));
  }, [dispatch, debouncedSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      if (!token) return;
      const response = await axios.get('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Lỗi lấy categories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      category_id: formData.category_id ? Number(formData.category_id) : null
    };

    if (editingProduct) {
      const result = await dispatch(updateProduct({ id: editingProduct.id, productData: payload }));
      
      // Kiểm tra nếu cập nhật thành công
      if (result.type === 'products/updateProduct/fulfilled') {
        // Refresh danh sách sản phẩm
        await dispatch(fetchProducts({ admin: true, limit: 1000, search: debouncedSearch || undefined }));
        
        // Đóng modal và reset form
        setShowModal(false);
        setEditingProduct(null);
        setProductImages([]);
        setNewImageUrl('');
        setFormData({
          name: '',
          description: '',
          price: '',
          stock: '',
          category_id: '',
          image: '',
          is_visible: true
        });
      } else {
        // Nếu có lỗi, hiển thị thông báo
        alert(result.payload || 'Có lỗi xảy ra khi cập nhật sản phẩm');
      }
    } else {
      const result = await dispatch(createProduct(payload));
    await dispatch(fetchProducts({ admin: true, limit: 1000, search: debouncedSearch || undefined }));
      // Nếu tạo mới thành công, set editingProduct để có thể thêm ảnh
      if (result.type === 'products/createProduct/fulfilled' && result.payload && result.payload.id) {
        setEditingProduct(result.payload);
        setProductImages([]);
      } else {
        // Nếu không thành công, đóng modal
    setShowModal(false);
    setEditingProduct(null);
        setProductImages([]);
        setNewImageUrl('');
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      image: '',
      is_visible: true
    });
        if (result.type === 'products/createProduct/rejected') {
          alert(result.payload || 'Có lỗi xảy ra khi tạo sản phẩm');
        }
      }
    }
  };

  const fetchProductImages = async (productId) => {
    try {
      const response = await axios.get(`/api/products/${productId}/images`);
      setProductImages(response.data.images || []);
    } catch (error) {
      console.error('Lỗi lấy ảnh sản phẩm:', error);
      setProductImages([]);
    }
  };

  const handleEdit = async (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category_id: product.category_id || '',
      image: product.image || '',
      is_visible: Boolean(product.is_visible)
    });
    await fetchProductImages(product.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      await dispatch(deleteProduct(id));
    }
  };

  const handleToggleVisibility = async (product) => {
    await dispatch(toggleProductVisibility({ id: product.id, isVisible: !product.is_visible }));
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!newImageUrl.trim() || !editingProduct) return;

    try {
      const response = await axios.post(
        `/api/products/${editingProduct.id}/images`,
        { image_url: newImageUrl.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProductImages([...productImages, response.data.image]);
      setNewImageUrl('');
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể thêm ảnh');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này?')) return;

    try {
      await axios.delete(
        `/api/products/${editingProduct.id}/images/${imageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProductImages(productImages.filter(img => img.id !== imageId));
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể xóa ảnh');
    }
  };

  const handleMoveImage = async (imageId, direction) => {
    const index = productImages.findIndex(img => img.id === imageId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= productImages.length) return;

    const newImages = [...productImages];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];

    try {
      await axios.put(
        `/api/products/${editingProduct.id}/images/${imageId}/order`,
        { display_order: newIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await axios.put(
        `/api/products/${editingProduct.id}/images/${newImages[newIndex].id}/order`,
        { display_order: index },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProductImages(newImages);
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể sắp xếp ảnh');
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        <div className="admin-header">
          <h1>Quản lý sản phẩm</h1>
          <div className="admin-filters">
            <BackButton />
            <input
              type="text"
              className="admin-search"
              placeholder="Tìm theo tên, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              Thêm sản phẩm
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
                  <th>Ảnh</th>
                  <th>Tên</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Danh mục</th>
                  <th>Trưng bày</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>
                      {product.image ? (
                        <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                      ) : (
                        <span style={{ color: '#999' }}>Chưa có ảnh</span>
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>{formatCurrency(product.price)}</td>
                    <td>{product.stock}</td>
                    <td>{product.category_name || 'N/A'}</td>
                    <td>
                      <span className={`visibility-badge ${product.is_visible ? 'visible' : 'hidden'}`}>
                        {product.is_visible ? 'Đang hiển thị' : 'Đang ẩn'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(product)}
                        className="btn btn-secondary"
                      >
                        {product.is_visible ? 'Ẩn' : 'Hiện'}
                      </button>
                    </td>
                    <td>
                      <button onClick={() => handleEdit(product)} className="btn btn-primary">
                        Sửa
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="btn btn-danger">
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
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Tên sản phẩm</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Giá</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Tồn kho</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Danh mục</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>URL ảnh đại diện (thumbnail)</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="URL ảnh hiển thị ở danh sách sản phẩm"
                      style={{ flex: 1 }}
                    />
                    <label className="btn btn-secondary" style={{ margin: 0, cursor: 'pointer' }}>
                      📤 Upload từ máy
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          setUploadingImage(true);
                          try {
                            const formData = new FormData();
                            formData.append('image', file);
                            
                            const response = await axios.post('/api/upload/image', formData, {
                              headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'multipart/form-data'
                              }
                            });
                            
                            if (response.data.success && response.data.url) {
                              setFormData({ ...formData, image: response.data.url });
                              alert('Upload ảnh thành công!');
                            }
                          } catch (error) {
                            alert(error.response?.data?.message || 'Lỗi khi upload ảnh');
                          } finally {
                            setUploadingImage(false);
                            e.target.value = ''; // Reset input
                          }
                        }}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                  {uploadingImage && <p style={{ color: '#007bff', marginTop: '5px' }}>Đang upload...</p>}
                  {formData.image && (
                    <div style={{ marginTop: '10px' }}>
                      <img src={formData.image} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ddd', borderRadius: '4px' }} />
                    </div>
                  )}
                </div>
                {editingProduct && (
                  <div className="form-group">
                    <label>Quản lý ảnh sản phẩm (Gallery)</label>
                    <div style={{ marginBottom: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        placeholder="Nhập URL ảnh mới"
                        style={{ flex: 1, minWidth: '200px' }}
                      />
                      <button type="button" onClick={handleAddImage} className="btn btn-primary" disabled={!newImageUrl.trim()}>
                        Thêm URL
                      </button>
                      <label className="btn btn-secondary" style={{ margin: 0, cursor: 'pointer' }}>
                        📤 Upload từ máy
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            
                            setUploadingGalleryImage(true);
                            try {
                              const formData = new FormData();
                              formData.append('image', file);
                              
                              const response = await axios.post('/api/upload/image', formData, {
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                  'Content-Type': 'multipart/form-data'
                                }
                              });
                              
                              if (response.data.success && response.data.url) {
                                // Tự động thêm ảnh vào gallery
                                try {
                                  const addResponse = await axios.post(
                                    `/api/products/${editingProduct.id}/images`,
                                    { image_url: response.data.url },
                                    { headers: { Authorization: `Bearer ${token}` } }
                                  );
                                  setProductImages([...productImages, addResponse.data.image]);
                                  alert('Upload và thêm ảnh thành công!');
                                } catch (addError) {
                                  // Nếu không thêm được vào gallery, chỉ set URL để user có thể thêm thủ công
                                  setNewImageUrl(response.data.url);
                                  alert('Upload thành công! URL đã được điền sẵn, vui lòng click "Thêm URL" để thêm vào gallery.');
                                }
                              }
                            } catch (error) {
                              alert(error.response?.data?.message || 'Lỗi khi upload ảnh');
                            } finally {
                              setUploadingGalleryImage(false);
                              e.target.value = ''; // Reset input
                            }
                          }}
                          disabled={uploadingGalleryImage}
                        />
                      </label>
                    </div>
                    {uploadingGalleryImage && <p style={{ color: '#007bff', marginTop: '5px' }}>Đang upload...</p>}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
                      {productImages.map((img, index) => (
                        <div key={img.id} style={{ position: 'relative', border: '1px solid #ddd', borderRadius: '4px', padding: '5px' }}>
                          <img src={img.url} alt={`Image ${index + 1}`} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
                          <div style={{ display: 'flex', gap: '5px', marginTop: '5px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(img.id, 'up')}
                              disabled={index === 0}
                              className="btn btn-secondary"
                              style={{ fontSize: '12px', padding: '5px 10px' }}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(img.id, 'down')}
                              disabled={index === productImages.length - 1}
                              className="btn btn-secondary"
                              style={{ fontSize: '12px', padding: '5px 10px' }}
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(img.id)}
                              className="btn btn-danger"
                              style={{ fontSize: '12px', padding: '5px 10px' }}
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {productImages.length === 0 && (
                      <p style={{ color: '#666', fontStyle: 'italic', marginTop: '10px' }}>Chưa có ảnh nào. Thêm ảnh để hiển thị trong trang chi tiết sản phẩm.</p>
                    )}
                  </div>
                )}
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_visible}
                      onChange={(e) => setFormData({ ...formData, is_visible: e.target.checked })}
                    />
                    Hiển thị trên gian hàng
                  </label>
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingProduct(null);
                      setProductImages([]);
                      setNewImageUrl('');
                    }}
                    className="btn"
                  >
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

export default Products;

