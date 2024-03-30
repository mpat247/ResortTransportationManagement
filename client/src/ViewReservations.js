// ViewReservations.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ViewReservations = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const { data } = await axios.get('http://localhost:8000/guests/reservations/{email}', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setReservations(data);
      } catch (error) {
        alert('Failed to fetch reservations');
      }
    };
    fetchReservations();
  }, []);

  return (
    <div>
      <h2>Your Reservations</h2>
      <ul>
        {reservations.map((reservation, index) => (
          <li key={index}>
            Room Number: {reservation.room_number}, Start Date: {reservation.start_date}, End Date: {reservation.end_date}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewReservations;
