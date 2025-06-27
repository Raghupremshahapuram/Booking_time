import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AppHeader.css';
import { ThemeContext } from '../context/ThemeContext';

const AppHeader = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('loggedIn');
  const userStr = localStorage.getItem('loggedInUser');
  const username = userStr ? JSON.parse(userStr).name : 'User';
  const user = userStr ? JSON.parse(userStr) : null;

  const { darkMode } = useContext(ThemeContext);

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  // Choose dynamic class
  const navClass = darkMode
    ? 'navbar navbar-dark bg-dark px-3'
    : 'navbar navbar-light bg-light px-3';

  const linkClass = darkMode ? 'text-white' : 'text-dark';

  return (
    <nav className={navClass}>
      <div className="container-fluid d-flex justify-content-between align-items-center">
        
        {/* Left: Brand + Links */}
        <div className="d-flex align-items-center">
          <Link className={`navbar-brand fw-bold ${linkClass} me-4`} to="/">🎬 E-Cube</Link>
          <ul className="navbar-nav flex-row">
            <li className="nav-item me-3">
              <Link className={`nav-link ${linkClass}`} to="/">Latest Movies</Link>
            </li>
            <li className="nav-item me-3">
              <Link className={`nav-link ${linkClass}`} to="/Upcoming">Upcoming Movies</Link>
            </li>
            <li className="nav-item me-3">
              <Link className={`nav-link ${linkClass}`} to="/Event">Events</Link>
            </li>
          </ul>
        </div>

        {/* Right: User Info / Login */}
        <div className="d-flex align-items-center">
          {isLoggedIn ? (
            <>
              <span>
                <Link to={`/profile?name=${user.name}`} className={`me-3 text-decoration-none ${linkClass}`}>
                  👤 {username}
                </Link>
              </span>
              <button onClick={handleLogout} className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-primary'}`}>
              Login
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
};

export default AppHeader;
