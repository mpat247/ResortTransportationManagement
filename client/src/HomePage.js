import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import GuestView from './GuestView';
import RouteOptimization from './RouteOptimization';
import Carts from './Carts';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [selectedCart, setSelectedCart] = useState(null); // State to store the selected cart

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (!role) {
      navigate('/login');
    } else {
      setUserRole(role);
    }
  }, [navigate]);

  // Function to handle cart selection from the Carts component
  const handleCartSelected = (cart) => {
    setSelectedCart(cart); // Update state with the selected cart
    console.log('Selected Cart:', cart); // For demonstration, you might want to do more here
  };

  return (
    <Container>
      <div className="project-name">Resort Rapid Transit</div>
      {userRole === 'guest' && <GuestView />}
      {/* Conditionally render Carts and RouteOptimization based on the role or other conditions */}
      <Carts onCartSelected={handleCartSelected} />
      <RouteOptimization selectedCart={selectedCart} /> {/* Pass selectedCart as a prop if needed */}
      {/* AdminView can be implemented similarly */}
    </Container>
  );
};

export default HomePage;
