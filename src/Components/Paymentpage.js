import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  // Memoize bookingId to prevent regeneration on re-renders
  const bookingId = useMemo(() => {
    return 'BK' + Math.random().toString(36).substring(2, 10).toUpperCase();
  }, []);

  useEffect(() => {
    if (!booking) {
      console.warn('No booking data found, redirecting to homepage.');
      navigate('/');
    }
  }, [booking, navigate]);

  const validateUpiId = (id) => /^[\w.-]+@[\w]+$/.test(id);

  const handlePayment = () => {
    if (!booking) return;

    if (paymentMethod === 'upi' && !validateUpiId(upiId)) {
      alert("Please enter a valid UPI ID (e.g., yourname@bank).");
      return;
    }

    setProcessing(true);
    const user = JSON.parse(localStorage.getItem('loggedInUser')) || { name: 'Guest', id: null };

    const bookingDetails = {
      ...booking,
      created_at: new Date().toISOString(),
      name: user.name,
      userId: user.id,
      paymentMethod,
      upiId: paymentMethod === 'upi' ? upiId.trim() : undefined,
      bookingId
    };
    sessionStorage.setItem('chatbotMessage', '🎉 Booking successful! Enjoy your movie! 🍿');
    window.dispatchEvent(new Event("chatbotUpdate")); // 👈 this triggers it immediately
    

    axios.post('https://chatbotapi-a.onrender.com/bookings', bookingDetails)
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
          <h5 className="mb-0">💳 Payment for <strong>{booking?.movie_name || 'Movie'}</strong></h5>
          <small>Confirm and complete your booking</small>
        </div>
        <div className="card-body">
          <p><strong>Date:</strong> {booking?.date}</p>
          {booking?.time && <p><strong>Time:</strong> {booking.time}</p>}
          <p><strong>Seats:</strong> {Array.isArray(booking?.seats) ? booking.seats.join(', ') : booking?.seats}</p>
          <p><strong>Total Price:</strong> ₹{booking?.price || '0.00'}</p>

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
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
              <div className="form-text">
                Enter your UPI ID (e.g., yourname@paytm, yourname@gpay)
              </div>
              <div className="mt-3 text-muted small d-flex align-items-center">
                <i className="bi bi-lock me-2"></i> Your payment info is encrypted and secure.
              </div>
            </div>
          )}

          <button
            className="btn btn-success w-100 mt-4"
            onClick={handlePayment}
            disabled={processing || !booking}
          >
            <i className="bi bi-phone me-2"></i>
            {processing ? 'Processing...' : `Complete Payment - ₹${booking?.price || '0.00'}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
