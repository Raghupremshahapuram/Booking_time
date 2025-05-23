import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Booking.css';


const getTodayDate = () => new Date().toISOString().split('T')[0];

const EventBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [eventName, setEventName] = useState(location.state?.eventName || '');
  const [loading, setLoading] = useState(!eventName);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedSeats, setSelectedSeats] = useState([]);

  const seats = Array.from({ length: 30 }, (_, i) => `Seat ${i + 1}`);

  useEffect(() => {
    if (!eventName) {
      axios.get('http://localhost:6700/events')
        .then(res => {
          const event = res.data.find(e => e.id === id);
          if (event) setEventName(event.title);
        })
        .catch(err => console.error('Error fetching event:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, eventName]);

  const handleSeatChange = (seat) => {
    setSelectedSeats(prev =>
      prev.includes(seat)
        ? prev.filter(s => s !== seat)
        : [...prev, seat]
    );
  };

  const handleBooking = () => {
    if (!selectedDate || selectedSeats.length === 0) {
      alert('Please select all fields');
      return;
    }

    const bookingDetails = {
      eventId: id,
      eventName,
      date: selectedDate,
      seats: selectedSeats
    };

    navigate('/ticket', { state: bookingDetails });
  };

  if (loading) return <h3>Loading event info...</h3>;

  return (
    <div className="booking-container">
      <h2>🎟️ Book Tickets for: <span className="movie-title">{eventName}</span></h2>

      <div className="form-group">
        <label>Select Event Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="form-control"
          min={getTodayDate()}
        />
      </div>

      <div className="form-group">
        <label>Select Seats:</label>
        <div className="seat-grid">
          {seats.map(seat => (
            <label key={seat} className="seat">
              <input
                type="checkbox"
                value={seat}
                onChange={() => handleSeatChange(seat)}
                checked={selectedSeats.includes(seat)}
              />
              <span className="seat-label">{seat.split(' ')[1]}</span>
            </label>
          ))}
        </div>
      </div>

      <button className="btn btn-success mt-3" onClick={handleBooking}>
        Confirm Booking
      </button>
    </div>
  );
};

export default EventBookingPage;

