import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navbar sẽ đặt ở đây */}
        <Routes>
          <Route path="/" element={<h1>Home Page (Dang xay dung)</h1>} />
          <Route path="/login" element={<h1>Login Page</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;