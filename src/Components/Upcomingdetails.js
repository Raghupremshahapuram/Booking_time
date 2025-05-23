import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const UpcomingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:6700/upcomingMovies")
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

  if (loading) return <h2>Loading...</h2>;
  if (!movie) return <h2>Movie not found</h2>;

  return (
    <div className="container mt-4">
      <h2>Upcoming Release</h2>
      <div className="card">
        <img src={movie.imageUrl} className="card-img-top" alt={movie.name} />
        <div className="card-body">
          <h5 className="card-title">{movie.name}</h5>
          <p><strong>Type:</strong> {movie.type}</p>
          <p><strong>Language:</strong> {movie.language}</p>
          <p><strong>Rating:</strong> {movie.rate}</p>
          <button onClick={() => navigate(-1)} className="btn btn-secondary">Back</button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingDetails;
