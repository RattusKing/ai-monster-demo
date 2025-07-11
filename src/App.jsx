import React, { useState, useEffect } from 'react';
import './App.css';


const baseStats = {
  trust: 0.1,
  curiosity: 0.1,
  mood: 0.1,
  energy: 0.1,
};

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('monsterMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem('monsterStats');
    return saved ? JSON.parse(saved) : baseStats;
  });

  // Save messages and stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('monsterStats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('monsterMessages', JSON.stringify(messages));
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const newMessages = [...messages, { from: 'user', text: trimmed }];
    const monsterReply = getMonsterResponse(trimmed);
    newMessages.push({ from: 'monster', text: monsterReply });
    setMessages(newMessages);
    setInput('');
  };

  const getMonsterResponse = (text) => {
    const lowered = text.toLowerCase();
    let response = "...";
    const newStats = { ...stats };

    if (lowered.includes('hello') || lowered.includes('hi')) {
      newStats.trust += 0.1;
      response = "Lumimon chirps: 'Hi! I’m glad you’re here.'";
    } else if (lowered.includes('i love you')) {
      newStats.trust += 0.2;
      newStats.mood += 0.1;
      response = "Lumimon sparkles: 'That means a lot... I feel warmer now.'";
    } else if (lowered.includes('train') || lowered.includes('learn')) {
      newStats.curiosity += 0.2;
      response = "Lumimon’s eyes light up: 'Yes! Teach me!'";
    } else if (lowered.includes('bad') || lowered.includes('hate')) {
      newStats.trust -= 0.2;
      newStats.mood -= 0.2;
      response = "Lumimon dims slightly: 'That... hurt. Did I do something wrong?'";
    } else {
      response = "Lumimon tilts its head: 'Hmm... I'm not sure what that means yet.'";
    }

    // Clamp stats between 0 and 1, round to 3 decimals
    Object.keys(newStats).forEach(k => {
      newStats[k] = Math.max(0, Math.min(1, parseFloat(newStats[k].toFixed(3))));
    });

    setStats(newStats);
    return response;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2">🌟 Lumimon Companion</h1>
      <p className="text-sm text-gray-300 mb-4">Your AI Monster remembers how you treat it.</p>
      <div className="bg-black bg-opacity-30 p-4 rounded-xl w-full max-w-md flex flex-col">
        <div className="mb-4 h-64 overflow-y-auto flex flex-col gap-2">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={msg.from === 'user' ? 'text-right text-blue-200' : 'text-left text-pink-200'}
            >
              <span>{msg.text}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 p-2 rounded bg-white text-black"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Say something to Lumimon..."
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            className="bg-purple-600 hover:bg-purple-800 px-4 py-2 rounded"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
        <div className="mt-4 text-sm space-y-1">
          <p>❤️ Trust: {stats.trust.toFixed(2)}</p>
          <p>🧠 Curiosity: {stats.curiosity.toFixed(2)}</p>
          <p>😊 Mood: {stats.mood.toFixed(2)}</p>
          <p>⚡ Energy: {stats.energy.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
