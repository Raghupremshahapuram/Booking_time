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
  const generateBookingId = () => {
    return 'BK' + Math.random().toString(36).substring(2, 10).toUpperCase();
  };
  
  const bookingId = generateBookingId();

  const handlePayment = () => {
    if (!booking) return;

    setProcessing(true);
    const bookingDetails = {
      ...booking,
      created_at: new Date().toISOString(),
      name: JSON.parse(localStorage.getItem('loggedInUser'))?.name || 'Guest',
      paymentMethod,
      bookingId
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
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
        <h5 className="mb-0">💳 Payment for <strong>{booking?.movie_name || booking?.event_name}</strong></h5>

          <small>Confirm and complete your booking</small>
        </div>
        <div className="card-body">
          <p><strong>Date:</strong> {booking?.date}</p>
          {booking?.time && <p><strong>Time:</strong> {booking.time}</p>}
          <p><strong>Seats:</strong> {Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats}</p>

          <hr />

          <h6 className="mb-3">Select Payment Method:</h6>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="payment"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
              id="paymentCard"
            />
            <label className="form-check-label" htmlFor="paymentCard">
              Credit/Debit Card
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="payment"
              value="upi"
              checked={paymentMethod === 'upi'}
              onChange={() => setPaymentMethod('upi')}
              id="paymentUPI"
            />
            <label className="form-check-label" htmlFor="paymentUPI">
              UPI
            </label>
          </div>
          {paymentMethod === 'upi' && (
  <div className="mt-4">
    <label htmlFor="upiId" className="form-label fw-semibold">UPI ID</label>
    <input
      type="text"
      id="upiId"
      className="form-control"
      placeholder="yourname@paytm / yourname@gpay"
    />
    <div className="form-text">
      Enter your UPI ID (e.g., yourname@paytm, yourname@gpay, yourname@phonepe)
    </div>

    <div className="mt-3 text-muted small d-flex align-items-center">
      <i className="bi bi-lock me-2"></i> Your payment information is secure and encrypted
    </div>

    
  </div>
)}

<button
      className="btn btn-success w-100 mt-3"
      onClick={handlePayment}
      disabled={processing}
    >
      <i className="bi bi-phone me-2"></i>
      {processing ? 'Processing...' : `Complete Payment - ₹${booking?.price || '12.50'}`}
    </button>

          
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

