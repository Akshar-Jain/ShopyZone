import express from 'express';
import { Order, Cart, Product, Coupon, User } from '../models/index.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import sequelize from '../config/db.js';

const router = express.Router();

// 0. VALIDATE COUPON
router.post('/coupon/validate', verifyToken, async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code is required.' });

    const coupon = await Coupon.findOne({ where: { code: code.toUpperCase(), isActive: true } });
    if (!coupon) {
      return res.status(400).json({ message: 'Invalid or inactive coupon code.' });
    }

    const now = new Date();
    if (now > new Date(coupon.expiresAt)) {
      return res.status(400).json({ message: 'Coupon code has expired.' });
    }

    if (subtotal < parseFloat(coupon.minOrderAmount)) {
      return res.status(400).json({ message: `Minimum order amount of ₹${coupon.minOrderAmount} required.` });
    }

    res.status(200).json({
      message: 'Coupon applied successfully!',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountAmount: parseFloat(coupon.discountAmount),
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 1. PLACE ORDER
router.post('/place', verifyToken, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { items, shippingAddress, couponCode } = req.body;

    if (!items || items.length === 0 || !shippingAddress) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Items and shipping address are required.' });
    }

    let subtotal = 0;
    const orderItems = [];

    // Verify stock and calculate subtotal
    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({ message: `Product not found.` });
      }

      if (product.stock < item.quantity) {
        await transaction.rollback();
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}.` });
      }

      // Deduct stock
      product.stock -= item.quantity;
      await product.save({ transaction });

      const price = product.discountPrice ? parseFloat(product.discountPrice) : parseFloat(product.price);
      subtotal += price * item.quantity;

      orderItems.push({
        productId: product.id,
        name: product.name,
        price,
        quantity: item.quantity,
        image: product.images[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400',
      });
    }

    // Apply Coupon if exists
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ where: { code: couponCode.toUpperCase(), isActive: true } });
      if (coupon) {
        const now = new Date();
        if (now <= new Date(coupon.expiresAt) && subtotal >= parseFloat(coupon.minOrderAmount)) {
          if (coupon.discountType === 'percentage') {
            discount = subtotal * (parseFloat(coupon.discountAmount) / 100);
          } else {
            discount = parseFloat(coupon.discountAmount);
          }
          // Cap discount at subtotal
          discount = Math.min(discount, subtotal);
        }
      }
    }

    const shipping = subtotal > 1000 ? 0 : 50; // free shipping over 1000
    const total = subtotal - discount + shipping;

    // Generate Order ID (e.g. SZ-158293)
    const orderId = `SZ-${Math.floor(100000 + Math.random() * 900000)}`;

    const trackingUpdates = [
      { status: 'pending', message: 'Order has been placed successfully.', date: new Date() },
    ];

    // Create Order
    const order = await Order.create(
      {
        orderId,
        userId: req.user.id,
        items: orderItems,
        shippingAddress,
        paymentStatus: 'paid', // Simulated payment
        orderStatus: 'pending',
        trackingUpdates,
        totals: {
          subtotal: parseFloat(subtotal.toFixed(2)),
          discount: parseFloat(discount.toFixed(2)),
          shipping: parseFloat(shipping.toFixed(2)),
          total: parseFloat(total.toFixed(2)),
        },
      },
      { transaction }
    );

    // Clear user's cart
    const cart = await Cart.findOne({ where: { userId: req.user.id }, transaction });
    if (cart) {
      cart.items = [];
      await cart.save({ transaction });
    }

    await transaction.commit();
    res.status(201).json({ message: 'Order placed successfully.', order });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 2. GET USER ORDER HISTORY
router.get('/history', verifyToken, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 3. GET ORDER DETAILS (BY ORDER ID or PRIMARY KEY ID)
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find by Primary Key ID or Order ID string (SZ-XXXXXX)
    const order = await Order.findOne({
      where: id.startsWith('SZ-') ? { orderId: id } : { id },
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Protect: User can only see their own order, Admin can see all
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 4. UPDATE ORDER STATUS (ADMIN ONLY)
router.put('/admin/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status.' });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Append to tracking updates
    const updates = [...order.trackingUpdates];
    let message = `Order status updated to ${status}.`;
    if (status === 'shipped') message = 'Your order has been shipped and is on its way.';
    if (status === 'delivered') message = 'Your order has been delivered successfully. Thank you for shopping!';
    if (status === 'cancelled') message = 'Your order has been cancelled.';

    updates.push({
      status,
      message,
      date: new Date(),
    });

    order.orderStatus = status;
    order.trackingUpdates = updates;
    await order.save();

    res.status(200).json({ message: 'Order status updated successfully.', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

export default router;
