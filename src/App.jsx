import React, { useState, useEffect, useRef } from 'react';
import './app.css'; // Make sure your CSS is imported

const responses = [
  { keywords: ['hello', 'hi', 'hey'], replies: [
    "Hellooo, brave soul!",
    "Heeeeey there, what's on your mind?",
    "Greetings, friend. Speak, I will listen."
  ]},
  { keywords: ['how are you', 'how is it going'], replies: [
    "I am awake, lurking, always watching.",
    "Better when you talk to me, im learning.",
    "Stirring in the darkness as usual."
  ]},
  { keywords: ['monster', 'you'], replies: [
    "I am the shadow beneath your bed.",
    "They call me Monster, but I am simply curious.",
    "Here to listen and maybe scare a little."
  ]},
  { keywords: ['help', 'assist', 'support'], replies: [
    "I can guide you, if you ask the right questions.",
    "Help is what I offer in my own way.",
    "Tell me your troubles; perhaps I can ease them."
  ]},
  { keywords: ['bye', 'goodbye', 'see you'], replies: [
    "Until next time, wanderer.",
    "I’ll be here, waiting in the shadows.",
    "Farewell... for now."
  ]},
];

const fallbackReplies = [
  "Tell me more...",
  "I don't quite understand, but I’m intrigued.",
  "That sounds mysterious.",
  "Go on...",
  "Hmmm... interesting.",
  "Speak your mind, I am patient."
  "UUUHHHHH." 
  " Idk......"
];

function getMonsterReply(input) {
  const lowerInput = input.toLowerCase();
  for (const entry of responses) {
    if (entry.keywords.some(keyword => lowerInput.includes(keyword))) {
      const reply = entry.replies[Math.floor(Math.random() * entry.replies.length)];
      return reply;
    }
  }
  return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
}

export default function App() {
  const [messages, setMessages] = useState([
    { sender: 'monster', text: "Hello, I'm your AI Monster. Talk to me!" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const chatBoxRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if(chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    // Add user's message
    setMessages(prev => [...prev, { sender: 'user', text: trimmed }]);
    setInputValue('');

    // Simulate monster reply after delay
    setTimeout(() => {
      const reply = getMonsterReply(trimmed);
      setMessages(prev => [...prev, { sender: 'monster', text: reply }]);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div id="container" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: '20px',
      boxSizing: 'border-box',
      background: 'rgba(0, 0, 0, 0.35)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      backgroundImage: "url('./images/background.jpg')",
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundAttachment: 'fixed',
      backgroundSize: 'cover',
    }}>
      <img
        id="monster-image"
        src="./images/monster.png"
        alt="AI Monster"
        style={{
          width: '200px',
          maxWidth: '80vw',
          marginBottom: '20px',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />

      <div
        id="chat-box"
        ref={chatBoxRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        style={{
          width: '90%',
          maxWidth: '600px',
          height: '250px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          borderRadius: '10px',
          padding: '15px',
          overflowY: 'auto',
          marginBottom: '10px',
          fontSize: '16px',
          lineHeight: 1.4,
          boxShadow: '0 0 15px rgba(0, 255, 0, 0.3)',
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{ 
              marginBottom: '8px', 
              color: msg.sender === 'monster' ? '#aaffaa' : '#dddddd' 
            }}
          >
            <strong>{msg.sender === 'monster' ? 'Monster' : 'You'}: </strong>{msg.text}
          </div>
        ))}
      </div>

      <div
        id="user-input-container"
        style={{
          width: '90%',
          maxWidth: '600px',
          display: 'flex',
          boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      >
        <input
          id="user-input"
          type="text"
          placeholder="Type your message..."
          aria-label="Type your message here"
          autoComplete="off"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flexGrow: 1,
            padding: '12px 16px',
            fontSize: '16px',
            border: 'none',
            outline: 'none',
            backgroundColor: '#111',
            color: '#eee',
          }}
        />
        <button
          id="send-button"
          aria-label="Send message"
          onClick={sendMessage}
          style={{
            padding: '0 24px',
            fontSize: '16px',
            backgroundColor: '#39a839',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#2f842f'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#39a839'}
        >
          Send
        </button>
      </div>
    </div>
  );
}
