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
  const { events, loading, error } = useSelector((state) => state.movie);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      dispatch(fetchMovieRequest());
      try {
        const response = await axios.get("https://movie-api-b9qw.onrender.com/events");
        dispatch(fetcheventSuccess(response.data));
      } catch (err) {
        dispatch(fetchMoviefailure(err.message));
      }
    };

    fetchEvents();
  }, [dispatch]);

  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>Error: {error}</h2>;

  return (
       <div className="container mt-4">
    <h2 className="text-center mb-4">🎉 Upcoming Events</h2>
    <div className="row">
      {events.map((event) => (
        <div key={event.id} className="col-md-4 mb-4">
          <div className="card h-100">
            <img src={event.imageUrl} className="card-img-top" alt={event.title} />
            <div className="card-body">
              <h5 className="card-title">{event.title}</h5>
              <p><strong>Date:</strong> {event.date}</p>
              <p><strong>Time:</strong> {event.time}</p>
              <p><strong>Venue:</strong> {event.venue}</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/event/${event.id}`)}
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
  );
};

export default Event;
