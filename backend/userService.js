import { readFileSync } from 'fs';

const users = {}; // Fake database

function fillUsersCred() {
  let fileData = readFileSync('cred.txt', 'utf-8');
  fileData = fileData.replace(/\r/g, '');
  const fileDataArr = fileData.split('\n');
  
  
  for (let i = 0; i < fileDataArr.length; i++) {
    const oneCredArr = fileDataArr[i].split('\t');
    users[oneCredArr[0]] = {
      password: oneCredArr[1],
      token: oneCredArr[2],
    };
  }
}
fillUsersCred();
// console.log(users);

function isUserLoginPasswordCorrect(login, password) {
  if (users[login] === undefined) {
    return false;
  } else if (users[login].password !== password) {
    return false;
  }

  return true;
};

function getUserToken(login) {
  return users[login].token;
}

function isUserTokenValid(token) {
  const props = Object.keys(users);
  for (let i = 0; i < props.length; i++) {
    if (users[props[i]].token === token) {
      return true;
    }
  }
  return false;
}

function getUserNameByToken(token) {
  const props = Object.keys(users);
  for (let i = 0; i < props.length; i++) {
    if (users[props[i]].token === token) {
      return props[i];
    }
  }
  return null;
}

export {
  isUserLoginPasswordCorrect,
  getUserToken,
  getUserNameByToken,
  isUserTokenValid,
};
