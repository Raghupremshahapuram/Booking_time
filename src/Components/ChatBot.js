import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatBot.css';

const ChatBot = () => {
  const [movies, setMovies] = useState([]);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingIntent, setPendingIntent] = useState(null);
  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const convertTimeFormat = (timeStr) => {
    const match = timeStr.match(/^(\d{1,2})\s*(am|pm)$/i);
    if (!match) return timeStr;
    const hour = parseInt(match[1], 10);
    const period = match[2].toUpperCase();
    return `${hour}:00 ${period}`;
  };

  useEffect(() => {
    fetch('https://chatbotapi-a.onrender.com/latest-movies')
      .then((r) => r.json())
      .then((data) => setMovies(data))
      .catch(console.error);
  }, []);

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

  useEffect(() => {
    chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight);
    inputRef.current?.focus();
  }, [messages, loading]);

  const formatDate = (d) =>
    d.toLowerCase() === 'today' ? new Date().toISOString().split('T')[0] : d;

  const handleSend = async () => {
    const text = prompt.trim();
    if (!text) return;

    if (pendingIntent && /^(yes|confirm|yep|ok|okay|sure)$/i.test(text)) {
      setMessages((m) => [...m, { sender: 'user', text }]);
      setMessages((m) => [
        ...m,
        { sender: 'bot', text: '🎟️ Booking confirmed. Redirecting to seat selection...' }
      ]);
      const { movieId, movie_name, date, time, seats } = pendingIntent;
      setPendingIntent(null);

      return navigate(`/book/${movieId}`, {
        state: {
          movieName: movie_name,
          selectedDate: formatDate(date),
          selectedTime: convertTimeFormat(time),
          ticketCount: seats
        }
      });
    }

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
You are a movie booking assistant. Ask step-by-step:
- Movie name
- Date
- Time
- Number of seats
If user gives full intent in one sentence, extract and return bookingIntent JSON and a confirmation message.
Output plain JSON without code blocks.
              `
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

      if (data.bookingIntent) {
        const found = movies.find(
          (mv) => mv.name.toLowerCase() === data.bookingIntent.movie_name.toLowerCase()
        );

        if (!found) {
          setMessages((m) => [
            ...m,
            { sender: 'user', text },
            {
              sender: 'bot',
              text: `❌ Movie "${data.bookingIntent.movie_name}" not found. Please try a different movie.`
            }
          ]);
        } else {
          setMessages((m) => [
            ...m,
            { sender: 'user', text },
            { sender: 'bot', text: data.reply || '🎟️ Booking confirmed!' },
            { sender: 'bot', text: '🎟️ Booking confirmed. Redirecting to seat selection...' },
            { sender: 'bot', text: 'Please select seats' }
          ]);

          navigate(`/book/${found.id}`, {
            state: {
              movieName: found.name,
              image: found.imageUrl,
              selectedDate: formatDate(data.bookingIntent.date),
              selectedTime: convertTimeFormat(data.bookingIntent.time),
              ticketCount: data.bookingIntent.seats
            }
          });
        }
      } else {
        setMessages((m) => [
          ...m,
          { sender: 'user', text },
          { sender: 'bot', text: data.reply || '🤖 I need more information to proceed.' }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { sender: 'user', text },
        { sender: 'bot', text: '❌ Error occurred. Please try again later.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot">
      <div className="chat-window" ref={chatWindowRef}>
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.sender}`}>{m.text}</div>
        ))}
        {loading && <div className="message bot">🤖 .......</div>}
      </div>
      <div className="chat-input">
        <input
          ref={inputRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={loading}
          placeholder="Ask me to book tickets..."
        />
        <button onClick={handleSend} disabled={loading || !prompt.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
