import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {  useNavigate } from "react-router-dom";
import "./Home.css";

import {
  fetchMovieRequest,
  fetchMovieSucess,
  fetchMoviefailure,
} from "../redux/movieSlice";


const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { latestMovies, loading, error } = useSelector(
    (state) => state.movie
  );
  const [filteredLanguage, setFilteredLanguage] = useState("All");

  useEffect(() => {
    const fetchMovies = async () => {
      dispatch(fetchMovieRequest());
      try {
        const response = await axios.get(
          "https://movie-api-b9qw.onrender.com/latest"
        );
        dispatch(fetchMovieSucess(response.data));
      } catch (err) {
        dispatch(fetchMoviefailure(err.message));
      }
    };

    fetchMovies();
  }, [dispatch]);

  const handleMovieClick = (id) => {
    navigate(`/movie/${id}`);
  };
  const uniqueLanguages = [
    "All",
    ...new Set(latestMovies.map((m) => m.language)),
  ];

  const filteredMovies =
    filteredLanguage === "All"
      ? latestMovies
      : latestMovies.filter((movie) => movie.language === filteredLanguage);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h2 className="h4">Loading Movies...</h2>
          <p className="text-muted">Fetching the latest blockbusters for you</p>
        </div>
      </div>
    );

  if (error)
    return (
      <h2 className="text-danger text-center mt-5">Error: {error}</h2>
    );

  return (
    <div className="min-vh-100 position-relative">
      {/* Animated Background */}
      <div className="animated-lines">
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="vertical-line"></div>
        <div className="vertical-line"></div>
        <div className="vertical-line"></div>
        <div className="vertical-line"></div>
      </div>


      <div
        className="container-fluid py-5 position-relative"
        style={{ zIndex: 10 }}
      >
        {/* Header Section */}
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-4">Latest Movies</h1>
        </div>

        {/* Filter Section */}
        <div className="row justify-content-center mb-5">
          <div className="col-auto">
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {uniqueLanguages.map((lang) => (
                <button
                  key={lang}
                  className={`btn btn-lg rounded-pill fw-medium ${
                    filteredLanguage === lang
                      ? "btn-primary shadow"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => setFilteredLanguage(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        <div className="row g-4 justify-content-center">
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div className="card h-100 movie-card">
  <div 
    className="position-relative movie-poster-container"
    onClick={() => handleMovieClick(movie.id)}
    style={{ cursor: 'pointer' }}
  >
    <img
      src={movie.imageUrl}
      alt={movie.name}
      className="movie-poster"
      onError={(e) => {
        e.currentTarget.src =
          'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400';
      }}
    />
    <div className="movie-overlay">
      <span>Click to view details</span>
    </div>
  </div>

  <div className="card-body text-center p-4">
    <h5 className="card-title fw-bold mb-3 text-truncate">{movie.name}</h5>
  
  </div>
</div>


            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredMovies.length === 0 && !loading && (
          <div className="text-center py-5">
            <div className="mb-4">
              <div
                className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center"
                style={{ width: "96px", height: "96px" }}
              >
                <span style={{ fontSize: "2.5rem" }}>🎬</span>
              </div>
            </div>
            <h3 className="h4 fw-semibold mb-3">No Movies Found</h3>
            <p className="text-muted mb-4">
              No movies available for the selected language. Try selecting a
              different filter.
            </p>
            <button
              onClick={() => setFilteredLanguage("All")}
              className="btn btn-primary px-4 py-2 rounded-pill"
            >
              Show All Movies
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
