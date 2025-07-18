import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import './Ticketpage.css';

const TicketPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  if (!bookingData) return <p>No ticket data found.</p>;

  const {
    movie_name,
    date,
    time,
    seats,
    name,
    bookingId = 'N/A',
    price = 0,
    image = 'https://via.placeholder.com/200x250?text=No+Image',
    paymentMethod = 'N/A',
    created_at,
  } = bookingData;

  const seatsArray = Array.isArray(seats) ? seats : seats?.split(',') || [];
  const seatCount = seatsArray.length;

  const generateQRString = () => {
    return `🎫 E-Cube Ticket
Movie: ${movie_name}
Date: ${new Date(date).toLocaleDateString()}
Time: ${time}
Seats: ${seatsArray.join(', ')}
Name: ${name}
Booking ID: ${bookingId}
Paid: ₹${price}
Thank you for booking with E-Cube!`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mt-5 ticket-page printable-card">
      <div className="card shadow rounded-4 overflow-hidden">
        {/* Header */}
        <div className="ticket-header text-white px-4 py-3 d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1"><i className="bi bi-ticket-perforated-fill me-2"></i>Cinema Ticket</h4>
            <small>Booking ID: <strong>{bookingId}</strong></small>
          </div>
          <div className="text-end">
            <p className="mb-0 fw-bold">Total Paid</p>
            <h4 className="mb-0">₹{price}</h4>
          </div>
        </div>

        {/* Body */}
        <div className="row g-0">
          <div className="col-md-8 p-4">
            <h3 className="fw-bold">{movie_name}</h3>
            <p className="text-muted">Cinema Hall A</p>

            <div className="row mb-3">
              <div className="col-6 d-flex align-items-center gap-2">
                <i className="bi bi-calendar-event fs-5 text-primary"></i>
                <div>
                  <div className="text-muted small">Date</div>
                  <strong>{new Date(date).toLocaleDateString()}</strong>
                </div>
              </div>
              <div className="col-6 d-flex align-items-center gap-2">
                <i className="bi bi-people-fill fs-5 text-success"></i>
                <div>
                  <div className="text-muted small">Seats</div>
                  <strong>{seatCount}</strong> 

                </div>
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-6 d-flex align-items-center gap-2">
                <i className="bi bi-clock fs-5 text-purple"></i>
                <div>
                  <div className="text-muted small">Time</div>
                  <strong>{time}</strong>
                </div>
              </div>
              <div className="col-6 d-flex align-items-center gap-2">
                <i className="bi bi-geo-alt-fill fs-5 text-warning"></i>
                <div>
                  <div className="text-muted small">Screen</div>
                  <strong>Screen 1</strong>
                </div>
              </div>
            </div>

            <hr />
            <div className="row text-center">
              <div className="col"><small className="text-muted">Customer</small><br /><strong>{name}</strong></div>
              <div className="col"><small className="text-muted">Payment</small><br /><strong>{paymentMethod}</strong></div>
              <div className="col"><small className="text-muted">Booked On</small><br /><strong>{new Date(created_at || date).toLocaleDateString()}</strong></div>
            </div>
          </div>

          {/* QR + Poster */}
          <div className="col-md-4 d-flex flex-column justify-content-center align-items-center bg-light border-start p-4">
            <QRCodeCanvas value={generateQRString()} size={140} className="bg-white p-2 rounded shadow-sm mb-3" />
            <p className="text-center small text-muted mb-2">Scan this QR at the entrance</p>
            <img
              src={image}
              alt="Poster"
              className="img-fluid rounded shadow-sm"
              style={{ maxHeight: '180px', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/200x250?text=No+Image';
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer d-flex justify-content-between align-items-center no-print">
          <div>
            <small className="text-muted">
              🎬 Arrive 15 minutes early<br />
              📄 Show this ticket and a valid ID at entry
            </small>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={handlePrint}>
              <i className="bi bi-printer me-2"></i>Download Ticket
            </button>
            <button className="btn btn-success" onClick={() => navigate('/')}>
              <i className="bi bi-arrow-repeat me-2"></i>Book Another Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
