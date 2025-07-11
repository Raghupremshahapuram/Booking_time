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

const rows = ['A','B','C','D','E','F','G','H','I','J'];
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
    if (isToday(selectedDate)) return show.hour > getCurrentHour();
    return true;
  });

  useEffect(() => {
    if (!movieName) {
      axios.get(`http://localhost:5000/latest?id=${id}`)
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
          const booked = res.data.flatMap(b => typeof b.seats === 'string' ? b.seats.split(',').map(s => s.trim()) : b.seats || []);
          setBookedSeats(booked);
        })
        .catch(err => console.error('Error fetching booked seats', err));
    }
  }, [movieName, selectedDate, selectedTime]);

  const handleBooking = useCallback(() => {
    if (!selectedTime || !selectedDate || selectedSeats.length === 0) return alert("Please select date, time, and at least one seat.");
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
    setSelectedSeats(prev => prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]);
  };

  if (loading) return <h3>Loading movie info...</h3>;
  if (error) return <h3 style={{ color: 'red' }}>{error}</h3>;

  const { subtotal, tax, total } = calculateTotal();

  return (
    <div className="booking-container">
      <div className="booking-header card p-4 mb-4">
        <h2 className="text">🎬 Book Tickets for: <span className="fw-bold">{movieName}</span></h2>
        <div className="selectors d-flex flex-wrap gap-4 mt-3">
          <div>
            <label className="form-label">Select Show Date:</label>
            <input type="date" className="form-control" value={selectedDate} min={getTodayDate()} onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }} />
          </div>
          <div>
            <label className="form-label">Select Show Time:</label>
            <div className="btn-group d-flex flex-wrap gap-2 mt-1">
              {filteredTimes.map(show => (
                <button key={show.label} className={`btn btn-outline ${selectedTime === show.label ? 'active' : ''}`} onClick={() => setSelectedTime(show.label)}>{show.label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center fw-bold mb-3 bg-dark text-white py-2 rounded">SCREEN</div>

      <div className="seat-grid">
        {rows.map(row => (
          <div key={row} className="seat-row">
            {cols.map(col => {
              const seat = `${row}${col}`;
              return (
                <label key={seat} className={`seat ${bookedSeats.includes(seat) ? 'booked' : selectedSeats.includes(seat) ? 'selected' : ''}`}>
                  <input type="checkbox" value={seat} onChange={() => handleSeatChange(seat)} checked={selectedSeats.includes(seat)} disabled={bookedSeats.includes(seat)} />
                  <span className="seat-label">{seat}</span>
                </label>
              );
            })}
          </div>
        ))}
      </div>

      <div className="legend mt-3">
        <div><span className="available"></span> Available</div>
        <div><span className="selected"></span> Selected</div>
        <div><span className="occupied"></span> Occupied</div>
      </div>

      <div className="booking-summary card mt-4 p-4">
        <h4>Booking Summary</h4>
        <p className="text-muted">Price per seat based on row (A: ₹200 → J: ₹100)</p>
        <div className="d-flex justify-content-between"><span>Subtotal:</span><span>₹{subtotal}</span></div>
        <div className="d-flex justify-content-between"><span>Tax (25%):</span><span>₹{tax.toFixed(2)}</span></div>
        <hr />
        <div className="d-flex justify-content-between fw-bold fs-5 text-primary"><span>Total:</span><span>₹{total.toFixed(2)}</span></div>
        <button className="btn btn-primary mt-3 w-100" disabled={selectedSeats.length === 0 || !selectedTime || !selectedDate} onClick={handleBooking}>Proceed to Payment</button>
      </div>
    </div>
  );
};

export default BookingPage;
