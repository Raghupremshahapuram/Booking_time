import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import {
  fetchMovieRequest,
  fetcheventSuccess,
  fetchMoviefailure,
} from "../redux/movieSlice";
import './Event.css';

const Event = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { events, loading, error } = useSelector((state) => state.movie);

  useEffect(() => {
    const fetchEvents = async () => {
      dispatch(fetchMovieRequest());
      try {
        const response = await axios.get("https://postgres-movie.onrender.com/events");
        dispatch(fetcheventSuccess(response.data));
      } catch (err) {
        dispatch(fetchMoviefailure(err.message));
      }
    };

    fetchEvents();
  }, [dispatch]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" />
          <h2 className="h4">Loading Events...</h2>
          <p className="text-muted">Fetching exciting events for you</p>
        </div>
      </div>
    );

  if (error)
    return <h2 className="text-danger text-center mt-5">Error: {error}</h2>;

  return (
    <div className="min-vh-100 position-relative">
      {/* Optional background animation lines */}
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

      <div className="container py-5 position-relative" style={{ zIndex: 10 }}>
        <h2 className="text-center fw-bold mb-5">🎉 Events</h2>
        <div className="row g-4 justify-content-center">
          {events.map((event) => (
            <div key={event.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <div className="card h-100 movie-card">
                <div
                  className="position-relative movie-poster-container"
                  onClick={() => navigate(`/event/${event.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={event.imageUrl}
                    alt={event.name}
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
                  <h5 className="card-title fw-bold mb-2 text-truncate">{event.name}</h5>
                  <p className="mb-1"><strong>Date:</strong> {event.date}</p>
                  <p className="mb-1"><strong>Time:</strong> {event.time}</p>
                  <p className="mb-3"><strong>Venue:</strong> {event.venue}</p>
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Event;
