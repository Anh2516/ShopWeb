import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import './Home.css';
import { formatCurrency } from '../utils/currency';

const Home = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8 }));
  }, [dispatch]);

  return (
    <div className="main-content">
      <div className="hero-section">
        <div className="container">
          <h1>Chào mừng đến với ShopWeb</h1>
          <p>Khám phá các sản phẩm tuyệt vời với giá cả hợp lý</p>
          <Link to="/products" className="btn btn-primary">Xem sản phẩm</Link>
        </div>
      </div>

      <div className="container">
        <h2 className="section-title">Sản phẩm nổi bật</h2>
        {loading ? (
          <div className="loading">Đang tải...</div>
        ) : error ? (
          <div className="error-message">
            <p>❌ Lỗi: {error}</p>
            <button onClick={() => dispatch(fetchProducts({ limit: 8 }))} className="btn btn-primary">
              Thử lại
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-message">
            <p>Không có sản phẩm nào</p>
          </div>
        ) : (
          <div className="products-grid">
            {items.slice(0, 8).map(product => (
              <div key={product.id} className="product-card">
                <img src={product.image || '/placeholder.jpg'} alt={product.name} />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-price">{formatCurrency(product.price)}</p>
                  <Link to={`/products/${product.id}`} className="btn btn-primary">
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

