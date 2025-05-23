import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Moviedetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:6700/latest")
      .then(res => {
        const found = res.data.find((movie) => movie.id === id);
        setMovie(found);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching movie details:', err);
        setLoading(false);
      });
  }, [id]);
 
  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  };
  if (!movie) return <h2>Movie not found</h2>;

  return (
    
    <div className="container mt-4">
      
      <div className="card">
        <img src={movie.imageUrl} className="card-img-top" alt={movie.name} />
        <div className="card-body">
          <h2 className="card-title">{movie.name}</h2>
          <p><strong>Language:</strong> {movie.language}</p>
          <p><strong>Type:</strong> {movie.type}</p>
          <p><strong>Rating:</strong> {movie.rate} ⭐</p>
        </div>
      </div>
    
<div className="d-flex justify-content gap-3 mt-3">
  <Link to={`/book/${movie._id}`} state={{ movieName: movie.name }}>
    <button className="btn btn-primary">Book Now</button>
  </Link>
  <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
</div>

    </div>
  );
};

export default MovieDetails;
