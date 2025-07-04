import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import './Moviedetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    axios.get("https://movie-api-b9qw.onrender.com/latest")
      .then(res => {
        const found = res.data.find((m) => String(m.id) === String(id));
        setMovie(found);
      })
      .catch(err => {
        console.error('Error fetching movie details:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleBookNow = () => {
    const isLoggedIn = localStorage.getItem('loggedIn');
    if (!isLoggedIn) {
      // Save movie name temporarily
      sessionStorage.setItem('moviename', movie.title);
      navigate('/login', { state: { from: `/book/${movie.id}` } });
    } else {
      navigate(`/book/${movie.id}`, { state: { movieName: movie.name, image: movie.imageUrl } });
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!movie) return <h2 className="text-center">Movie not found</h2>;

  return (
    <div className={`container my-5 ${darkMode ? 'bg-dark text-white' : 'bg-white text-dark'} rounded-4 shadow-lg p-4`}>
      <div className="d-flex flex-column flex-md-row gap-4 align-items-start">
        <img 
          src={movie.imageUrl} 
          alt={movie.name} 
          className="img-fluid rounded-4 shadow-sm" 
          style={{ maxWidth: '500px', height: 'auto', objectFit: 'cover' }}
          onError={(e) => {
            e.currentTarget.src = 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400';
          }}
        />

        <div className="flex-grow-1">
          <h2  className={`fw-bold ${darkMode ? 'text-white' : 'text-dark'}`}>{movie.name}</h2>
          <p className="text-muted fs-5">Experience the cinematic journey in this blockbuster film that combines storytelling, visuals, and memorable moments.</p>

          <div className="d-flex flex-wrap gap-3 mt-4">
          <div className="d-flex align-items-center gap-2 bg-light rounded-pill px-3 py-2 shadow-sm">
            <span>{movie.rate || '8.5'}</span>
             <i className="bi bi-star-fill text-warning"></i>
                </div>
            <div className="d-flex align-items-center gap-2 bg-light rounded-pill px-3 py-2 shadow-sm">
              <i className="bi bi-calendar3"></i>
              <span>2024</span>
            </div>
            <div className="d-flex align-items-center gap-2 bg-light rounded-pill px-3 py-2 shadow-sm">
              <i className="bi bi-clock-history"></i>
              <span>2h 30m</span>
            </div>
          </div>

          <div className="mt-4 d-flex gap-2 flex-wrap">
            <span className="badge bg-primary-subtle text-primary fw-semibold">{movie.language}</span>
            <span className="badge bg-secondary">Drama</span>
            <span className="badge bg-info text-dark">Action</span>
          </div>

          <div className="mt-5 d-flex gap-3 flex-wrap">

          <button
  className="btn btn-outline-primary px-4 py-2 rounded-3 shadow"
  onClick={handleBookNow}
>
  🎟️ Book Tickets
</button>
         
            <button className="btn btn-link text-decoration-none" onClick={() => navigate(-1)}>
              ← Back to Movies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
