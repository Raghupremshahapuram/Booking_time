// RegisterPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './Booking.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      toast.warn('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const res = await axios.get('http://localhost:6700/users');
      const existingUser = res.data.find(
        (user) => user.username === username || user.email === email
      );

      if (existingUser) {
        toast.error('User already exists with this username or email');
        return;
      }

      await axios.post('http://localhost:6700/users', {
        username,
        email,
        password
      });

      toast.success('Registration successful! Please login');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <h2>Register</h2>
        <form onSubmit={handleSubmit} className="form-group">
          <label>Username:</label>
          <input
            className="form-control"
            name="username"
            value={formData.username}
            onChange={handleChange}
          />

          <label>Email:</label>
          <input
            className="form-control"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />

          <label>Password:</label>
          <input
            className="form-control"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />

          <label>Confirm Password:</label>
          <input
            className="form-control"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button type="submit" className="btn btn-primary mt-3">Register</button>
        </form>
        <p className="mt-3">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
