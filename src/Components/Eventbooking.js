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
  const [bookingInProgress, setBookingInProgress] = useState(false);

  const seats = Array.from({ length: 30 }, (_, i) => `Seat ${i + 1}`);

  // Get logged in user
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

  // Fetch event data
  useEffect(() => {
    axios.get(`https://movie-api-b9qw.onrender.com/events`)
      .then(res => {
        const event = res.data.find(e => String(e.id) === String(id)); // ✅ Fix ID match
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

  // Handle seat select/unselect
  const handleSeatChange = (seat) => {
    setSelectedSeats(prev =>
      prev.includes(seat)
        ? prev.filter(s => s !== seat)
        : [...prev, seat]
    );
  };

  // Handle booking submission
  const handleBooking = () => {
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
      event_name: eventDetails.title,       // ✅ Consistent naming
      event_id: eventDetails.id,            // ✅ Save event ID
      date: eventDetails.date,
      time: eventDetails.time,
      venue: eventDetails.venue,
      seats: selectedSeats
    };

    setBookingInProgress(true);
    axios.post('https://postgres-movie.onrender.com/bookings', bookingDetails)
      .then(() => {
        navigate('/ticket', { state: bookingDetails });
      })
      .catch(err => {
        console.error("Error saving booking:", err);
        alert("Failed to book event. Please try again.");
      })
      .finally(() => setBookingInProgress(false));
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

      <button
        className="btn btn-success mt-3"
        onClick={handleBooking}
        disabled={bookingInProgress}
      >
        {bookingInProgress ? "Booking..." : "Confirm Booking"}
      </button>
    </div>
  );
};

export default EventBookingPage;
