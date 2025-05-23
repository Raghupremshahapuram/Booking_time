import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import './Login.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = location.state?.from || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (username && password) {
      try {
        const res = await axios.get(`http://localhost:6700/users`, {
          params: { username, password }
        });
  
        if (res.data.length > 0) {
          // Valid user
          localStorage.setItem('loggedIn', 'true');
          localStorage.setItem('username', username);
          toast.success('Login successful');
          navigate(fromPath);
        } else {
          // Invalid credentials
          toast.error('Invalid username or password');
        }
      } catch (err) {
        console.error('Login error:', err);
        toast.error('Login failed. Please try again.');
      }
    } else {
      toast.warn('Please enter both username and password');
    }
  };
  
  

  const handleSocialLogin = (provider) => {
    toast.success(`Logged in with ${provider}`);
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('username', provider);
    navigate(fromPath);
  };

  return (
    <div className="login-background">
      <div className="login-container">
        <h2>Login to Continue</h2>
        <form onSubmit={handleLogin} className="form-group">
          <label>Username:</label>
          <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} />

          <label>Password:</label>
          <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <button type="submit" className="btn btn-primary mt-3">Login</button>
        </form>
        <p className="mt-3">
  New user? <Link to="/register">Register here</Link>
</p>


        <div className="social-login">
          <p style={{ margin: '20px 0 10px' }}>Or login with:</p>
          <button
            className="btn btn-outline-danger me-2 d-flex align-items-center gap-2"
            onClick={() => handleSocialLogin('Google')}
          >
            <FaGoogle /> Continue with Google
          </button>
          <button
            className="btn btn-outline-primary mt-2 d-flex align-items-center gap-2"
            onClick={() => handleSocialLogin('Facebook')}
          >
            <FaFacebook /> Continue with Facebook
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
