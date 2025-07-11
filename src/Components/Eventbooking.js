import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Booking.css';

const EventBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);

  const seats = Array.from({ length: 60 }, (_, i) => `Seat ${i + 1}`);

  const getLoggedInUser = () => {
    try {
      const userStr = localStorage.getItem('loggedInUser');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      return user?.name ? user : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    axios.get(`https://postgres-movie.onrender.com/events`)
      .then(res => {
        const event = res.data.find(e => String(e.id) === String(id));
        if (event) {
          setEventDetails(event);
        } else {
          alert("Event not found");
        }
      })
      .catch(err => {
        console.error('Error fetching event:', err);
        alert('Failed to load event data');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (eventDetails) {
      axios.get('https://postgres-movie.onrender.com/bookings', {
        params: {
          event_name: eventDetails.title,
          date: eventDetails.date,
          time: eventDetails.time
        }
      })
        .then(res => {
          const booked = res.data.flatMap(b => {
            if (typeof b.seats === 'string') {
              return b.seats.split(',').map(s => s.trim());
            } else if (Array.isArray(b.seats)) {
              return b.seats;
            }
            return [];
          });
          setBookedSeats(booked);
        })
        .catch(err => console.error('Error fetching booked seats', err));
    }
  }, [eventDetails]);

  const handleSeatChange = (seat) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats(prev =>
      prev.includes(seat)
        ? prev.filter(s => s !== seat)
        : [...prev, seat]
    );
  };

  const handleContinueToPayment = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }

    const user = getLoggedInUser();
    if (!user) {
      alert('No logged-in user found. Please log in again.');
      return;
    }

    const bookingDetails = {
      userId: user.id,
      name: user.name,
      event_name: eventDetails.title,
      event_id: eventDetails.id,
      date: eventDetails.date,
      time: eventDetails.time,
      venue: eventDetails.venue,
      seats: selectedSeats
    };

    navigate('/payment', { state: bookingDetails });
  };

  if (loading) return <h3>Loading event info...</h3>;
  if (!eventDetails) return <h3>Event not found</h3>;

  return (
    <div className="booking-container">
      <h2>🎟️ Book Tickets for: <span className="movie-title">{eventDetails.title}</span></h2>

      <div className="form-group">
        <label><strong>Date:</strong> {eventDetails.date}</label><br />
        <label><strong>Time:</strong> {eventDetails.time}</label><br />
        <label><strong>Venue:</strong> {eventDetails.venue}</label>
      </div>

      <div className="form-group">
        <label>Select Seats:</label>
        <div className="seat-grid">
          {seats.map(seat => (
            <label key={seat} className={`seat ${bookedSeats.includes(seat) ? 'booked' : ''}`}>
              <input
                type="checkbox"
                value={seat}
                onChange={() => handleSeatChange(seat)}
                checked={selectedSeats.includes(seat)}
                disabled={bookedSeats.includes(seat)}
              />
              <span className="seat-label">{seat.split(' ')[1]}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        className="btn btn-success mt-3"
        onClick={handleContinueToPayment}
      >
        Continue to Payment
      </button>
    </div>
  );
};

export default EventBookingPage;
