// CheckOut.js
import React, { useState } from 'react';
import axios from 'axios';

const CheckOut = () => {
  const [email, setEmail] = useState('');

  const handleCheckOut = async () => {
    try {
      await axios.post('http://localhost:8000/guests/check-out', { email }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('Check-out successful');
    } catch (error) {
      alert('Check-out failed');
    }
  };

  return (
    <div>
      <h2>Check-Out</h2>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <button onClick={handleCheckOut}>Check Out</button>
    </div>
  );
};

export default CheckOut;
