import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  fetchMovieRequest,
  fetchUpcomingSuccess,
  fetchMoviefailure,
} from "../redux/movieSlice";
import { Link } from "react-router-dom";
import "./Upcoming.css"; // Styling file

const Upcoming = () => {
  const dispatch = useDispatch();
  const { upcomingMovies, loading, error } = useSelector((state) => state.movie);

  useEffect(() => {
    const fetchMovies = async () => {
      dispatch(fetchMovieRequest());
      try {
        const response = await axios.get("https://chatbotapi-a.onrender.com/upcoming-movies");
        dispatch(fetchUpcomingSuccess(response.data));
      } catch (err) {
        dispatch(fetchMoviefailure(err.message));
      }
    };
    fetchMovies();
  }, [dispatch]);

  if (loading) return <h2 className="text-center mt-5">Loading...</h2>;
  if (error) return <h2 className="text-danger text-center mt-5">Error: {error}</h2>;

  return (
    <div className="container my-5">
      <h2 className="mb-4 fw-semibold">Upcoming Movies</h2>
      <div className="row g-4">
        {upcomingMovies.map((movie) => (
          <div key={movie.id} className="col-6 col-md-4 col-lg-3">
            <div className="movie-card rounded shadow-sm">
              <Link to={`/upcoming/${movie.id}`} className="text-decoration-none text-dark">
                <div className="poster-wrapper position-relative">
                  <img
                    src={movie.imageUrl}
                    alt={movie.name}
                    className="img-fluid rounded-top movie-poster"
                  />
                  <div className="overlay-text">Click to view details</div>
                </div>
                <div className="p-2 text-center">
                  <strong>{movie.name}</strong>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Upcoming;
