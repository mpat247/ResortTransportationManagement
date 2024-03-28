import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <h1>Welcome to the Resort Transportation Management System</h1>
      <Button variant="danger" onClick={handleLogout}>Logout</Button>
    </div>
  );
};

export default HomePage;
