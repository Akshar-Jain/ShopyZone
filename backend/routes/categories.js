import express from 'express';
import { Category } from '../models/index.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. GET ALL CATEGORIES
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 2. CREATE CATEGORY (ADMIN ONLY)
router.post('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const category = await Category.create({
      name,
      slug,
      description,
      image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400',
    });

    res.status(201).json({ message: 'Category created successfully.', category });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

export default router;
