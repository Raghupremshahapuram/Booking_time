import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ChatBot from "./ChatBot";
import {
  fetchMovieRequest,
  fetchMovieSucess,
  fetchMoviefailure,
} from "../redux/movieSlice";
import "./Home.css";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { latestMovies, loading, error } = useSelector((state) => state.movie);
  const [filteredLanguage, setFilteredLanguage] = useState("All");

  useEffect(() => {
    const fetchMovies = async () => {
      dispatch(fetchMovieRequest());
      try {
        const response = await axios.get("https://postgres-movie.onrender.com/latest-movies");
        dispatch(fetchMovieSucess(response.data));
      } catch (err) {
        dispatch(fetchMoviefailure(err.message));
      }
    };

    fetchMovies();
  }, [dispatch]);

  const handleChatBooking = (userPrompt) => {
    const matchedMovie = latestMovies.find(
      (movie) =>
        movie.name &&
        movie.name.toLowerCase().includes(userPrompt.movie_name?.toLowerCase())
    );

    if (!matchedMovie) {
      alert("Sorry, I couldn't find a movie in your request.");
      return;
    }

    const selectedDate = userPrompt.date;
    const selectedTime = userPrompt.time;

    if (!selectedDate || !selectedTime) {
      alert("Please mention date and time clearly in your prompt.");
      return;
    }

    // Save chatbot data to session storage
    sessionStorage.setItem(
      "chatbotBooking",
      JSON.stringify({
        movie_name: matchedMovie.name,
        date: selectedDate,
        time: selectedTime,
        image: matchedMovie.imageUrl,
      })
    );

    // Navigate to booking page to select seats
    navigate(`/book/${matchedMovie.id}`, {
      state: {
        movieName: matchedMovie.name,
        image: matchedMovie.imageUrl,
        selectedDate,
        selectedTime,
        fromChatbot: true,
      },
    });
  };

  const uniqueLanguages = ["All", ...new Set(latestMovies.map((m) => m.language))];
  const filteredMovies =
    filteredLanguage === "All"
      ? latestMovies
      : latestMovies.filter((movie) => movie.language === filteredLanguage);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <h2 className="h4">Loading Movies...</h2>
          <p className="text-muted">Fetching the latest blockbusters for you</p>
        </div>
      </div>
    );

  if (error)
    return <h2 className="text-danger text-center mt-5">Error: {error}</h2>;

  return (
    <div className="min-vh-100 position-relative">
      {/* Line animations */}
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

      <div className="container-fluid py-5 position-relative" style={{ zIndex: 10 }}>
        <div className="row justify-content-center mb-5">
          <div className="col-auto">
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {uniqueLanguages.map((lang) => (
                <button
                  key={lang}
                  className={`btn btn-lg rounded-pill fw-medium ${
                    filteredLanguage === lang ? "btn-primary shadow" : "btn-outline-primary"
                  }`}
                  onClick={() => setFilteredLanguage(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="row g-4 justify-content-center">
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div className="card h-100 movie-card">
                <div
                  className="position-relative movie-poster-container"
                  onClick={() =>
                    navigate(`/movie/${movie.id}`, {
                      state: { movieName: movie.name, image: movie.imageUrl },
                    })
                  }
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={movie.imageUrl}
                    alt={movie.name}
                    className="movie-poster"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400";
                    }}
                  />
                  <div className="movie-overlay">
                    <span>Click to view details</span>
                  </div>
                </div>
                <div className="card-body text-center p-4">
                  <h5 className="card-title fw-bold mb-3 text-truncate">
                    {movie.name}
                  </h5>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* If no movies found */}
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
              No movies available for the selected language. Try selecting a different filter.
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

      {/* ChatBot */}
      <ChatBot onBookingDetails={handleChatBooking} latestMovies={latestMovies} />
    </div>
  );
};

export default Home;
