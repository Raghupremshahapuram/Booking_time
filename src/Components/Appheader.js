import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AppHeader.css';

const AppHeader = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('loggedIn');
  const username = localStorage.getItem('username') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (

<nav className="navbar navbar-dark bg-dark px-3">
  <div className="container-fluid d-flex justify-content-between align-items-center">
    
    {/* Left: Brand + Links */}
    <div className="d-flex align-items-center">
      <Link className="navbar-brand text-white me-4 fw-bold" to="/">🎬 E-Cube</Link>
      <ul className="navbar-nav flex-row">
        <li className="nav-item me-3">
          <Link className="nav-link text-white" to="/">Latest Movies</Link>
        </li>
        <li className="nav-item me-3">
          <Link className="nav-link text-white" to="/Upcoming">Upcoming Movies</Link>
        </li>
        <li className="nav-item me-3">
          <Link className="nav-link text-white" to="/Event">Events</Link>
        </li>
      </ul>
    </div>

    {/* Right: User Info / Login */}
    <div className="d-flex align-items-center">
      {isLoggedIn ? (
        <>
          <span className="username me-3">👤 {username}</span>
          <button onClick={handleLogout} className="btn btn-outline-light btn-sm">Logout</button>
        </>
      ) : (
        <Link to="/login" className="btn btn-outline-primary btn-sm">Login</Link>
      )}
    </div>

  </div>
</nav>


  );
};

export default AppHeader;
