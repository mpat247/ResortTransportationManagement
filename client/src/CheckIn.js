// CheckIn.js
import React, { useState } from 'react';
import axios from 'axios';

const CheckIn = () => {
  const [email, setEmail] = useState('');

  const handleCheckIn = async () => {
    try {
      await axios.post('http://localhost:8000/guests/check-in', { email }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Check-in successful');
    } catch (error) {
      alert('Check-in failed');
    }
  };

  return (
    <div>
      <h2>Check-In</h2>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <button onClick={handleCheckIn}>Check In</button>
    </div>
  );
};

export default CheckIn;
