import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AppHeader.css';

const AppHeader = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('loggedIn');
  const userStr = localStorage.getItem('loggedInUser');
  const username = userStr ? JSON.parse(userStr).name : 'User';
  const user = userStr ? JSON.parse(userStr) : null;

  
  

const handleLogout = () => {
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('loggedInUser');
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
       
         <span> <Link to={`/profile?name=${user.name}`} className="me-3 text-decoration-none text-light">👤 {username}</Link></span>
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
