console.log("monster.js loaded");

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

function addMessage(sender, text) {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = `${sender}: ${text}`;
  if (sender === 'Monster') {
    msgDiv.style.color = '#aaffaa';
  } else {
    msgDiv.style.color = '#eee';
  }
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Greet on load
addMessage('Monster', "Hello, I'm your AI Monster. Talk to me!");

sendButton.addEventListener('click', () => {
  const text = userInput.value.trim();
  if (!text) return;
  
  addMessage('You', text);
  userInput.value = '';

  // Simple bot response logic (replace with your AI logic)
  setTimeout(() => {
    let reply = "I don't understand that yet...";
    if (text.toLowerCase().includes('hello')) reply = "Hi there!";
    else if (text.toLowerCase().includes('how are you')) reply = "I’m lurking in the shadows.";
    else if (text.toLowerCase().includes('monster')) reply = "That’s me! What do you want to know?";
    addMessage('Monster', reply);
  }, 700);
});

userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendButton.click();
  }
});
