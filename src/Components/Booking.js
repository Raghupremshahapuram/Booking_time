import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Booking.css';

const showTimes = [
  { label: "10:00 AM", hour: 10 },
  { label: "1:00 PM", hour: 13 },
  { label: "4:00 PM", hour: 16 },
  { label: "7:00 PM", hour: 19 },
  { label: "10:00 PM", hour: 22 },
];

const seatPrices = {
  A: 200, B: 180, C: 160, D: 140, E: 120,
  F: 100, G: 100, H: 100, I: 100, J: 100
};

const rows = ['A','B','C','D','E','F','G','H','I','J'];
const cols = Array.from({ length: 10 }, (_, i) => i + 1);

const getToday = () => new Date().toISOString().split('T')[0];
const isToday = (dateStr) => new Date().toDateString() === new Date(dateStr).toDateString();
const getCurrentHour = () => new Date().getHours();

const BookingPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [movieName, setMovieName] = useState(location.state?.movieName || sessionStorage.getItem('movieName') || '');
  const [selectedDate, setSelectedDate] = useState(location.state?.selectedDate || getToday());
  const [selectedTime, setSelectedTime] = useState(location.state?.selectedTime || '');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(!movieName);
  const [error, setError] = useState('');
  const [image] = useState(location.state?.image || sessionStorage.getItem('movieImage') || '');



  useEffect(() => {
    if (!movieName) {
      axios.get(`https://chatbotapi-a.onrender.com/bookings?id=${id}`)
        .then(res => {
          const name = res.data?.[0]?.name;
          if (name) {
            setMovieName(name);
            sessionStorage.setItem('movieName', name);
          } else {
            setError('Movie not found');
          }
        })
        .catch(() => setError('Failed to fetch movie'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id, movieName]);
  useEffect(() => {
    if (!selectedTime && location.state?.selectedTime) {
      // Safely set selectedTime only once
      setSelectedTime(location.state.selectedTime);
    }
  }, [location.state, selectedTime]);
  

  useEffect(() => {
    if (movieName && selectedDate && selectedTime) {
      axios.get('https://chatbotapi-a.onrender.com/bookings', {
        params: { movie_name: movieName, date: selectedDate, time: selectedTime }
      })
      .then(res => {
        const booked = res.data.flatMap(b => {
          try {
            // Convert string like '{"A1","A2"}' to ["A1", "A2"]
            const seatArray = JSON.parse(b.seats.replace(/{/g, '[').replace(/}/g, ']'));
            return seatArray.map(s => s.trim());
          } catch (e) {
            console.error("Seat parse error:", b.seats);
            return [];
          }
        });
        console.log("🟦 Final parsed booked seats:", booked);
        setBookedSeats(booked);
      })
      .catch(() => console.error('❌ Failed to fetch booked seats'));
    }
  }, [movieName, selectedDate, selectedTime]);
    
  
  const filteredTimes = showTimes.filter(({ hour }) =>
    !isToday(selectedDate) || hour > getCurrentHour()
  );

  const handleSeatToggle = (seat) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats(prev =>
      prev.includes(seat)
        ? prev.filter(s => s !== seat)
        : [...prev, seat]
    );
  };

  const calculateTotal = useCallback(() => {
    const subtotal = selectedSeats.reduce((sum, seat) => sum + (seatPrices[seat[0]] || 0), 0);
    const tax = subtotal * 0.25;
    return { subtotal, tax, total: subtotal + tax };
  }, [selectedSeats]);

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || selectedSeats.length === 0) {
      alert("Please select date, time, and at least one seat.");
      return;
    }

    const userStr = localStorage.getItem('loggedInUser');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
      alert('No user found. Please log in again.');
      return;
    }

    const { total } = calculateTotal();

    const bookingDetails = {
      userId: user.id,
      name: user.name,
      movie_name: movieName,
      date: selectedDate,
      time: selectedTime,
      seats: selectedSeats,
      price: total.toFixed(2),
      image: image 
    };

    navigate('/payment', { state: bookingDetails });
  };

  if (loading) return <h3>Loading movie info...</h3>;
  if (error) return <h3 style={{ color: 'red' }}>{error}</h3>;

  const { subtotal, tax, total } = calculateTotal();

  return (
    <div className="booking-container">
      <div className="booking-header card p-4 mb-4">
        <h2>🎬 Book Tickets for: <span className="fw-bold">{movieName}</span></h2>

        <div className="selectors d-flex flex-wrap gap-4 mt-3">
          <div>
            <label className="form-label">Select Show Date:</label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              min={getToday()}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime('');
                setSelectedSeats([]);
              }}
            />
          </div>

          <div>
            <label className="form-label">Select Show Time:</label>
            <div className="btn-group d-flex flex-wrap gap-2 mt-1">
              {filteredTimes.map(({ label }) => (
                <button
                  key={label}
                  className={`btn btn-outline ${selectedTime === label ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTime(label);
                    setSelectedSeats([]);
                  }}
                >
                  {label}
                </button>
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
        const isBooked = bookedSeats.includes(seat);
        const isSelected = selectedSeats.includes(seat);

        return (
          <label
            key={seat}
            className={`seat ${isBooked ? 'booked' : isSelected ? 'selected' : ''}`}
          >
            <input
              type="checkbox"
              value={seat}
              checked={isSelected}
              disabled={isBooked}
              onChange={() => handleSeatToggle(seat)}
            />
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
        <button
          className="btn btn-primary mt-3 w-100"
          disabled={!selectedDate || !selectedTime || selectedSeats.length === 0}
          onClick={handleBooking}
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default BookingPage;
