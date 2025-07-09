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

    if (response.bookingIntent && typeof onBookingDetails === 'function') {
      onBookingDetails(response.bookingIntent);
    }

    setPrompt('');
  };

  const parsePrompt = (text) => {
    const movieMatch = /(?:for|movie)\s(.+?)(?:\s(?:at|@)|\sfor|\stoday|\stomorrow|$)/i.exec(text);
    const movieName = movieMatch?.[1]?.trim() || '';
    const matchedMovie = latestMovies.find(m => m.name.toLowerCase().includes(movieName.toLowerCase()));

    const timeMatch = /(?:at|@)?\s?(\d{1,2})(:\d{2})?\s?(AM|PM)/i.exec(text);
    const time = timeMatch ? `${timeMatch[1]}${timeMatch[2] || ':00'} ${timeMatch[3]}` : null;

    let date = new Date();
    if (/tomorrow/i.test(text)) date.setDate(date.getDate() + 1);
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
