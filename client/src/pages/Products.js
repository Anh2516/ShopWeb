// Đường dẫn: client/src/components/common/BackButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(-1)} 
      style={{
        padding: '8px 16px',
        marginBottom: '20px',
        cursor: 'pointer',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}
    >
      &larr; Quay lại
    </button>
  );
};

export default BackButton;