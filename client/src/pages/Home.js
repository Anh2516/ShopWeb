import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import './Home.css';
import { formatCurrency } from '../utils/currency';
import Icon from '../components/common/Icon';

const Home = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(state => state.products);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8 }));
  }, [dispatch]);

  const features = [
    { icon: 'shoppingBag', title: 'Sản phẩm đa dạng', desc: 'Hàng ngàn sản phẩm chất lượng cao' },
    { icon: 'wallet', title: 'Thanh toán dễ dàng', desc: 'Nhiều phương thức thanh toán tiện lợi' },
    { icon: 'shoppingCart', title: 'Giao hàng nhanh', desc: 'Miễn phí vận chuyển cho đơn hàng lớn' },
    { icon: 'users', title: 'Hỗ trợ 24/7', desc: 'Đội ngũ chăm sóc khách hàng chuyên nghiệp' }
  ];

  return (
    <div className="main-content">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background">
          <div className="hero-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="title-highlight">ShopWeb</span>
              <br />
              Mua sắm thông minh, tiết kiệm hơn
            </h1>
            <p className="hero-subtitle">
              Khám phá hàng ngàn sản phẩm chất lượng cao với giá cả hợp lý. 
              Trải nghiệm mua sắm trực tuyến tốt nhất tại Việt Nam.
            </p>
            <div className="hero-buttons">
              <Link to="/products" className="btn btn-primary btn-hero">
                <Icon name="shoppingBag" size={20} />
                Xem sản phẩm
              </Link>
              <Link to="/products" className="btn btn-outline btn-hero">
                Khám phá ngay
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-number">1000+</div>
                <div className="stat-label">Sản phẩm</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50K+</div>
                <div className="stat-label">Khách hàng</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">99%</div>
                <div className="stat-label">Hài lòng</div>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <Icon name="shoppingBag" size={40} />
            </div>
            <div className="floating-card card-2">
              <Icon name="wallet" size={40} />
            </div>
            <div className="floating-card card-3">
              <Icon name="shoppingCart" size={40} />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <Icon name={feature.icon} size={32} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-accent">Sản phẩm</span> nổi bật
            </h2>
            <p className="section-subtitle">Những sản phẩm được yêu thích nhất</p>
            <Link to="/products" className="section-link">
              Xem tất cả <Icon name="signIn" size={16} />
            </Link>
          </div>
          
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <p>Lỗi: {error}</p>
              <button onClick={() => dispatch(fetchProducts({ limit: 8 }))} className="btn btn-primary">
                Thử lại
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-message">
              <div className="empty-icon">📦</div>
              <p>Không có sản phẩm nào</p>
            </div>
          ) : (
            <div className="products-grid">
              {items.slice(0, 8).map((product, index) => (
                <div key={product.id} className="product-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="product-image-wrapper">
                    <img src={product.image || '/placeholder.jpg'} alt={product.name} />
                    <div className="product-overlay">
                      <Link to={`/products/${product.id}`} className="btn btn-primary btn-overlay">
                        Xem chi tiết
                      </Link>
                    </div>
                    {product.stock > 0 && (
                      <span className="product-badge">Còn hàng</span>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">{formatCurrency(product.price)}</p>
                    <Link to={`/products/${product.id}`} className="btn btn-outline btn-product">
                      <Icon name="shoppingCart" size={16} />
                      Thêm vào giỏ
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Sẵn sàng bắt đầu mua sắm?</h2>
            <p className="cta-subtitle">Tham gia cùng hàng ngàn khách hàng đã tin tưởng ShopWeb</p>
            <Link to="/products" className="btn btn-primary btn-cta">
              <Icon name="shoppingBag" size={20} />
              Khám phá ngay
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

