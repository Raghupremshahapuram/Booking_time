import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './AppHeader.css';

const AppHeader = () => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const isLoggedIn = localStorage.getItem('loggedIn');
  const userStr = localStorage.getItem('loggedInUser');
  const user = userStr ? JSON.parse(userStr) : null;
  const username = user?.name || 'User';

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  return (
    <nav className={`navbar navbar-expand-lg px-4 py-3 shadow-sm ${darkMode ? 'bg-dark navbar-dark' : 'bg-light navbar-light'}`}>
      <div className="container-fluid d-flex justify-content-between align-items-center">

        {/* Left Section: Brand and Navigation */}
        <div className="d-flex align-items-center gap-4">
          <Link to="/" className={`navbar-brand fw-bold fs-4 ${darkMode ? 'text-light' : 'text-dark'}`}>
            🎬 E-Cube
          </Link>

          <div className="d-flex gap-3">
            <NavLink to="/" className={({ isActive }) => `nav-link fw-semibold ${isActive ? 'text-primary' : darkMode ? 'text-light' : 'text-dark'}`}>
              Latest
            </NavLink>
            <NavLink to="/upcoming" className={({ isActive }) => `nav-link fw-semibold ${isActive ? 'text-primary' : darkMode ? 'text-light' : 'text-dark'}`}>
              Upcoming
            </NavLink>
            <NavLink to="/event" className={({ isActive }) => `nav-link fw-semibold ${isActive ? 'text-primary' : darkMode ? 'text-light' : 'text-dark'}`}>
              Events
            </NavLink>
          </div>
        </div>

        {/* Right Section: Toggle + Profile/Login */}
        <div className="d-flex align-items-center gap-3">

          {/* 🌗 Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
            title="Toggle Theme"
          >
            {darkMode ? '🌙' : '☀️'}
          </button>

          {/* 👤 Profile/Login */}
          {isLoggedIn ? (
            <div className="d-flex align-items-center">
              <Link
                to={`/profile?name=${username}`}
                className={`text-decoration-none me-3 fw-semibold ${darkMode ? 'text-info' : 'text-primary'}`}
              >
                <i className="bi bi-person-circle me-1"></i>
                {username}
              </Link>
              <button onClick={handleLogout} className="btn btn-sm brand-btn">
                <i className="bi bi-box-arrow-right me-1"></i>
                Logout
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center">
              <i className="bi bi-person-circle me-2 fs-5"></i>
              <Link to="/login" className="btn btn-sm brand-btn">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AppHeader;
