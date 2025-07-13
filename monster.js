const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

function addMessage(sender, message) {
  const msgDiv = document.createElement('div');
  msgDiv.textContent = (sender === 'monster' ? 'Monster: ' : 'You: ') + message;
  msgDiv.style.marginBottom = '8px';
  if(sender === 'monster') msgDiv.style.color = '#aaffaa';
  else msgDiv.style.color = '#dddddd';
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function monsterReply(userMsg) {
  // Simple demo: echo user message reversed with a little twist
  const reply = userMsg.split('').reverse().join('') + '... *growl*';
  return reply;
}

function handleUserInput() {
  const msg = userInput.value.trim();
  if(msg === '') return;
  
  addMessage('user', msg);
  userInput.value = '';

  setTimeout(() => {
    const reply = monsterReply(msg);
    addMessage('monster', reply);
  }, 700);
}

sendButton.addEventListener('click', handleUserInput);
userInput.addEventListener('keydown', (e) => {
  if(e.key === 'Enter') handleUserInput();
});

// Optional: initial greeting
addMessage('monster', "Hello, I'm your AI Monster. Talk to me!");
