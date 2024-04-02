import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RegisterForm.css'; // Ensure this is correctly linked
import REACT_APP_API_URL from './config'; // Import the API URL from the config file

const RegisterForm = () => {
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    name: '', // Changed from full_name to match the backend schema
    role: 'guest', // Added role, with a default value of 'guest'
    // Removed username and contact_number
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Check if any field is empty, excluding the role
    if (Object.entries(userData).some(([key, value]) => value === '' && key !== 'role')) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      await axios.post(`${REACT_APP_API_URL}/users/register`, userData);
      navigate('/login'); // Redirect to login page on successful registration
    } catch (error) {
      setError('Registration failed: ' + error.response.data.detail);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  return (
    <div className="register-form-container">
      <div className="project-name">Resort Rapid Transit</div>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
            className="form-control"
          />
        </div>
        {/* Optionally, let users choose their role; you might want to remove this for production */}
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={userData.role}
            onChange={handleChange}
            className="form-control"
          >
            <option value="guest">Guest</option>
            <option value="admin">Admin</option> {/* Be cautious with admin role registration */}
          </select>
        </div>
        <button type="submit" className="btn register-btn">Register</button>
        <button type="button" className="btn link-btn" onClick={() => navigate('/login')}>Already have an account? Log In</button>
      </form>
    </div>
  );
};

export default RegisterForm;
