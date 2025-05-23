import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Booking.css';

const showTimes = ["10:00 AM", "1:00 PM", "4:00 PM", "7:00 PM", "10:00 PM"];
const seats = Array.from({ length: 30 }, (_, i) => `Seat ${i + 1}`);

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const storedName = sessionStorage.getItem('movieName');
  const [movieName, setMovieName] = useState(location.state?.movieName || storedName || '');
  const [loading, setLoading] = useState(!movieName);
  const [error, setError] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('loggedIn');
    if (!isLoggedIn) {
      sessionStorage.setItem('movieName', movieName); // Save movie name before redirect
      navigate('/login', { state: { from: `/book/${id}` } });
      return;
    }

    if (!movieName) {
      axios.get(`http://localhost:6700/latest?id=${id}`)
        .then(res => {
          const fetchedName = res.data[0]?.name;
          if (fetchedName) {
            setMovieName(fetchedName);
            sessionStorage.setItem('movieName', fetchedName);
          } else {
            setError('Movie not found');
          }
        })
        .catch(err => {
          console.error('Error fetching movie by id:', err);
          setError('Failed to load movie details');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, navigate, movieName]);

  const handleSeatChange = (seat) => {
    setSelectedSeats(prev =>
      prev.includes(seat)
        ? prev.filter(s => s !== seat)
        : [...prev, seat]
    );
  };

  const handleBooking = () => {
    if (!selectedTime || !selectedDate || selectedSeats.length === 0) {
      alert('Please select all fields');
      return;
    }

    const bookingDetails = {
      movieId: id,
      movieName,
      date: selectedDate,
      time: selectedTime,
      seats: selectedSeats,
    };

    navigate('/ticket', { state: bookingDetails });
  };

  if (loading) return <h3>Loading movie info...</h3>;
  if (error) return <h3 style={{ color: 'red' }}>{error}</h3>;

  return (
    <div className="booking-container">
      <h2>🎬 Book Tickets for: <span className="movie-title">{movieName}</span></h2>

      <div className="form-group">
        <label htmlFor="date">Select Show Date:</label>
        <input
          id="date"
          type="date"
          value={selectedDate}
          min={getTodayDate()}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="form-control"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="time">Select Show Time:</label>
        <select
          id="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="form-control"
          required
        >
          <option value="">-- Select Time --</option>
          {showTimes.map((time) => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
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

export default BookingPage;

