import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!booking) {
      navigate('/');
    }
  }, [booking, navigate]);

  const handlePayment = () => {
    if (!booking) return;

    setProcessing(true);
    const bookingDetails = {
      ...booking,
      created_at: new Date().toISOString(),
      name: JSON.parse(localStorage.getItem('loggedInUser'))?.name || 'Guest',
    };

    axios.post('https://postgres-movie.onrender.com/bookings', bookingDetails)
      .then(() => {
        navigate('/ticket', { state: bookingDetails });
      })
      .catch((err) => {
        alert("Payment failed. Please try again.");
        console.error("Payment error:", err);
      })
      .finally(() => setProcessing(false));
  };

  return (
    <div className="container mt-4">
      <h2>💳 Payment for {booking?.movieName || booking?.eventName}</h2>
      <p><strong>Date:</strong> {booking?.date}</p>
      {booking?.time && <p><strong>Time:</strong> {booking.time}</p>}
      {/* <p><strong>Seats:</strong> {booking?.seats?.join(', ')}</p> */}
      <p><strong>Seats:</strong> {Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}</p>


      <div className="form-group mt-3">
        <label>Select Payment Method:</label>
        <div>
          <label className="me-3">
            <input
              type="radio"
              name="payment"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
            />{' '}
            Credit/Debit Card
          </label>
          <label className="me-3">
            <input
              type="radio"
              name="payment"
              value="upi"
              checked={paymentMethod === 'upi'}
              onChange={() => setPaymentMethod('upi')}
            />{' '}
            UPI
          </label>
          <label>
            <input
              type="radio"
              name="payment"
              value="netbanking"
              checked={paymentMethod === 'netbanking'}
              onChange={() => setPaymentMethod('netbanking')}
            />{' '}
            Net Banking
          </label>
        </div>
      </div>

      <button className="btn btn-success mt-3" onClick={handlePayment} disabled={processing}>
        {processing ? 'Processing...' : 'Pay & Confirm Booking'}
      </button>
    </div>
  );
};

export default PaymentPage;
