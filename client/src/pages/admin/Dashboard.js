import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Icon from '../../components/common/Icon';
import SimpleLineChart from '../../components/charts/SimpleLineChart';
import SimpleBarChart from '../../components/charts/SimpleBarChart';
import BackButton from '../../components/common/BackButton';
import './Admin.css';
import { formatCurrency } from '../../utils/currency';

const Dashboard = () => {
  const { token } = useSelector(state => state.auth);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    profit: 0,
    recentOrders: 0,
    totalBalance: 0
  });
  const [bestSellers, setBestSellers] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('7');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data.stats);
        setBestSellers(response.data.bestSellers || []);
      } catch (error) {
        console.error('Lỗi lấy thống kê:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  useEffect(() => {
    const fetchRevenueChart = async () => {
      try {
        const response = await axios.get(`/api/admin/revenue-chart?period=${chartPeriod}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Format dữ liệu cho chart
        const formattedData = response.data.data.map(item => ({
          date: new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          revenue: parseFloat(item.revenue) || 0,
          orders: item.orders || 0
        }));
        setRevenueData(formattedData);
      } catch (error) {
        console.error('Lỗi lấy dữ liệu chart:', error);
      }
    };
    if (token) {
      fetchRevenueChart();
    }
  }, [token, chartPeriod]);

  if (loading) {
    return <div className="main-content"><div className="loading">Đang tải...</div></div>;
  }

  const statCards = [
    { 
      title: 'Tổng người dùng', 
      value: stats.totalUsers, 
      icon: 'users', 
      color: '#007bff',
      bgColor: '#e7f3ff'
    },
    { 
      title: 'Tổng sản phẩm', 
      value: stats.totalProducts, 
      icon: 'box', 
      color: '#28a745',
      bgColor: '#e6f4ea'
    },
    { 
      title: 'Tổng đơn hàng', 
      value: stats.totalOrders, 
      icon: 'shoppingCart', 
      color: '#ffc107',
      bgColor: '#fff8e1'
    },
    { 
      title: 'Doanh thu', 
      value: formatCurrency(stats.totalRevenue), 
      icon: 'dollarSign', 
      color: '#17a2b8',
      bgColor: '#e0f7fa'
    },
    { 
      title: 'Lợi nhuận', 
      value: formatCurrency(stats.profit), 
      icon: 'chartLine', 
      color: '#28a745',
      bgColor: '#e6f4ea'
    },
    { 
      title: 'Số dư khách hàng', 
      value: formatCurrency(stats.totalBalance), 
      icon: 'wallet', 
      color: '#6f42c1',
      bgColor: '#f3e5f5'
    },
    { 
      title: 'Đơn hàng hôm nay', 
      value: stats.recentOrders, 
      icon: 'calendarDay', 
      color: '#dc3545',
      bgColor: '#fdecea'
    }
  ];

  return (
    <div className="main-content">
      <div className="container">
        <BackButton />
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icon name="chartLine" size={24} color="#007bff" />
          Dashboard Admin
        </h1>
        
        {/* Stat Cards */}
        <div className="stats-grid">
          {statCards.map((card, index) => (
            <div key={index} className="stat-card" style={{ 
              borderLeft: `4px solid ${card.color}`,
              backgroundColor: '#fff'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '15px'
              }}>
                <h3 style={{ margin: 0, color: '#666', fontSize: '14px' }}>{card.title}</h3>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: card.bgColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon name={card.icon} size={20} color={card.color} />
                </div>
              </div>
              <p className="stat-value" style={{ color: card.color, margin: 0 }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          {/* Revenue Chart */}
          <div className="chart-card chart-card-revenue">
            <div className="chart-header">
              <div className="chart-title-wrapper">
                <div className="chart-icon-wrapper chart-icon-revenue">
                  <Icon name="dollarSign" size={24} color="#fff" />
                </div>
                <div>
                  <h2 className="chart-title">Doanh thu theo thời gian</h2>
                  <p className="chart-subtitle">Tổng doanh thu từ các đơn hàng</p>
                </div>
              </div>
              <select
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value)}
                className="chart-period-select"
              >
                <option value="7">7 ngày qua</option>
                <option value="30">30 ngày qua</option>
                <option value="365">1 năm qua</option>
              </select>
            </div>
            <div className="chart-wrapper">
              <SimpleLineChart
                data={revenueData}
                dataKey="revenue"
                color="#10b981"
                label="Doanh thu"
                formatter={(value) => formatCurrency(value)}
              />
            </div>
          </div>

          {/* Orders Chart */}
          <div className="chart-card chart-card-orders">
            <div className="chart-header">
              <div className="chart-title-wrapper">
                <div className="chart-icon-wrapper chart-icon-orders">
                  <Icon name="shoppingCart" size={24} color="#fff" />
                </div>
                <div>
                  <h2 className="chart-title">Số đơn hàng theo thời gian</h2>
                  <p className="chart-subtitle">Tổng số đơn hàng đã hoàn thành</p>
                </div>
              </div>
            </div>
            <div className="chart-wrapper">
              <SimpleBarChart
                data={revenueData}
                dataKey="orders"
                color="#f59e0b"
                label="Số đơn hàng"
                formatter={(value) => `${Math.round(value)} đơn`}
              />
            </div>
          </div>
        </div>

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <div className="best-seller-section" style={{ marginTop: '40px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Icon name="trophy" size={20} color="#ffc107" />
              Sản phẩm bán chạy
            </h2>
            <div className="best-seller-grid">
              {bestSellers.map((product, index) => (
                <div key={product.id} className="best-seller-card" style={{
                  position: 'relative'
                }}>
                  {index === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '-10px',
                      backgroundColor: '#ffc107',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                      <Icon name="trophy" size={16} color="#fff" />
                    </div>
                  )}
                  <img src={product.image || '/placeholder.jpg'} alt={product.name} />
                  <div className="best-seller-info">
                    <h3>{product.name}</h3>
                    <p style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '5px',
                      color: '#28a745',
                      fontWeight: 'bold'
                    }}>
                      <Icon name="shoppingCart" size={16} color="#28a745" /> Đã bán: {product.total_sold}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
