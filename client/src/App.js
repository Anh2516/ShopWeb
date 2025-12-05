import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import './App.css'; // Đảm bảo file này tồn tại

// Import các component ĐÃ CÓ của Người A
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <Navbar /> {/* Hiển thị thanh điều hướng */}
          
          <Routes>
            {/* Các Route công khai */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Các Route chưa làm (Cart, Detail, Admin...) thì KHOAN hãy khai báo */}
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;