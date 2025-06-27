import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
        const found = res.data.find((movie) => String(movie.id) === String(id));
        setMovie(found);
      })
      .catch(err => {
        console.error('Error fetching movie details:', err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!movie) return <h2>Movie not found</h2>;

  return (
    <div className={`movie-detail-vertical ${darkMode ? 'dark-mode' : ''}`}>
      <div className="movie-detail-card">
        <img src={movie.imageUrl} className="movie-full-image" alt={movie.name} />
        <div className="movie-info">
          <h2>{movie.name}</h2>
          <p><strong>Language:</strong> {movie.language}</p>
          <p><strong>Type:</strong> {movie.type}</p>
          <p><strong>Rating:</strong> ⭐ {movie.rate}</p>
        </div>
      </div>

      <div className="movie-button-group">
        <Link to={`/book/${movie._id}`} state={{ movieName: movie.name }}>
          <button className="btn btn-primary">Book Now</button>
        </Link>
        <button className="btn btn-outline-primary" onClick={() => navigate(-1)}>← Back</button>
      </div>
    </div>
  );
};

export default MovieDetails;
