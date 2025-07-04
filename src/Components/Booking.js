import React, { useState, useEffect } from 'react';
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

const pricePerSeat = 120;
const getTodayDate = () => new Date().toISOString().split('T')[0];
const getCurrentHour = () => new Date().getHours();
const isToday = (selectedDate) => new Date().toDateString() === new Date(selectedDate).toDateString();
const seats = Array.from({ length: 60 }, (_, i) => `Seat ${i + 1}`);

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
  const [bookedSeats, setBookedSeats] = useState([]);

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

  const handleSeatChange = (seat) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats(prev =>
      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
    );
  };

  const handleBooking = () => {
    if (!selectedTime || !selectedDate || selectedSeats.length === 0) {
      alert('Please select date, time and seats before booking.');
      return;
    }
  
    const userStr = localStorage.getItem('loggedInUser');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) {
      alert('No logged-in user found. Please log in again.');
      return;
    }
  
    const baseTotal = selectedSeats.length * pricePerSeat;
    const tax = selectedSeats.length > 0 ? pricePerSeat * 0.25 : 0;
    const totalPrice = baseTotal + tax;
  
    const bookingDetails = {
      userId: user.id,
      name: user.name,
      movie_name: movieName,
      date: selectedDate,
      time: selectedTime,
      seats: selectedSeats,
      price: totalPrice.toFixed(2), 
      image: location.state?.image 
    };
  
    navigate('/payment', { state: bookingDetails });
  };

  if (loading) return <h3>Loading movie info...</h3>;
  if (error) return <h3 style={{ color: 'red' }}>{error}</h3>;

  return (
    
    <div className="booking-container">
      <div className="card border-0 rounded-4 shadow mb-4" style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', color: '#fff' }}>
  <div className="card-body p-4">
    <div className="d-flex align-items-start gap-3">
      <div className="bg-white bg-opacity-25 p-3 rounded">
        <i className="bi bi-film fs-2"></i>
      </div>
      <div>
        
        <h3 className="fw-bold">Book Tickets for: {movieName || 'Loading...'}</h3>

        <p className="mb-0">Select your preferred showtime and seats</p>
      </div>
    </div>

    <div className="row mt-4">
      <div className="col-md-6 mb-3">
        <label className="fw-semibold">Select Show Date:</label>
        <input
          type="date"
          className="form-control bg-transparent text-white border border-white"
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
              <i className="bi bi-clock me-1"></i>
              {show.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
</div>
     

      <div className="form-group">
        <div className="text-center fw-bold py-2">SCREEN</div>
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

      <div className="mt-4 d-flex justify-content-center gap-4 align-items-center">
        <div className="d-flex align-items-center gap-2">
          <span className="rounded" style={{ width: '18px', height: '18px', backgroundColor: '#f0f0f0', display: 'inline-block' }}></span>
          <span className="text-muted">Available</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="rounded" style={{ width: '18px', height: '18px', background: 'linear-gradient(to right, #6366F1, #8B5CF6)', display: 'inline-block' }}></span>
          <span className="text-muted">Selected</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span className="rounded" style={{ width: '18px', height: '18px', backgroundColor: '#fecaca', display: 'inline-block' }}></span>
          <span className="text-muted">Occupied</span>
        </div>
      </div>

      <div className="card border-0 shadow rounded-4 mt-4">
  <div className="card-body p-4">
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h5 className="fw-bold mb-0">Booking Summary</h5>
      <span className="text-muted">
        <i className="bi bi-people me-1"></i>
        {selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'}
      </span>
    </div>
    <p className="text-muted">Price per seat:</p>
    <h6 className="text-end">₹{pricePerSeat}</h6>
    <hr />
    <div className="d-flex justify-content-between align-items-center">
      <span>Subtotal:</span>
      <span>₹{selectedSeats.length * pricePerSeat}</span>
    </div>
    <div className="d-flex justify-content-between align-items-center">
    <span>Tax :</span>
<span>₹{(selectedSeats.length > 0 ? (pricePerSeat * 0.25).toFixed(2) : '0.00')}</span>

    </div>
    <hr />
    <div className="d-flex justify-content-between align-items-center">
      <strong>Total:</strong>
      <strong className="text-primary">
  ₹{(selectedSeats.length * pricePerSeat + (selectedSeats.length > 0 ? pricePerSeat * 0.25 : 0)).toFixed(2)}
</strong>

    </div>

    <button
      className="btn btn-primary w-100 mt-4 py-2"
      disabled={selectedSeats.length === 0 || !selectedTime}
      onClick={handleBooking}
    >
      <i className="bi bi-credit-card me-2"></i>
      Proceed to Payment
    </button>
  </div>
</div>


    </div>
  );
};

export default BookingPage;
