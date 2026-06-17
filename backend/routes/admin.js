import express from 'express';
import { User, Order, Product, Category, Coupon } from '../models/index.js';
import { verifyAdminToken } from '../middleware/adminAuth.js';
import { Op } from 'sequelize';
import sequelize from '../config/db.js';

const router = express.Router();

// 1. DASHBOARD STATS
router.get('/stats', verifyAdminToken, async (req, res) => {
  try {
    // Total users (excluding admins)
    const userCount = await User.count({ where: { role: 'user' } });

    // Total products
    const productCount = await Product.count();

    // Total orders and active sales
    const allOrders = await Order.findAll();
    const orderCount = allOrders.length;

    // Pending orders count
    const pendingOrdersCount = await Order.count({ where: { orderStatus: 'pending' } });

    let totalSales = 0;
    allOrders.forEach(order => {
      if (order.orderStatus !== 'cancelled') {
        totalSales += parseFloat(order.totals.total || 0);
      }
    });

    // Generate monthly sales charts data (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats = {};

    // Initialize past 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = months[d.getMonth()];
      monthlyStats[mName] = { month: mName, sales: 0, orders: 0 };
    }

    allOrders.forEach(order => {
      if (order.orderStatus !== 'cancelled') {
        const date = new Date(order.createdAt);
        const mName = months[date.getMonth()];
        if (monthlyStats[mName]) {
          monthlyStats[mName].sales += parseFloat(order.totals.total || 0);
          monthlyStats[mName].orders += 1;
        }
      }
    });

    const chartData = Object.values(monthlyStats);
    chartData.forEach(item => {
      item.sales = parseFloat(item.sales.toFixed(2));
    });

    res.status(200).json({
      stats: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        pendingOrders: pendingOrdersCount,
        sales: parseFloat(totalSales.toFixed(2)),
      },
      chartData,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 2. PRODUCT MANAGEMENT

// List all products for admin (including inactive ones)
router.get('/products', verifyAdminToken, async (req, res) => {
  try {
    const { search, categoryId } = req.query;
    const where = {};
    const searchOp = sequelize.options.dialect === 'postgres' ? Op.iLike : Op.like;

    if (search) {
      where[Op.or] = [
        { name: { [searchOp]: `%${search}%` } },
        { brand: { [searchOp]: `%${search}%` } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const products = await Product.findAll({
      where,
      include: [{ model: Category, as: 'category', attributes: ['name', 'slug'] }],
      order: [['id', 'DESC']]
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// Create product
router.post('/products', verifyAdminToken, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      categoryId,
      brand,
      stock,
      images,
      specifications,
      isFeatured,
      isActive
    } = req.body;

    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({ message: 'Name, description, price, and category are required.' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      discountPrice: discountPrice || null,
      categoryId,
      brand,
      stock: stock || 0,
      images: images || [],
      specifications: specifications || {},
      isFeatured: isFeatured || false,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({ message: 'Product created successfully.', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// Edit product
router.put('/products/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      discountPrice,
      categoryId,
      brand,
      stock,
      images,
      specifications,
      isFeatured,
      isActive
    } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
    if (categoryId) product.categoryId = categoryId;
    if (brand !== undefined) product.brand = brand;
    if (stock !== undefined) product.stock = stock;
    if (images) product.images = images;
    if (specifications) product.specifications = specifications;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (isActive !== undefined) product.isActive = isActive;

    await product.save();
    res.status(200).json({ message: 'Product updated successfully.', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// Toggle product visibility
router.put('/products/:id/toggle', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.status(200).json({ message: `Product is now ${product.isActive ? 'active' : 'inactive'}.`, product });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// Delete product
router.delete('/products/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    await product.destroy();
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 3. ORDER MANAGEMENT

// List all orders with filters
router.get('/orders', verifyAdminToken, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) {
      where.orderStatus = status;
    }

    const orders = await Order.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
      order: [['id', 'DESC']]
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// Update order status
router.put('/orders/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    order.orderStatus = status;
    
    // Add tracking update details if needed
    const updates = order.trackingUpdates || [];
    updates.push({
      status,
      date: new Date(),
      message: `Order status updated to: ${status.toUpperCase()}`
    });
    order.trackingUpdates = updates;

    await order.save();
    res.status(200).json({ message: 'Order status updated successfully.', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 4. USER MANAGEMENT

// List registered users with order count and join date
router.get('/users', verifyAdminToken, async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: 'user' },
      attributes: { exclude: ['password'] },
      include: [{ model: Order, as: 'orders', attributes: ['id'] }],
      order: [['id', 'ASC']]
    });

    // Format list to calculate count
    const formattedUsers = users.map(u => {
      const uJson = u.toJSON();
      uJson.orderCount = uJson.orders ? uJson.orders.length : 0;
      uJson.joinDate = uJson.createdAt;
      delete uJson.orders;
      return uJson;
    });

    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// Block/unblock user
router.put('/users/:id/block', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { block } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin users cannot be blocked.' });
    }

    user.isBlocked = block;
    await user.save();

    res.status(200).json({
      message: `User has been ${block ? 'blocked' : 'unblocked'} successfully.`,
      user: { id: user.id, name: user.name, email: user.email, isBlocked: user.isBlocked }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 5. CATEGORY MANAGEMENT

// List categories
router.get('/categories', verifyAdminToken, async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['id', 'ASC']] });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// Create category
router.post('/categories', verifyAdminToken, async (req, res) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = await Category.create({ name, slug, description, image });
    res.status(201).json({ message: 'Category created successfully.', category });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// Edit category
router.put('/categories/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    if (name) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;

    await category.save();
    res.status(200).json({ message: 'Category updated successfully.', category });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// Delete category
router.delete('/categories/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    await category.destroy();
    res.status(200).json({ message: 'Category deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 6. COUPON MANAGEMENT

// Get all coupons
router.get('/coupons', verifyAdminToken, async (req, res) => {
  try {
    const coupons = await Coupon.findAll({ order: [['id', 'DESC']] });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// Create coupon
router.post('/coupons', verifyAdminToken, async (req, res) => {
  try {
    const { code, discountType, discountAmount, expiresAt, minOrderAmount } = req.body;

    if (!code || !discountType || !discountAmount || !expiresAt) {
      return res.status(400).json({ message: 'Required fields missing.' });
    }

    const existing = await Coupon.findOne({ where: { code: code.toUpperCase() } });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists.' });
    }

    const coupon = await Coupon.create({
      code,
      discountType,
      discountAmount,
      expiresAt,
      minOrderAmount: minOrderAmount || 0,
      isActive: true,
    });

    res.status(201).json({ message: 'Coupon created successfully.', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// Toggle coupon status
router.put('/coupons/:id/toggle', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.status(200).json({ message: 'Coupon status toggled successfully.', coupon });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// Delete coupon
router.delete('/coupons/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found.' });
    }

    await coupon.destroy();
    res.status(200).json({ message: 'Coupon deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

export default router;
