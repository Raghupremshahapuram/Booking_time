import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Booking.css';

const rows = ['A','B','C','D','E','F'];
const cols = Array.from({ length: 10 }, (_, i) => i + 1);
const seatPrice = 100;

const EventBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [error, setError] = useState('');

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
          setError('Event not found');
        }
      })
      .catch(err => {
        console.error('Error fetching event:', err);
        setError('Failed to load event');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (eventDetails) {
      axios.get('https://postgres-movie.onrender.com/bookings', {
        params: {
          event_name: eventDetails.name,
          date: eventDetails.date,
          time: eventDetails.time
        }
      })
        .then(res => {
          const booked = res.data.flatMap(b =>
            typeof b.seats === 'string'
              ? b.seats.split(',').map(s => s.trim())
              : b.seats || []
          );
          setBookedSeats(booked);
        })
        .catch(err => console.error('Error fetching booked seats', err));
    }
  }, [eventDetails]);

  const handleSeatChange = (seat) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats(prev =>
      prev.includes(seat) ? prev.filter(s => s !== seat) : [...prev, seat]
    );
  };

  const calculateTotal = useCallback(() => {
    const subtotal = selectedSeats.length * seatPrice;
    const tax = subtotal * 0.25;
    return { subtotal, tax, total: subtotal + tax };
  }, [selectedSeats]);

  const handleContinueToPayment = () => {
    if (!selectedSeats.length) return alert('Please select at least one seat');

    const user = getLoggedInUser();
    if (!user) return alert('Please login to continue');

    const { total } = calculateTotal();

    const bookingDetails = {
      userId: user.id,
      name: user.name,
      event_name: eventDetails.name,
      event_id: eventDetails.id,
      date: eventDetails.date,
      time: eventDetails.time,
      venue: eventDetails.venue,
      seats: selectedSeats,
      price: total.toFixed(2),
      image: eventDetails.imageUrl
    };

    navigate('/payment', { state: bookingDetails });
  };

  if (loading) return <h3>Loading event info...</h3>;
  if (error) return <h3 style={{ color: 'red' }}>{error}</h3>;

  const { subtotal, tax, total } = calculateTotal();

  return (
    <div className="booking-container">
      <div className="booking-header card p-4 mb-4">
        <h2 className="text">🎉 Book Tickets for: <span className="fw-bold">{eventDetails.name}</span></h2>
        <div className="d-flex flex-column gap-2 mt-3">
          <div><strong>Date:</strong> {new Date(eventDetails.date).toLocaleDateString()}</div>
          <div><strong>Time:</strong> {eventDetails.time}</div>
          <div><strong>Venue:</strong> {eventDetails.venue}</div>
        </div>
      </div>

      <div className="text-center fw-bold mb-3 bg-dark text-white py-2 rounded">STAGE</div>

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
        <div className="d-flex justify-content-between"><span>Subtotal:</span><span>₹{subtotal}</span></div>
        <div className="d-flex justify-content-between"><span>Tax (25%):</span><span>₹{tax.toFixed(2)}</span></div>
        <hr />
        <div className="d-flex justify-content-between fw-bold fs-5 text-primary"><span>Total:</span><span>₹{total.toFixed(2)}</span></div>
        <button className="btn btn-primary mt-3 w-100" onClick={handleContinueToPayment}>Proceed to Payment</button>
      </div>
    </div>
  );
};

export default EventBookingPage;