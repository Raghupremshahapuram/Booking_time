import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import './AppHeader.css';

const AppHeader = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('loggedIn');
  const userStr = localStorage.getItem('loggedInUser');
  const user = userStr ? JSON.parse(userStr) : null;
  const username = user?.name || 'User';

  const { darkMode } = useContext(ThemeContext);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('loggedInUser');
    navigate('/login');
  };

  return (
    <nav className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-light'} border-bottom`}>
      <div className="container-fluid px-4">

        {/* Left: Brand + Navigation */}
        <div className="d-flex align-items-center">
          <Link className="navbar-brand fw-bold brand-color me-4" to="/">
            <span className="me-2">🎬</span>
            E-Cube
          </Link>

          <div className="d-none d-md-flex">
  <Link className={`nav-link me-3 ${darkMode ? 'text-light' : 'text-muted'}`} to="/">
    Latest Movies
  </Link>
  <Link className={`nav-link me-3 ${darkMode ? 'text-light' : 'text-muted'}`} to="/upcoming">
    Upcoming Movies
  </Link>
  <Link className={`nav-link me-3 ${darkMode ? 'text-light' : 'text-muted'}`} to="/event">
    Events
  </Link>
</div>

        </div>

        {/* Right: User Info / Login */}
        <div className="d-flex align-items-center">
          <span className={`fw-bold me-3 ${darkMode ? 'text-light' : 'text-dark'}`}>
            Movie Ticket
          </span>

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
              <i className="bi bi-person-circle me-2"></i>
              <span className={`me-3 ${darkMode ? 'text-light' : 'text-dark'}`}>{username}</span>
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
