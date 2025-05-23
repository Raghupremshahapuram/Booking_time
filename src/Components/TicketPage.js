import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import './Booking.css';

const TicketPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  const generateQRString = (data) => {
    return `Movie: ${data.movieName}\nDate: ${data.date}\nTime: ${data.time}\nSeats: ${data.seats.join(', ')}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (!bookingData) return <p>No ticket data found.</p>;

  return (
    <div className="booking-container ticket-page">
      <h2 className="no-print">🎫 Your Ticket</h2>
      <div className="qr-section">
        <div>
          <h4>Your Ticket QR Code:</h4>
          <QRCodeCanvas
            value={generateQRString(bookingData)}
            size={256}
            includeMargin={true}
          />
        </div>

        <div className="ticket-details">
          <h4>Ticket Details</h4>
          <p><strong>Movie:</strong> {bookingData.movieName}</p>
          <p><strong>Date:</strong> {bookingData.date}</p>
          <p><strong>Time:</strong> {bookingData.time}</p>
          <p><strong>Seats:</strong> {bookingData.seats.join(', ')}</p>
        </div>
      </div>

      <div className="no-print">
  <button className="btn btn-primary me-2" onClick={handlePrint}>
    Print / Download Ticket
  </button>
  <button className="btn btn-primary" onClick={() => navigate('/')}>
    Book Another Ticket
  </button>
</div>

    </div>
  );
};

export default TicketPage;