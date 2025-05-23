import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  fetchMovieRequest,
  fetcheventSuccess,
  fetchMoviefailure,
} from "../redux/movieSlice";
import './Event.css'; 
import { Link } from "react-router-dom";

const Event = () => {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.movie);

  useEffect(() => {
    const fetchEvents = async () => {
      dispatch(fetchMovieRequest());
      try {
        const response = await axios.get("http://localhost:6700/events");
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
    <div className="container">
      <h1 className="my-4">🎉 Upcoming Events</h1>
      <div className="row">
        {Array.isArray(events) &&
          events.map((event) => (
            <div key={event.id} className="col-md-4">
              <div className="card mb-4 shadow-sm">
                <img
                  src={event.imageUrl}
                  className="card-img-top"
                  alt={event.title}
                />
                <div className="card-body">
                  <h5 className="card-title">{event.title}</h5>
                  <p><strong>Date:</strong> {event.date}</p>
                  <p><strong>Time:</strong> {event.time}</p>
                  <p><strong>Venue:</strong> {event.venue}</p>
          
                  <Link to={`/event/${event.id}`} className="btn btn-info">View Details</Link>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Event;
