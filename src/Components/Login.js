import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import './Login.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [name, setName] = useState('');

  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = location.state?.from || '/';

  
  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (name && password) {
      try {
        const res = await axios.get(`https://postgres-movie.onrender.com/users`);
        const users = res.data;
  
        // Exact match filter
        const matchedUser = users.find(
          (u) => u.name === name && u.password === password
        );
  
        if (matchedUser) {
          localStorage.setItem('loggedIn', 'true');
          localStorage.setItem('loggedInUser', JSON.stringify(matchedUser));
          toast.success('Login successful');
          navigate(fromPath);
        } else {
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
         
          <label>UserName:</label>
            < input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />


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
