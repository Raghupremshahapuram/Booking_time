import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./Profile.css";

const Profile = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const name = queryParams.get("name");

  const [bookings, setBookings] = useState([]);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const bookingRefs = useRef({});

  useEffect(() => {
    if (name) {
      axios
        .get(`https://chatbotapi-a.onrender.com/bookings?name=${name}`)
        .then((res) => setBookings(res.data))
        .catch((err) => console.error("Error fetching bookings:", err));
    }
  }, [name]);

  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return { hours: 23, minutes: 59 };
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":" ).map(Number);
    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return { hours, minutes };
  };
  const filteredBookings = bookings.filter((booking) => {
    if (booking.status === "cancelled") return !showUpcoming;
    const date = new Date(booking.date);
    const now = new Date();
    const { hours, minutes } = convertTo24Hour(booking.time || "");
    date.setHours(hours);
    date.setMinutes(minutes);
    return showUpcoming ? date >= now : date < now;
  });

  const cancelBooking = (id) => {
    const reason = prompt("Why are you cancelling this ticket?");
    if (!reason) return;

    axios
      .post("https://chatbotapi-a.onrender.com/cancelled-bookings", {
        booking_id: id,
        reason,
      })
      .then(() => {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
        );
      })
      .catch((err) => console.error("❌ Cancellation error:", err));
  };

  const downloadPDF = async (id) => {
    const ref = bookingRefs.current[id];
    if (!ref) return;
    const canvas = await html2canvas(ref);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`booking-${id}.pdf`);
  };

  const handleShare = (id) => {
    const shareLink = `${window.location.origin}/profile?name=${name}&id=${id}`;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">🎟️ Your Bookings</h2>

      <div className="mb-4">
        <button
          className={`btn me-2 ${showUpcoming ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setShowUpcoming(true)}
        >
          Upcoming
        </button>
        <button
          className={`btn ${!showUpcoming ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setShowUpcoming(false)}
        >
          Previous / Cancelled
        </button>
      </div>

      {filteredBookings.length === 0 ? (
        <p>No {showUpcoming ? "upcoming" : "previous or cancelled"} bookings found.</p>
      ) : (
        <div className="row">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="col-md-6 mb-4"
              ref={(el) => (bookingRefs.current[booking.id] = el)}
            >
              <div className="card h-100 shadow">
                <div className="card-body">
                  <h5>
                    🎬 {booking.movie_name
                      ? `Movie: ${booking.movie_name}`
                      : booking.event_name
                      ? `Event: ${booking.event_name}`
                      : "N/A"}
                  </h5>
                  <p>📅 Date: {new Date(booking.date).toLocaleDateString()}</p>
                  <p>⏰ Time: {booking.time || "Not specified"}</p>
                  <p>💺 Seats: {Array.isArray(booking.seats) ? booking.seats.join(", ") : booking.seats}</p>

                  {booking.status === 'cancelled' && (
                    <span className="badge bg-danger">❌ Cancelled</span>
                  )}

                  <div className="mt-2">
                    <p className="mb-1">🎫 Booking QR:</p>
                    <QRCodeCanvas
                      size={150}
                      value={`E-Cube Ticket 🎫\nType: ${booking.movie_name ? "Movie" : "Event"}\nTitle: ${booking.movie_name || booking.event_name}\nDate: ${new Date(booking.date).toLocaleDateString()}\nTime: ${booking.time}\nSeats: ${booking.seats}\nBooked By: ${booking.name}`}
                    />
                  </div>

                  <div className="mt-3 d-flex flex-wrap gap-2">
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => downloadPDF(booking.id)}
                    >
                      📥 Download Ticket (PDF)
                    </button>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleShare(booking.id)}
                    >
                      📤 Share Link
                    </button>
                    {copiedId === booking.id && (
                      <span className="text-success">Link copied!</span>
                    )}
                    {showUpcoming && booking.status !== 'cancelled' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => cancelBooking(booking.id)}
                      >
                        ❌ Cancel Booking
                      </button>
                    )}
                  </div>

                  <div className="mt-2 text-center">
                    <span className="thank-you-message">
                      🎉 Thank you for booking with E-Cube!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
