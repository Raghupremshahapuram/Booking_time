import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Moviedetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:6700/events`)
      .then(res => {
        const found = res.data.find(e => e.id === id);
        setEvent(found);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching event:", err);
        setLoading(false);
      });
  }, [id]);
  const handleBookNow = () => {
    const isLoggedIn = localStorage.getItem('loggedIn');
    if (!isLoggedIn) {
      // Save event name temporarily
      sessionStorage.setItem('eventName', event.title);
      navigate('/login', { state: { from: `/event-book/${event.id}` } });
    } else {
      navigate(`/event-book/${event.id}`, { state: { eventName: event.title } });
    }
  };

  if (loading) return <h3>Loading Event Details...</h3>;
  if (!event) return <h3>Event not found</h3>;

  return (
    <div className="container mt-4">
      <div className="card">
        <img src={event.imageUrl} className="card-img-top" alt={event.title} />
        <div className="card-body">
          <h2 className="card-title">{event.title}</h2>
          <p><strong>Date:</strong> {event.date}</p>
          <p><strong>Time:</strong> {event.time}</p>
          <p><strong>Venue:</strong> {event.venue}</p>
          <p>{event.description}</p>
        </div>
      </div>
     
      <div className="d-flex justify-content gap-3 mt-4">
  <button className="btn btn-primary" onClick={handleBookNow}>Book Now</button>
  <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
</div>

    </div>
  );
};

export default EventDetails;
