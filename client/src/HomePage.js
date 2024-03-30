// HomePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckIn from './CheckIn';
import CheckOut from './CheckOut';
import MakeReservation from './MakeReservation';
import ViewReservations from './ViewReservations';

const HomePage = () => {
  const [action, setAction] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div>
      <h1>Welcome to the Resort Transportation Management System</h1>
      <button onClick={() => setAction('checkIn')}>Check-In</button>
      <button onClick={() => setAction('checkOut')}>Check-Out</button>
      <button onClick={() => setAction('makeReservation')}>Make Reservation</button>
      <button onClick={() => setAction('viewReservations')}>View Reservations</button>
      <button variant="danger" onClick={handleLogout}>Logout</button>
      
      {action === 'checkIn' && <CheckIn />}
      {action === 'checkOut' && <CheckOut />}
      {action === 'makeReservation' && <MakeReservation />}
      {action === 'viewReservations' && <ViewReservations />}
    </div>
  );
};

export default HomePage;
