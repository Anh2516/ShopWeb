import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import BackButton from '../components/common/BackButton';
import './Products.css';
import { formatCurrency } from '../utils/currency';
import axios from 'axios';

const Products = () => {
  const dispatch = useDispatch();
  const { items, loading, pagination, error } = useSelector(state => state.products);
  const [bestSellers, setBestSellers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    dispatch(fetchProducts({ search, page, limit: 12, category: selectedCategory || undefined }));
    if (page === 1 && !search && !selectedCategory) {
      fetchBestSellers();
    }
  }, [dispatch, search, page, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/products/categories/list');
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Lỗi lấy categories:', error);
    }
  };

  const fetchBestSellers = async () => {
    try {
      const response = await fetch('/api/products/best-sellers');
      if (!response.ok) return;
      const data = await response.json();
      setBestSellers(data.bestSellers || []);
    } catch (error) {
      console.error('Lỗi lấy best seller:', error);
    }
  };

  return (
    <div className="main-content">
      <div className="container">
        <BackButton />
        <h1 className="page-title">Danh sách sản phẩm</h1>
        
        <div className="products-filters">
          <div className="filters-row">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="search-input"
            />
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="category-select"
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : error ? (
          <div className="error-message">
            <p>❌ Lỗi: {error}</p>
            <button onClick={() => dispatch(fetchProducts({ search, page, limit: 12 }))} className="btn btn-primary">
              Thử lại
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-message">
            <p>Không có sản phẩm nào</p>
          </div>
        ) : (
          <>
            {bestSellers.length > 0 && (
              <div className="best-seller-section">
                <h2>Sản phẩm bán chạy</h2>
                <div className="best-seller-grid">
                  {bestSellers.map(product => (
                    <div key={product.id} className="best-seller-card">
                      <img src={product.image || '/placeholder.jpg'} alt={product.name} />
                      <div className="best-seller-info">
                        <h3>{product.name}</h3>
                        <p>Đã bán: {product.total_sold}</p>
                        <Link to={`/products/${product.id}`} className="btn btn-primary">
                          Mua ngay
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="products-grid">
              {items.map(product => (
                <div key={product.id} className="product-card">
                  <img src={product.image || '/placeholder.jpg'} alt={product.name} />
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description?.substring(0, 100)}...</p>
                    <p className="product-price">{formatCurrency(product.price)}</p>
                    <p className="product-stock">Còn lại: {product.stock} sản phẩm</p>
                    <Link to={`/products/${product.id}`} className="btn btn-primary">
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn"
                >
                  Trước
                </button>
                <span>Trang {page} / {pagination.pages}</span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="btn"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;

