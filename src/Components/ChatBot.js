// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './ChatBot.css';

// const ChatBot = () => {
//   const [movies, setMovies] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [prompt, setPrompt] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [pendingIntent, setPendingIntent] = useState(null);
//   const [minimized, setMinimized] = useState(false);

//   const chatWindowRef = useRef(null);
//   const inputRef = useRef(null);
//   const navigate = useNavigate();

//   const toggleMinimize = () => setMinimized((prev) => !prev);

//   const convertTimeFormat = (timeStr) => {
//     const match = timeStr.match(/^(\d{1,2})\s*(am|pm)$/i);
//     if (!match) return timeStr;
//     const hour = parseInt(match[1], 10);
//     const period = match[2].toUpperCase();
//     return `${hour}:00 ${period}`;
//   };

//   const formatDate = (d) =>
//     d.toLowerCase() === 'today' ? new Date().toISOString().split('T')[0] : d;

//   useEffect(() => {
//     fetch('https://chatbotapi-a.onrender.com/latest-movies')
//       .then((r) => r.json())
//       .then((data) => setMovies(data))
//       .catch(console.error);
//   }, []);

//   useEffect(() => {
//     const handleChatbotUpdate = () => {
//       const finalMsg = sessionStorage.getItem('chatbotMessage');
//       if (finalMsg) {
//         setMessages((prev) => [...prev, { sender: 'bot', text: finalMsg }]);
//         sessionStorage.removeItem('chatbotMessage');
//       }
//     };
//     window.addEventListener('chatbotUpdate', handleChatbotUpdate);
//     return () => window.removeEventListener('chatbotUpdate', handleChatbotUpdate);
//   }, []);

//   useEffect(() => {
//     chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight);
//     inputRef.current?.focus();
//   }, [messages, loading]);

//   const handleSend = async () => {
//     const text = prompt.trim();
//     if (!text) return;

//     if (pendingIntent && /^(yes|confirm|yep|ok|okay|sure)$/i.test(text)) {
//       setMessages((m) => [...m, { sender: 'user', text }]);
//       setMessages((m) => [
//         ...m,
//         { sender: 'bot', text: '🎟️ Booking confirmed. Redirecting to seat selection...' }
//       ]);

//       const { movieId, movie_name, date, time, seats } = pendingIntent;
//       setPendingIntent(null);

//       return navigate(`/book/${movieId}`, {
//         state: {
//           movieName: movie_name,
//           selectedDate: formatDate(date),
//           selectedTime: convertTimeFormat(time),
//           ticketCount: seats
//         }
//       });
//     }

//     setPrompt('');
//     setLoading(true);

//     try {
//       const res = await fetch('https://chatbotapi-a.onrender.com/chatbot', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           messages: [
//             {
//               role: 'system',
//               content: `
// You are a smart assistant for a movie and event booking platform.
// You can:
// - Book movie tickets (needs: movie name, date, time, number of seats)
// - Show list of available movies
// - Show list of events
// - Show showtimes for a specific movie

// When booking, return:
// {
//   "movie_name": "Dasara",
//   "date": "today",
//   "time": "4 PM",
//   "seats": 2
// }

// When asked for listings or showtimes, return:
// {
//   "action": "list_movies" | "list_events" | "get_timings",
//   "movie_name": "RRR" (optional),
//   "date": "today" (optional)
// }

// Do not use code blocks or markdown. Output JSON inline.
//               `.trim()
//             },
//             ...messages.map((m) => ({
//               role: m.sender === 'user' ? 'user' : 'assistant',
//               content: m.text
//             })),
//             { role: 'user', content: text }
//           ]
//         })
//       });

//       const data = await res.json();

//       if (data.bookingIntent) {
//         const found = movies.find(
//           (mv) => mv.name.toLowerCase() === data.bookingIntent.movie_name.toLowerCase()
//         );

//         if (!found) {
//           setMessages((m) => [
//             ...m,
//             { sender: 'user', text },
//             {
//               sender: 'bot',
//               text: `❌ Movie "${data.bookingIntent.movie_name}" not found. Please try a different movie.`
//             }
//           ]);
//         } else {
//           setMessages((m) => [
//             ...m,
//             { sender: 'user', text },
//             { sender: 'bot', text: data.reply || '🎟️ Booking confirmed!' },
//             { sender: 'bot', text: '🎟️ Booking confirmed. Redirecting to seat selection...' },
//             { sender: 'bot', text: 'Please select seats' }
//           ]);

//           navigate(`/book/${found.id}`, {
//             state: {
//               movieName: found.name,
//               image: found.imageUrl,
//               selectedDate: formatDate(data.bookingIntent.date),
//               selectedTime: convertTimeFormat(data.bookingIntent.time),
//               ticketCount: data.bookingIntent.seats
//             }
//           });
//         }
//       } else if (data.action?.action === 'list_events') {
//         try {
//           const response = await fetch('https://chatbotapi-a.onrender.com/events');
//           const events = await response.json();

