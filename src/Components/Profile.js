import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (username) {
      axios.get(`https://movie-api-b9qw.onrender.com/bookings?user=${username}`)
        .then(res => {
          setBookings(res.data || []);
        })
        .catch(err => {
          console.error("Error fetching bookings", err);
        })
        .finally(() => setLoading(false));
    }
  }, [username]);

  const handleCancel = (id) => {
    axios.delete(`https://movie-api-b9qw.onrender.com/bookings/${id}`)
      .then(() => {
        setBookings(prev => prev.filter(b => b.id !== id));
      })
      .catch(err => console.error("Error cancelling booking", err));
  };

  if (loading) return <p>Loading your bookings...</p>;

  return (
    <div className="container mt-4">
      <h2>👤 {username}'s Bookings</h2>
      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map((b) => (
          <div key={b.id} className="card mb-3">
            <div className="card-body">
              <h5>{b.movieName || b.eventName}</h5>
              <p><strong>Date:</strong> {b.date || 'N/A'}</p>
              {b.time && <p><strong>Time:</strong> {b.time}</p>}
              <p><strong>Seats:</strong> {Array.isArray(b.seats) ? b.seats.join(', ') : 'N/A'}</p>
              <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)}>Cancel</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Profile;
