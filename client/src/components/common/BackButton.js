import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ label = 'Quay lại', fallback = '/' }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button type="button" className="btn btn-outline-secondary back-button" onClick={handleBack}>
      ← {label}
    </button>
  );
};

export default BackButton;


