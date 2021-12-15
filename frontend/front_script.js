const chatLoginForm = document.querySelector('.chatLoginForm');
const loginFormMessageBlock = document.querySelector('.loginFormWrapper .message');
const loginFormInputLogin = document.querySelector('.loginFormWrapper input[name=login]');
const loginFormInputPassword = document.querySelector('.loginFormWrapper input[name=password]');
const loginFormSubmitButton = document.querySelector('.loginFormWrapper input[type=submit]');

const loginFormWrapper = document.querySelector('.loginFormWrapper');
const chatBlockWrapper = document.querySelector('.chatBlockWrapper');
const chatContent = document.querySelector('.chatContent');

const sendMessageForm = document.querySelector('.sendMessageForm');
const inputMessage = document.querySelector('.inputMessage');

chatLoginForm.addEventListener('submit', handleChatLoginFormSubmit);
sendMessageForm.addEventListener('submit', handleSendMessageFormSubmit);
 
const backendHostAndPort = 'localhost:3000';
let chatLoginData = {};
let wsChat;

async function handleChatLoginFormSubmit(e) {
  e.preventDefault();
  loginFormSubmitButton.disabled = true;
  showTempMessage('');
  await new Promise((resolve) => { setTimeout(resolve, 100)}); // Manual pause
  fetch('http://' + backendHostAndPort + '/chat/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      login: loginFormInputLogin.value,
      password: loginFormInputPassword.value,
    }),
  })
    .then((r) => {
      if (r.status === 401) {
        shakeElem(chatLoginForm);
        showTempMessage('Wrong username or password');
      };
      return r.json();
    })
    .then((data) => {
      // console.log(data);
      if (typeof data.token !== 'undefined') {
        chatLoginData = {...chatLoginData, ...data} ;
        hideLoginForm();
        connectToWebsocketChat();
        openChatBlock();
      }
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      loginFormSubmitButton.disabled = false;
    });

}

function shakeElem(elem) {
  elem.classList.add('withFastShake');
  elem.addEventListener('animationend', function removeAnimantion() {
    elem.classList.remove('withFastShake');
    elem.removeEventListener('animationend', removeAnimantion);
  });
}

function showTempMessage(message) {
  loginFormMessageBlock.innerHTML = message;
  setTimeout(() => { loginFormMessageBlock.innerHTML= ''; }, 4000);
}

function openLoginBlock() {
  loginFormWrapper.classList.remove('displayNone');
}

function hideLoginForm() {
  loginFormWrapper.classList.add('displayNone');
}

function openChatBlock() {
  chatBlockWrapper.classList.remove('displayNone');
}

function hideChatBlock() {
  chatBlockWrapper.classList.add('displayNone');
}

function clearChat() {
  chatContent.innerHTML = '';
}

function connectToWebsocketChat() {
  wsChat = new WebSocket('ws://' + backendHostAndPort + '/chat/communicate'); // Connecting to server

  
  wsChat.onopen = function(e) {
    console.log('WS-connection is open now');
    wsChat.send(JSON.stringify({
      type: 'useToken',
      token: chatLoginData.token,
    }));
  };
  
  wsChat.onmessage = handleWebsocketMessage;
  
  wsChat.onclose = function(e) {
    if (e.wasClean) {
      console.log('Connection was closed cleanly: code='+e.code+', reason='+e.reason);
    } else  {
      console.log('Connection was closed by server!');
    }
    hideChatBlock();
    openLoginBlock();
    clearChat();
  };
  
  wsChat.onerror = function(e) {
    console.log('Error! ' + e.message);
  };
}

function handleWebsocketMessage(e) {
  console.log('Message from WS-server: ' + e.data);
  const message = JSON.parse(e.data);
  if (message.type === 'newChatMessage') {
    addNewMessageToChatBlock(message);
  }
  // console.log(message); // JSON-parsed message
}

function addNewMessageToChatBlock(message) {
  const { time, name, text } = message;
  const date = new Date(Number(time));
  const hours = (date.getHours() < 10 ? '0' : '') + date.getHours();
  const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
  const seconds = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();

  const HTML = `<div class="oneMessage">
    <span class="time">${hours}:${minutes}:${seconds}</span>
    <span class="name">${name}</span>
    <span class="text">${text}</span>
  </div>`;

  chatContent.insertAdjacentHTML('beforeEnd', HTML);
  scrollChatToTheEnd();
}

function scrollChatToTheEnd() {
  chatContent.scrollTop = chatContent.scrollHeight;
}

function handleSendMessageFormSubmit(e) {
  e.preventDefault();
  if (inputMessage.value.trim().length === 0) return;
  sendMessageToChat(inputMessage.value);
  inputMessage.value = '';
}


function sendMessageToChat(text) {
  if ( wsChat.readyState !== 1) return;
  wsChat.send(JSON.stringify({
    type: 'newChatMessage',
    text,
  }));
}