import { readFileSync } from 'fs';
import { isUserTokenValid, getUserNameByToken } from './userService.js';

function setWsChatServer(wss) {
  wss.on('connection', function connection(ws) {
    ws.locals = {}; // Object for storing client variables

    setTimeout(() => {
      if (ws.readyState !== 3 && ws.readyState !== 2 && ws.locals.isAuthed !== true) {
        ws.close(3517, 'No token-message from client after connection for 5 seconds');
      }
    }, 5000);

    const helloMessage = JSON.stringify({
      type: 'newChatMessage',
      name: 'Server Bot',
      time: Date.now(),
      text: 'You are connected to server',
    });
  
    ws.send(helloMessage);

    ws.on('message', function(message) {
      const textData = message.toString()
      const data = JSON.parse(textData);
      console.log('Got: ', data);

      if (data.type === 'useToken') {
        if (isUserTokenValid(String(data.token)) === false) {
          ws.close(3582, 'Wrong token');
        } else {
          ws.locals.name = getUserNameByToken(data.token);
          ws.locals.isAuthed = true;
        }
      }

      if (data.type === 'newChatMessage') {
        if (ws.locals.isAuthed === true) {
          if (data.text && data.text.length > 0) {
            const text = cleanText(data.text);
            sendChatMessage(ws.locals.name, text);
          }
        }
      }
    });
  });

  function sendChatMessage(userName, text) {
    if (wss.clients.size > 0) {
      const message = JSON.stringify({
        type: 'newChatMessage',
        name: userName,
        time: Date.now(),
        text,
      });
  
      wss.clients.forEach((client) => {
        if (client.locals.isAuthed === true) {
          client.send(message);
        }
      });
    }      
  }

  // Fake Server Bot
  {
    let fileData = readFileSync('fun.txt', 'utf-8');
    fileData = fileData.replace(/\r/g, ''); // If file has Windows CRLF, not LF
    const botPhrases = fileData.split('\n');
    // Send random message to chat
    setInterval(() => {
      const random = Math.floor(Math.random() * botPhrases.length);
      sendChatMessage('Server Bot', botPhrases[random])
    }, 12000);
  }
}

function cleanText(text) {
  let newText = text;
  if (newText.length > 500) { newText = newText.substr(0, 500); } 
  newText = newText.replace(/&/g, '&amp;')
  newText = newText.replace(/</g, '&lt;')
  newText = newText.replace(/>/g, '&gt;')
  
  return newText;
}

export { setWsChatServer };
