import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, clearCurrentProduct } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import BackButton from '../components/common/BackButton';
import './ProductDetail.css';
import { formatCurrency } from '../utils/currency';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduct, loading, error } = useSelector(state => state.products);
  const { isAuthenticated } = useSelector(state => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    // Clear current product và error khi ID thay đổi
    dispatch(clearCurrentProduct());
    setSelectedImage(null);
    setGalleryImages([]);
    // Fetch sản phẩm mới
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (currentProduct) {
      // Lấy danh sách ảnh gallery
      const fetchImages = async () => {
        try {
          const response = await fetch(`/api/products/${id}/images`);
          if (!response.ok) {
            throw new Error('Không thể lấy ảnh');
          }
          const data = await response.json();
          setGalleryImages(data.images || []);
          // Set ảnh đầu tiên làm ảnh được chọn, hoặc ảnh đại diện nếu không có gallery
          if (data.images && data.images.length > 0) {
            setSelectedImage(data.images[0].url);
          } else if (currentProduct.image) {
            setSelectedImage(currentProduct.image);
          } else {
            setSelectedImage(null);
          }
        } catch (error) {
          console.error('Lỗi lấy ảnh:', error);
          // Nếu không có gallery, dùng ảnh đại diện
          if (currentProduct.image) {
            setSelectedImage(currentProduct.image);
          } else {
            setSelectedImage(null);
          }
          setGalleryImages([]);
        }
      };
      fetchImages();
    } else {
      // Clear images khi không có product
      setSelectedImage(null);
      setGalleryImages([]);
    }
  }, [currentProduct, id]);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }

    if (currentProduct) {
      dispatch(addToCart({ product: currentProduct, quantity }));
      alert('Đã thêm vào giỏ hàng!');
    }
  };

  if (loading) {
    return <div className="main-content"><div className="loading">Đang tải...</div></div>;
  }

  if (error) {
    return (
      <div className="main-content">
        <div className="container">
          <BackButton fallback="/products" />
          <div className="error">
            <p>{error}</p>
            <button onClick={() => navigate('/products')} className="btn btn-primary" style={{ marginTop: '20px' }}>
              Quay lại danh sách sản phẩm
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProduct && !loading) {
    return (
      <div className="main-content">
        <div className="container">
          <BackButton fallback="/products" />
          <div className="error">
            <p>Không tìm thấy sản phẩm</p>
            <button onClick={() => navigate('/products')} className="btn btn-primary" style={{ marginTop: '20px' }}>
              Quay lại danh sách sản phẩm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="container">
        <BackButton fallback="/products" />
        <div className="product-detail">
          <div className="product-image">
            <div className="main-image">
              <img src={selectedImage || currentProduct.image || '/placeholder.jpg'} alt={currentProduct.name} />
            </div>
            {galleryImages.length > 0 && (
              <div className="image-gallery">
                {currentProduct.image && (
                  <div
                    className={`gallery-thumb ${selectedImage === currentProduct.image ? 'active' : ''}`}
                    onClick={() => setSelectedImage(currentProduct.image)}
                  >
                    <img src={currentProduct.image} alt="Thumbnail" />
                  </div>
                )}
                {galleryImages.map((img) => (
                  <div
                    key={img.id}
                    className={`gallery-thumb ${selectedImage === img.url ? 'active' : ''}`}
                    onClick={() => setSelectedImage(img.url)}
                  >
                    <img src={img.url} alt={`Gallery ${img.id}`} />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="product-details">
            <h1>{currentProduct.name}</h1>
            <p className="product-price">{formatCurrency(currentProduct.price)}</p>
            <p className="product-description">{currentProduct.description}</p>
            <p className="product-stock">Còn lại: {currentProduct.stock} sản phẩm</p>
            
            <div className="quantity-selector">
              <label>Số lượng:</label>
              <input
                type="number"
                min="1"
                max={currentProduct.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="product-actions">
              <button
                onClick={handleAddToCart}
                disabled={currentProduct.stock === 0}
                className="btn btn-primary"
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

