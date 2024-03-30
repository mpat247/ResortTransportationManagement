// MakeReservation.js
import React, { useState } from 'react';
import axios from 'axios';

const MakeReservation = () => {
  const [reservationData, setReservationData] = useState({
    email: '', room_number: '', start_date: '', end_date: ''
  });

  const handleChange = (e) => {
    setReservationData({ ...reservationData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/guests/reservations', reservationData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Reservation made successfully');
    } catch (error) {
      alert('Failed to make reservation');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Make a Reservation</h2>
      {/* Add inputs for email, room_number, start_date, end_date */}
      <button type="submit">Submit</button>
    </form>
  );
};

export default MakeReservation;
