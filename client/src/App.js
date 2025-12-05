import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navbar chưa có nên tạm thời comment lại */}
        {/* <Navbar /> */}
        
        <Routes>
          {/* Tạm thời redirect trang chủ về Login để test */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Các route khác chưa làm xong thì chưa khai báo */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;