//           let eventList = '❌ No upcoming events found.';
//           if (Array.isArray(events) && events.length > 0) {
//             eventList = events
//               .map((e) => `🎉 ${e.name} - ${e.location} on ${e.event_date}`)
//               .join('\n');
//           }

//           setMessages((m) => [
//             ...m,
//             { sender: 'user', text },
//             { sender: 'bot', text: data.reply || 'Here are the upcoming events:' },
//             { sender: 'bot', text: eventList }
//           ]);
//         } catch (e) {
//           console.error('❌ Failed to fetch events:', e);
//           setMessages((m) => [
//             ...m,
//             { sender: 'user', text },
//             { sender: 'bot', text: '❌ Failed to load events.' }
//           ]);
//         }
//       } else {
//         setMessages((m) => [
//           ...m,
//           { sender: 'user', text },
//           { sender: 'bot', text: data.reply || '🤖 I need more information to proceed.' }
//         ]);
//       }
//     } catch (err) {
//       console.error(err);
//       setMessages((m) => [
//         ...m,
//         { sender: 'user', text },
//         { sender: 'bot', text: '❌ Error occurred. Please try again later.' }
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className={`chatbot ${minimized ? 'minimized' : ''}`}
//       onClick={minimized ? toggleMinimize : undefined}
//     >
//       {minimized ? (
//         <div className="chat-icon" title="Open Chat">💬</div>
//       ) : (
//         <>
//           <div className="chat-header" onClick={toggleMinimize}>
//             <span>Assistant</span>
//             <span>🔽</span>
//           </div>
//           <div className="chat-window" ref={chatWindowRef}>
//             {messages.map((m, i) => (
//               <div key={i} className={`message ${m.sender}`}>{m.text}</div>
//             ))}
//             {loading && <div className="message bot">🤖 .......</div>}
//           </div>
//           <div className="chat-input">
//             <input
//               ref={inputRef}
//               value={prompt}
//               onChange={(e) => setPrompt(e.target.value)}
//               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
//               disabled={loading}
//               placeholder="Ask me to book tickets or list events..."
//             />
//             <button onClick={handleSend} disabled={loading || !prompt.trim()}>
//               Send
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
  
// };

// export default ChatBot;
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatBot.css';

const ChatBot = () => {
  const [movies, setMovies] = useState([]);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingIntent, setPendingIntent] = useState(null);
  const [minimized, setMinimized] = useState(false);

  const chatWindowRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const toggleMinimize = () => setMinimized((prev) => !prev);

  const convertTimeFormat = (timeStr) => {
    const match = timeStr.match(/^(\d{1,2})\s*(am|pm)$/i);
    if (!match) return timeStr;
    const hour = parseInt(match[1], 10);
    const period = match[2].toUpperCase();
    return `${hour}:00 ${period}`;
  };

  const formatDate = (d) =>
    d.toLowerCase() === 'today' ? new Date().toISOString().split('T')[0] : d;

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
      const chatHistory = [
        ...messages.map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        })),
        { role: 'user', content: text }
      ];

      const res = await fetch('https://chatbotapi-a.onrender.com/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory })
      });

      const data = await res.json();
      console.log("🧠 Chatbot Response:", data);

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
      } else if (data.action?.action === 'list_events') {
        try {
          const response = await fetch('https://chatbotapi-a.onrender.com/events');
          const events = await response.json();

          let eventList = '❌ No upcoming events found.';
          if (Array.isArray(events) && events.length > 0) {
            eventList = events
              .map((e) => `🎉 ${e.name} - ${e.location} on ${e.event_date}`)
              .join('\n');
          }

          setMessages((m) => [
            ...m,
            { sender: 'user', text },
            { sender: 'bot', text: data.reply || 'Here are the upcoming events:' },
            { sender: 'bot', text: eventList }
          ]);
        } catch (e) {
          console.error('❌ Failed to fetch events:', e);
          setMessages((m) => [
            ...m,
            { sender: 'user', text },
            { sender: 'bot', text: '❌ Failed to load events.' }
          ]);
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
    <div
      className={`chatbot ${minimized ? 'minimized' : ''}`}
      onClick={minimized ? toggleMinimize : undefined}
    >
      {minimized ? (
        <div className="chat-icon" title="Open Chat">💬</div>
      ) : (
        <>
          <div className="chat-header" onClick={toggleMinimize}>
            <span>Assistant</span>
            <span>🔽</span>
          </div>
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
              placeholder="Ask me to book tickets or list events..."
            />
            <button onClick={handleSend} disabled={loading || !prompt.trim()}>
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;
