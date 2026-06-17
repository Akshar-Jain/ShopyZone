import express from 'express';
import { Cart, Product } from '../models/index.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// 1. GET CART
router.get('/', verifyToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    if (cart.items.length === 0) {
      return res.status(200).json({ items: [] });
    }

    // Populate products
    const productIds = cart.items.map(i => i.productId);
    const products = await Product.findAll({ where: { id: productIds } });

    const populatedItems = cart.items.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        product,
        quantity: item.quantity,
      };
    }).filter(item => item.product !== null); // Filter out any deleted products

    res.status(200).json({ items: populatedItems });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 2. ADD TO CART
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid product or quantity.' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id, items: [] });
    }

    const items = [...cart.items];
    const existingIndex = items.findIndex(i => i.productId === parseInt(productId));

    const currentQty = existingIndex > -1 ? items[existingIndex].quantity : 0;
    const newQty = currentQty + parseInt(quantity);

    if (newQty > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items available in stock.` });
    }

    if (existingIndex > -1) {
      items[existingIndex].quantity = newQty;
    } else {
      items.push({ productId: parseInt(productId), quantity: parseInt(quantity) });
    }

    cart.items = items;
    await cart.save();

    res.status(200).json({ message: 'Product added to cart successfully.', items });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 3. UPDATE CART QUANTITY
router.put('/update', verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid product or quantity.' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items available in stock.` });
    }

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const items = [...cart.items];
    const existingIndex = items.findIndex(i => i.productId === parseInt(productId));

    if (existingIndex > -1) {
      items[existingIndex].quantity = parseInt(quantity);
      cart.items = items;
      await cart.save();
      return res.status(200).json({ message: 'Cart updated successfully.', items });
    } else {
      return res.status(404).json({ message: 'Product not in cart.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 4. REMOVE FROM CART
router.delete('/remove', verifyToken, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required.' });
    }

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found.' });
    }

    const items = cart.items.filter(i => i.productId !== parseInt(productId));
    cart.items = items;
    await cart.save();

    res.status(200).json({ message: 'Product removed from cart successfully.', items });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

export default router;
