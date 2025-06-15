import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import './Booking.css';

const TicketPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  if (!bookingData) return <p>No ticket data found.</p>;

  // Fallback for title: show movieName or eventName
  const title = bookingData.movie_name || bookingData.event_name || 'Unknown';

  const generateQRString = (data) => {
    const seatArray = Array.isArray(data.seats) ? data.seats : data.seats.split(', ');
    return `Title: ${title}\nDate: ${data.date}\nTime: ${data.time}\nSeats: ${seatArray.join(', ')}`;
  };
  

  const handlePrint = () => {
    window.print();
  };

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
          <p><strong>Title:</strong> {title}</p>
          <p><strong>Date:</strong> {bookingData.date}</p>
          <p><strong>Time:</strong> {bookingData.time}</p>
          <p><strong>Seats:</strong> {(Array.isArray(bookingData.seats) ? bookingData.seats : bookingData.seats.split(', ')).join(', ')}</p>
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
