import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import GuestView from './GuestView';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (!role) {
      navigate('/login');
    } else {
      setUserRole(role);
    }
  }, [navigate]);

  return (
    <Container>
              <div className="project-name">Resort Rapid Transit</div>

      {userRole === 'guest' && <GuestView />}
      {/* AdminView can be implemented similarly */}
    </Container>
  );
};

export default HomePage;
