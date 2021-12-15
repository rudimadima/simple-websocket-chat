import { isUserLoginPasswordCorrect, getUserToken } from './userService.js';

export function login(req, res) {
  const { login, password } = req.body;

  if (isUserLoginPasswordCorrect(login, password) === false) {
    res.status(401).json({ message: 'Wrong login or password' });
    return;
  }

  const token = getUserToken(login);

  res.json({ token, user: login });
}
