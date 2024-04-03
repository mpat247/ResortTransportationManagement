import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Carts.css'; // Ensure this points to the correct CSS file path

const Carts = ({ onCartSelected }) => {
  const [passengerCount, setPassengerCount] = useState(1);
  const [carts, setCarts] = useState([]);
  const [selectedCart, setSelectedCart] = useState(null);

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/carts');
        setCarts(response.data);
      } catch (error) {
        console.error('Failed to fetch carts:', error);
      }
    };
    fetchCarts();
  }, []);

  const findOptimalCart = () => {
    const availableCarts = carts.filter(cart => cart.status === 'available');
    const suitableCarts = availableCarts.filter(cart => cart.capacity >= passengerCount);
    const optimalCart = suitableCarts.sort((a, b) => a.capacity - b.capacity)[0];

    if (!optimalCart) {
      alert('No suitable cart found for the selected number of passengers.');
      return;
    }

    setSelectedCart(optimalCart);
    onCartSelected(optimalCart); // Trigger the callback with the selected cart
  };

  return (
    <div className="cart-selection-card">
      <h2>Select a Cart</h2>
      <div>
        <label>Number of Passengers:</label>
        <input
          type="number"
          value={passengerCount}
          onChange={(e) => setPassengerCount(parseInt(e.target.value, 10))}
          min="1"
        />
      </div>
      <button onClick={findOptimalCart}>Find Cart</button>
      {selectedCart && (
        <div className="selected-cart-info">
          <p>Selected Cart ID: {selectedCart.cart_id}</p>
          <p>Capacity: {selectedCart.capacity}</p>
        </div>
      )}
    </div>
  );
};

export default Carts;
