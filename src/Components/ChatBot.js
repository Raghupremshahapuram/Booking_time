import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatBot.css';

const ChatBot = () => {
  const [movies, setMovies] = useState([]);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(true);
  const [showLangFilter, setShowLangFilter] = useState(false);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingComplete, setBookingComplete] = useState(false);

  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://chatbotapi-a.onrender.com/latest-movies')
      .then((r) => r.json())
      .then((data) => {
        setMovies(data);
        const langs = [...new Set(data.map((m) => m.language))];
        setLanguageOptions(langs);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight);
  }, [messages, loading]);

  const formatDate = (label) => {
    if (label === 'today') return new Date().toISOString().split('T')[0];
    if (label === 'tomorrow') {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      return t.toISOString().split('T')[0];
    }
    return label;
  };

  const resetConversation = () => {
    setMessages([]);
    setPrompt('');
    setShowLangFilter(false);
    setSelectedLanguage('');
    setFilteredMovies([]);
    setSelectedMovie('');
    setSelectedDate('');
    setSelectedTime('');
    setBookingComplete(false);
    navigate('/'); // ✅ Redirect to home after reset
  };

  const sendMessage = (text, sender = 'user') => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const handleSend = async (customText) => {
    const text = (customText ?? prompt).trim();
    if (!text) return;
    sendMessage(text, 'user');
    setPrompt('');
    setLoading(true);

    try {
      const res = await fetch('https://chatbotapi-a.onrender.com/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `
You are a smart assistant for movie and event booking.
You can:
- Book tickets (need movie, date, time, seats)
- List movies/events
- Show timings for a movie
Return bookingIntent or action keys when needed.
              `.trim()
            },
            ...messages.map((m) => ({
              role: m.sender === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            { role: 'user', content: text }
          ]
        })
      });

      const data = await res.json();

      if (text.toLowerCase().includes('book')) {
        setShowLangFilter(true);
        sendMessage("I need some details to book your tickets. Please select a language.", 'bot');
        return;
      }

      sendMessage(data.reply || '🤖 I need more info.', 'bot');
    } catch (err) {
      sendMessage('❌ Error occurred. Try again later.', 'bot');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = (lang) => {
    setSelectedLanguage(lang);
    sendMessage(`🌐 You selected: ${lang}`, 'bot');
    const filtered = movies.filter((m) => m.language === lang);
    setFilteredMovies(filtered);
    setShowLangFilter(false);
    sendMessage('Here are the movies available:', 'bot');
  };

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie.name);
    sendMessage(movie.name, 'user');
    sendMessage(`🎬 You selected ${movie.name}. What date would you like to watch?`, 'bot');
    setMessages((prev) => prev.filter((msg) => typeof msg.text !== 'object'));
  };

  const handleDateSelect = (dateLabel) => {
    const finalDate = formatDate(dateLabel);
    setSelectedDate(finalDate);
    sendMessage(dateLabel, 'user');
    sendMessage(`🕓 Select a show time for ${selectedMovie}:`, 'bot');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    sendMessage(time, 'user');
    sendMessage('🎟️ How many tickets would you like to book?', 'bot');
  };

  const handleSeatSubmit = (text) => {
    const seats = parseInt(text);
    if (!isNaN(seats) && seats > 0) {
      sendMessage(`${seats} ticket(s)`, 'user');
      setPrompt(''); // ✅ clear input after seat count

      const movie = movies.find((m) => m.name === selectedMovie);
      if (movie) {
        sendMessage('🎟️ Booking confirmed. Redirecting to seat selection...', 'bot');
        sendMessage('Please select your seats.', 'bot');

        sessionStorage.setItem('chatbotMessage', '🎉 Booking successful! Enjoy your movie! 🍿');
        setBookingComplete(true);

        navigate(`/book/${movie.id}`, {
          state: {
            movieName: selectedMovie,
            selectedDate,
            selectedTime,
            ticketCount: seats,
            image: movie.imageUrl || 'https://via.placeholder.com/200x250?text=No+Image'
          }
        });
      }
    } else {
      sendMessage('❌ Please enter a valid number of seats.', 'bot');
    }
  };

  useEffect(() => {
    const handleChatbotUpdate = () => {
      const finalMsg = sessionStorage.getItem('chatbotMessage');
      if (finalMsg) {
        setMessages((prev) => [...prev, { sender: 'bot', text: finalMsg }]);
        sessionStorage.removeItem('chatbotMessage');
      }
    };
    window.addEventListener('chatbotUpdate', handleChatbotUpdate);
    return () => window.removeEventListener('chatbotUpdate', handleChatbotUpdate);
  }, []);

  return (
    <div className={`chatbot ${minimized ? 'minimized' : ''}`}>
      {minimized ? (
        <div
          className="chat-icon"
          title="Open Chat"
          onClick={() => {
            setMinimized(false);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
        >
          💬
        </div>
      ) : (
        <>
          <div className="chat-header" onClick={() => setMinimized(true)}>
            <span>Assistant</span>
            <span>🔽</span>
          </div>

          <div className="chat-window" ref={chatWindowRef}>
            {messages.map((m, i) => (
              <div key={i} className={`message ${m.sender}`}>{m.text}</div>
            ))}

            {loading && <div className="message bot">🤖 .......</div>}

            {showLangFilter && (
              <div className="chat-suggestions">
                {languageOptions.map((lang) => (
                  <button key={lang} onClick={() => handleLanguageSelect(lang)}>🌐 {lang}</button>
                ))}
              </div>
            )}

            {selectedLanguage && !selectedMovie && (
              <div className="chat-suggestions">
                {filteredMovies.map((movie) => (
                  <button key={movie.id} onClick={() => handleMovieSelect(movie)}>
                    🎬 {movie.name}
                  </button>
                ))}
              </div>
            )}

            {selectedMovie && !selectedDate && (
              <div className="chat-suggestions">
                {['today', 'tomorrow'].map((label) => (
                  <button key={label} onClick={() => handleDateSelect(label)}>
                    📅 {label}
                  </button>
                ))}
              </div>
            )}

            {selectedDate && !selectedTime && (
              <div className="chat-suggestions">
                {['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'].map((t) => (
                  <button key={t} onClick={() => handleTimeSelect(t)}>
                    ⏰ {t}
                  </button>
                ))}
              </div>
            )}

            {bookingComplete && (
              <div className="chat-suggestions">
                <button onClick={resetConversation}>🔁 Start New Booking</button>
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (!selectedMovie) handleSend();
                  else if (!selectedDate) handleSend();
                  else if (!selectedTime) handleSend();
                  else handleSeatSubmit(prompt);
                }
              }}
              disabled={loading}
              placeholder="Type your message..."
            />
            <button
              onClick={() => {
                if (!selectedMovie) handleSend();
                else if (!selectedDate) handleSend();
                else if (!selectedTime) handleSend();
                else handleSeatSubmit(prompt);
              }}
              disabled={loading || !prompt.trim()}
            >
              Send
            </button>
          </div>

          {!selectedMovie && !selectedLanguage && !bookingComplete && !showLangFilter && (
            <div className="chat-suggestions">
              <button onClick={() => handleSend('book tickets')}>🎟️ Book Tickets</button>
              <button onClick={() => handleSend('show events')}>📅 Show Events</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatBot;
