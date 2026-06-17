import { ADMIN_EMAIL } from '../config/constants.js';

export const adminCheck = (req, res, next) => {
  if (req.user && req.user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
};
