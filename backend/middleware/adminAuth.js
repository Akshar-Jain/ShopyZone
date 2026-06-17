import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { ADMIN_EMAIL } from '../config/constants.js';

export const verifyAdminToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'shopyzone_super_secret_jwt_key_2026');

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Strict role and email check
    if (user.role !== 'admin' || user.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return res.status(403).json({ message: 'Access denied. Admin rights required.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please login again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};
