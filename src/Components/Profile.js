import React from 'react';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user')); // Example

  if (!user) {
    return <h3>Please log in to view your profile.</h3>;
  }

  return (
    <div className="profile-container">
      <h2>👤 Profile Details</h2>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      {/* Add more details if needed */}
    </div>
  );
};

export default Profile;
