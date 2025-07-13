const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// Add message to chat box
function addMessage(sender, message) {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = (sender === 'monster' ? 'Monster: ' : 'You: ') + message;
  msgDiv.style.marginBottom = '8px';
  msgDiv.style.color = sender === 'monster' ? '#aaffaa' : '#dddddd';
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Simple NLP-ish: basic keyword responses
const responses = [
  { keywords: ['hello', 'hi', 'hey'], replies: [
    "Hello, brave soul!",
    "Hey there, what's on your mind?",
    "Greetings, human. Speak, I listen."
  ]},
  { keywords: ['how are you', 'how is it going'], replies: [
    "I am always lurking, always watching.",
    "Better when you talk to me.",
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

// Fallback replies when no keywords matched
const fallbackReplies = [
  "Tell me more...",
  "I don't quite understand, but I’m intrigued.",
  "That sounds mysterious.",
  "Go on...",
  "Hmmm... interesting.",
  "Speak your mind, I am patient."
];

// Check user input against keyword lists and pick a reply
function getMonsterReply(input) {
  const lowerInput = input.toLowerCase();

  for (const entry of responses) {
    if (entry.keywords.some(keyword => lowerInput.includes(keyword))) {
      // Random reply from matching keywords
      const reply = entry.replies[Math.floor(Math.random() * entry.replies.length)];
      return reply;
    }
  }

  // No keyword matched — fallback reply
  return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
}

function handleUserInput() {
  const msg = userInput.value.trim();
  if (!msg) return;

  addMessage('user', msg);
  userInput.value = '';
  userInput.focus();

  // Simulate thinking delay
  setTimeout(() => {
    const reply = getMonsterReply(msg);
    addMessage('monster', reply);
  }, 800);
}

sendButton.addEventListener('click', handleUserInput);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    handleUserInput();
  }
});

// Initial greeting from monster
addMessage('monster', "Hello, I'm your AI Monster. Talk to me!");
