import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';
import './Event.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    axios.get(`https://chatbotapi-a.onrender.com/events`)
      .then(res => {
        const found = res.data.find(e => String(e.id) === String(id));
        setEvent(found);
      })
      .catch(err => {
        console.error("Error fetching event:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleBookNow = () => {
    const isLoggedIn = localStorage.getItem('loggedIn');
    if (!isLoggedIn) {
      sessionStorage.setItem('eventName', event.name);
      navigate('/login', { state: { from: `/event-book/${event.id}` } });
    } else {
      navigate(`/event-book/${event.id}`, {
        state: { eventName: event.name }
      });
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!event) return <h3 className="text-center mt-5">Event not found</h3>;

  return (
    <div className={`container my-5 ${darkMode ? 'bg-dark text-white' : 'bg-white text-dark'} rounded-4 shadow-lg p-4`}>
      <div className="row g-4 align-items-start">
        {/* Image Section */}
        <div className="col-12 col-md-6">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="img-fluid rounded-4 shadow-sm w-100 movie-image"
            onError={(e) => {
              e.currentTarget.src = 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400';
            }}
          />
        </div>

        {/* Content Section */}
        <div className="col-12 col-md-6">
          <h2 className="fw-bold mb-3">{event.name}</h2>
          <p className="text-muted fs-5 mb-4">{event.description}</p>

          <div className="d-flex flex-column gap-3 fs-6">
          <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>

            <div><strong>Time:</strong> {event.time}</div>
            <div><strong>Venue:</strong> {event.venue}</div>
          </div>

          <div className="mt-5 d-flex gap-3 flex-wrap">
            <button className="btn btn-outline-primary px-4 py-2 rounded-3 shadow" onClick={handleBookNow}>
              🎫 Book Tickets
            </button>
            <button className="btn btn-link text-decoration-none" onClick={() => navigate(-1)}>
              ← Back to Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
