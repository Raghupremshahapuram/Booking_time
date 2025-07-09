import React, { useState } from 'react';
import './ChatBot.css';

const ChatBot = ({ onBookingDetails, latestMovies }) => {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');

  const handleSend = () => {
    if (!prompt.trim()) return;

    const userMessage = { sender: 'user', text: prompt };
    setMessages(prev => [...prev, userMessage]);

    const response = parsePrompt(prompt);
    setMessages(prev => [...prev, response.message]);

    if (response.bookingIntent) {
      onBookingDetails(response.bookingIntent); // Trigger parent with booking intent
    }

    setPrompt('');
  };

  const parsePrompt = (text) => {
    const lowerText = text.toLowerCase();

    // Match movie by name (partial or exact match)
    const matchedMovie = latestMovies.find(m =>
      lowerText.includes(m.name.toLowerCase())
    );

    // Match time
    const timeMatch = /(?:at|for)?\s?(\d{1,2})(:\d{2})?\s?(am|pm)?/i.exec(text);
    const time = timeMatch
      ? `${timeMatch[1]}${timeMatch[2] || ':00'} ${timeMatch[3]?.toUpperCase() || 'PM'}`
      : null;

    // Match date
    let date = new Date();
    const dateMatch = /on\s(\d{1,2})\s(january|february|march|april|may|june|july|august|september|october|november|december)/i.exec(text);
    if (dateMatch) {
      const [ day, monthName] = dateMatch;
      date = new Date(`${monthName} ${day}, ${new Date().getFullYear()}`);
    } else if (/tomorrow/i.test(text)) {
      date.setDate(date.getDate() + 1);
    }
    const finalDate = date.toISOString().split('T')[0];

    const replyText = matchedMovie
      ? `🎬 Booking intent captured for "${matchedMovie.name}" at ${time || '7:00 PM'} on ${finalDate}.`
      : `❌ Could not find the specified movie. Please try again.`;

    return {
      message: { sender: 'bot', text: replyText },
      bookingIntent: matchedMovie
        ? {
            movie_id: matchedMovie.id,
            movie_name: matchedMovie.name,
            image: matchedMovie.imageUrl,
            date: finalDate,
            time: time || '7:00 PM'
          }
        : null
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="chatbot">
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.sender}`}>{m.text}</div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask me to book a ticket..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatBot;
