import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Booking.css';

// Show timings with 24-hour values for filtering
const showTimes = [
  { label: "10:00 AM", hour: 10 },
  { label: "1:00 PM", hour: 13 },
  { label: "4:00 PM", hour: 16 },
  { label: "7:00 PM", hour: 19 },
  { label: "10:00 PM", hour: 22 }
];

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Check if the selected date is today
const isToday = (selectedDate) => {
  const today = new Date();
  const selected = new Date(selectedDate);
  return today.toDateString() === selected.toDateString();
};

// Get current hour in 24-hour format
const getCurrentHour = () => new Date().getHours();

const seats = Array.from({ length: 30 }, (_, i) => `Seat ${i + 1}`);

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [movieName, setMovieName] = useState(location.state?.movieName || sessionStorage.getItem('movieName') || '');
  const [loading, setLoading] = useState(!movieName);
  const [error, setError] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [checkingLogin, setCheckingLogin] = useState(true);

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
    if (!movieName) {
      const storedName = sessionStorage.getItem('movieName');
      if (storedName) {
        setMovieName(storedName);
      }
    }
  }, [movieName]);

  useEffect(() => {
    if (!movieName) {
      setLoading(true);
      axios.get(`https://movie-api-b9qw.onrender.com/latest?id=${id}`)
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
    setCheckingLogin(false);
  }, [id, movieName]);

  const handleSeatChange = (seat) => {
    setSelectedSeats(prev =>
      prev.includes(seat)
        ? prev.filter(s => s !== seat)
        : [...prev, seat]
    );
  };

  const handleBooking = () => {
    if (!selectedTime || !selectedDate || selectedSeats.length === 0) {
      alert('Please select date, time and seats before booking.');
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
      
      movie_name: movieName, 
      event_name: null,
      date: selectedDate,
      time: selectedTime,
      // seats: selectedSeats,
      seats: selectedSeats.join(', ')
    };
   

    axios.post('https://postgres-movie.onrender.com/bookings', bookingDetails)
    
      .then(() => {
        navigate('/ticket', { state: bookingDetails });
      })
      .catch(err => {
        console.error("Error saving booking:", err);
        alert("Failed to book ticket. Please try again.");
      });
      
  };

  // Filter show times based on current time if today is selected
  const filteredTimes = showTimes.filter(show => {
    if (isToday(selectedDate)) {
      return show.hour > getCurrentHour();
    }
    return true;
  });

  if (checkingLogin) return <h3>Checking login status...</h3>;
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
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedTime('');
          }}
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
          {filteredTimes.length === 0 && <option disabled>No available shows</option>}
          {filteredTimes.map(time => (
            <option key={time.label} value={time.label}>{time.label}</option>
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
