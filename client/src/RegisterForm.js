import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RegisterForm.css'; // Ensure this is correctly linked

const RegisterForm = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    contact_number: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Check if any field is empty
    if (Object.values(userData).some(value => value === '')) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      await axios.post('http://localhost:8000/users/register', userData);
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error.response.data.detail);
    }
  };

  const capitalizeFirstLetter = (str) => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="register-form-container">
      <div className="project-name">Resort Rapid Transit</div>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <form className="register-form" onSubmit={handleSubmit}>
        {/* Iterate over userData keys to create form fields */}
        {Object.keys(userData).map((key) => (
          <div className="form-group" key={key}>
            <label htmlFor={key}>{capitalizeFirstLetter(key.replace('_', ' '))}</label>
            <input
              id={key}
              type={key === 'password' ? 'password' : 'text'}
              name={key}
              value={userData[key]}
              onChange={(e) => setUserData({ ...userData, [key]: e.target.value })}
              className="form-control"
            />
          </div>
        ))}
        <button type="submit" className="btn register-btn">Register</button>
        <button type="button" className="btn link-btn" onClick={() => navigate('/login')}>Log In</button>
      </form>
    </div>
  );
};

export default RegisterForm;
