import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
    fetchMovieRequest,
    
    fetchMoviefailure,
    fetchUpcomingSuccess
} from "../redux/movieSlice";
import { Link } from "react-router-dom";

const Upcoming = () => {
  const dispatch = useDispatch();
  const { upcomingMovies, loading, error } = useSelector((state) => state.movie);

  useEffect(() => {
    const fetchMovies = async () => {
      dispatch(fetchMovieRequest());
      try {
        const response = await axios.get("https://movie-api-b9qw.onrender.com/upcomingMovies");
        dispatch(fetchUpcomingSuccess(response.data)); 
      } catch (err) {
        dispatch(fetchMoviefailure(err.message));
      }
    };

    fetchMovies();
  }, [dispatch]);

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>Error: {error}</h2>;

  return (
    <div className="container">
      <h1 className="my-4">Upcoming Movies</h1>
      <div className="row">
        {Array.isArray(upcomingMovies) && upcomingMovies.map((movie) => (
          <div key={movie.id} className="col-md-4">
            <div className="card mb-3">
              <img src={movie.imageUrl} className="movie-poster" alt={movie.name} />
              <div className="card-body">
                <h5 className="card-title">{movie.name}</h5>
                <Link to={`/upcoming/${movie.id}`} className="btn btn-primary">View Details</Link>


              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Upcoming;
