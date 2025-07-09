import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Booking.css';

const showTimes = [
  { label: "10:00 AM", hour: 10 },
  { label: "1:00 PM", hour: 13 },
  { label: "4:00 PM", hour: 16 },
  { label: "7:00 PM", hour: 19 },
  { label: "10:00 PM", hour: 22 }
];

const getTodayDate = () => new Date().toISOString().split('T')[0];
const getCurrentHour = () => new Date().getHours();
const isToday = (selectedDate) => new Date().toDateString() === new Date(selectedDate).toDateString();

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const cols = Array.from({ length: 10 }, (_, i) => i + 1);
const seatPrices = {
  A: 200, B: 180, C: 160, D: 140, E: 120,
  F: 100, G: 100, H: 100, I: 100, J: 100
};

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [movieName, setMovieName] = useState(location.state?.movieName || sessionStorage.getItem('movieName') || '');
  const [loading, setLoading] = useState(!movieName);
  const [error, setError] = useState('');
  const [selectedTime, setSelectedTime] = useState(location.state?.selectedTime || '');
  const [selectedDate, setSelectedDate] = useState(location.state?.selectedDate || getTodayDate());
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);

  const calculateTotal = useCallback(() => {
    const subtotal = selectedSeats.reduce((sum, seat) => {
      const row = seat[0];
      return sum + (seatPrices[row] || 0);
    }, 0);
    const tax = subtotal * 0.25;
    return { subtotal, tax, total: subtotal + tax };
  }, [selectedSeats]);

  const filteredTimes = showTimes.filter(show => {
    if (isToday(selectedDate)) {
      return show.hour > getCurrentHour();
    }
    return true;
  });

  useEffect(() => {
    if (!movieName) {
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
  }, [id, movieName]);

  useEffect(() => {
    if (movieName && selectedDate && selectedTime) {
      axios.get('https://postgres-movie.onrender.com/bookings', {
        params: { movie_name: movieName, date: selectedDate, time: selectedTime }
      })
        .then(res => {
          const booked = res.data.flatMap(b =>
            typeof b.seats === 'string' ? b.seats.split(',').map(s => s.trim()) : b.seats || []
          );
          setBookedSeats(booked);
        })
        .catch(err => console.error('Error fetching booked seats', err));
    }
  }, [movieName, selectedDate, selectedTime]);

  const handleBooking = useCallback(() => {
    if (!selectedTime || !selectedDate || selectedSeats.length === 0) {
      return alert("Please select date, time, and at least one seat.");
    }

    const userStr = localStorage.getItem('loggedInUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) return alert('No logged-in user found. Please log in again.');

    const { total } = calculateTotal();

    const bookingDetails = {
      userId: user.id,
      name: user.name,
      movie_name: movieName,
      date: selectedDate,
      time: selectedTime,
      seats: selectedSeats,
      price: total.toFixed(2),
      image: location.state?.image
    };

    navigate('/payment', { state: bookingDetails });
  }, [selectedTime, selectedDate, selectedSeats, movieName, location.state, navigate, calculateTotal]);

  const handleSeatChange = (seat) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats(prev =>
      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
    );
  };

  if (loading) return <h3>Loading movie info...</h3>;
  if (error) return <h3 style={{ color: 'red' }}>{error}</h3>;

  const { subtotal, tax, total } = calculateTotal();

  return (
    <div className="booking-container">
      <div className="card">
        <div className="card-body">
          <h3 className="fw-bold mb-3">Book Tickets for: {movieName}</h3>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="fw-semibold">Select Show Date:</label>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                min={getTodayDate()}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedTime('');
                }}
              />
            </div>
            <div className="col-md-6">
              <label className="fw-semibold">Select Show Time:</label>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {filteredTimes.map((show) => (
                  <button
                    key={show.label}
                    className={`btn btn-outline-light ${selectedTime === show.label ? 'bg-white text-primary fw-bold' : ''}`}
                    onClick={() => setSelectedTime(show.label)}
                  >
                    {show.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="screen-label">SCREEN</div>
      <div className="seat-grid">
        {rows.map(row => (
          cols.map(col => {
            const seat = `${row}${col}`;
            return (
              <label key={seat} className={`seat ${bookedSeats.includes(seat) ? 'booked' : selectedSeats.includes(seat) ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  value={seat}
                  onChange={() => handleSeatChange(seat)}
                  checked={selectedSeats.includes(seat)}
                  disabled={bookedSeats.includes(seat)}
                />
                <span className="seat-label">{seat}</span>
              </label>
            );
          })
        ))}
      </div>

      <div className="legend">
        <div><span className="available"></span> Available</div>
        <div><span className="selected"></span> Selected</div>
        <div><span className="occupied"></span> Occupied</div>
      </div>

      <div className="booking-summary">
        <h5>Booking Summary</h5>
        <p className="text-muted">Price per seat based on row (A: ₹200 → J: ₹100)</p>
        <div className="d-flex justify-content-between">
          <span>Subtotal:</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>Tax (25%):</span>
          <span>₹{tax.toFixed(2)}</span>
        </div>
        <hr />
        <div className="d-flex justify-content-between total">
          <span>Total:</span>
          <span>₹{total.toFixed(2)}</span>
        </div>
        <button
          onClick={handleBooking}
          disabled={selectedSeats.length === 0 || !selectedTime || !selectedDate}
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default BookingPage;
