import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Upcoming.css';

const UpcomingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("https://chatbotapi-a.onrender.com/upcoming-movies")
      .then(res => {
        // Find movie by comparing id, converting both to string for safety
        const found = res.data.find((movie) => String(movie.id) === id);
        setMovie(found);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching movie details:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <h2>Loading...</h2>;
  if (!movie) return <h2>Movie not found</h2>;

  return (
    <div className="upcoming.container mt-4">
      <h2>Upcoming Release</h2>
      <div className="upcoming.card">
        <img src={movie.imageUrl} className="upcoming.movie-poster" alt={movie.name} />
        <div className="upcoming.card-body">
          <h5 className="upcoming.card-title">{movie.name}</h5>
          <p><strong>Type:</strong> {movie.description}</p>
          <p><strong>Language:</strong> {movie.language}</p>

        
          <p>
            <strong>Trailer:</strong>
           
            <button
              onClick={() => window.open(movie.trailer_url, '_blank')}
              className="btn btn-primary btn-sm"
            >
              Watch Trailer
            </button>
          </p>
          

          <button onClick={() => navigate(-1)} className="btn btn-secondary mt-3">Back</button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingDetails;