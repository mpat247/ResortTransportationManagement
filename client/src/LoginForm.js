import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css'; // Import the CSS file for styling
import qs from 'qs';

const LoginForm = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const usernameRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);
    // Check if username or password is empty
    if (credentials.username === '' || credentials.password === '') {
      setError('Please enter username and password.');
      usernameRef.current.focus();
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.post('http://localhost:8000/users/login', 
        qs.stringify({
          username: credentials.username, 
          password: credentials.password
        }), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      localStorage.setItem('token', response.data.access_token);
      navigate('/home');
    } catch (error) {
      setError(error.response?.data?.detail || 'Login failed. Please try again.');
      usernameRef.current.focus();
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
          <label htmlFor="username">Username</label>
          <input
            ref={usernameRef}
            id="username"
            type="text"
            name="username"
            value={credentials.username}
            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
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
        <button type="button" className="btn link-btn" onClick={() => navigate('/register')}>Register</button>
      </form>
    </div>
  );
};

export default LoginForm;
