import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css'; // Import the CSS file for styling
import qs from 'qs';
import REACT_APP_API_URL from './config'; // Import the API URL from the config file

const LoginForm = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const emailRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    // Check if email or password is empty
    if (credentials.email === '' || credentials.password === '') {
      setError('Please enter email and password.');
      emailRef.current.focus();
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.post(`${REACT_APP_API_URL}/users/login`, 
        qs.stringify({
          username: credentials.email, // The API expects 'username' in the form data, but we use 'email' for clarity
          password: credentials.password
        }), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('role', response.data.user_data.role);
        localStorage.setItem('loggedEmail', response.data.user_data.email);

        console.log(response.data.user_data.email)


        navigate('/home'); // Redirect to the home page after successful login
      }
    } catch (error) {
      setError(error.response?.data?.detail || 'Login failed. Please try again.');
      emailRef.current.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="project-name">Resort Rapid Transit</div>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            ref={emailRef}
            id="email"
            type="email" // Changed to type="email" for proper validation
            name="email" // Updated to match the state
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            className="form-control"
          />
        </div>
        <button type="submit" className="btn login-btn" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <button type="button" className="btn link-btn" onClick={() => navigate('/register')}>Don't have an account? Register</button>
      </form>
    </div>
  );
};

export default LoginForm;
