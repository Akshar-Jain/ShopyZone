import express from 'express';
import { Product, Category, Review, User } from '../models/index.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import sequelize from '../config/db.js';
import { Op } from 'sequelize';

const router = express.Router();

// 1. SEARCH SUGGESTIONS (Autocomplete)
router.get('/suggestions', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(200).json([]);

    const searchOp = sequelize.options.dialect === 'postgres' ? Op.iLike : Op.like;
    const keywords = query.trim().toLowerCase().split(/\s+/).filter(k => k.length > 0);

    if (keywords.length === 0) return res.status(200).json([]);

    // Match all keywords in the product name or brand
    const whereConditions = keywords.map(keyword => {
      let matchPatterns = [`%${keyword}%`];
      if (keyword === 'tshirt' || keyword === 't-shirt' || keyword === 'tshirts' || keyword === 't-shirts') {
        matchPatterns.push('%t-shirt%', '%tshirt%', '%t shirt%');
      }
      return {
        [Op.or]: [
          ...matchPatterns.map(pattern => ({ name: { [searchOp]: pattern } })),
          ...matchPatterns.map(pattern => ({ brand: { [searchOp]: pattern } })),
        ]
      };
    });

    const products = await Product.findAll({
      where: {
        [Op.and]: whereConditions
      },
      attributes: ['name', 'brand'],
      limit: 6,
    });

    // Match matching categories
    const categories = await Category.findAll({
      where: {
        name: { [searchOp]: `%${query}%` }
      },
      attributes: ['name'],
      limit: 2
    });

    const prodSuggestions = products.map(p => p.name);
    const catSuggestions = categories.map(c => c.name);
    const brandSuggestions = products.map(p => p.brand).filter(b => b && b.toLowerCase().includes(query.toLowerCase()));

    // Combine suggestions
    const suggestions = [...new Set([...catSuggestions, ...prodSuggestions, ...brandSuggestions])].slice(0, 8);
    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 2. LIST PRODUCTS (Filters, Sort, Pagination)
router.get('/', async (req, res) => {
  try {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      brand,
      minRating,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchOp = sequelize.options.dialect === 'postgres' ? Op.iLike : Op.like;

    const where = { isActive: true };

    // Filter by Search Query (Split by spaces and match all keywords)
    if (search) {
      const keywords = search.trim().toLowerCase().split(/\s+/).filter(k => k.length > 0);
      if (keywords.length > 0) {
        where[Op.and] = keywords.map(keyword => {
          let matchPatterns = [`%${keyword}%`];
          if (keyword === 'tshirt' || keyword === 't-shirt' || keyword === 'tshirts' || keyword === 't-shirts') {
            matchPatterns.push('%t-shirt%', '%tshirt%', '%t shirt%');
          }
          
          return {
            [Op.or]: [
              ...matchPatterns.map(pattern => ({ name: { [searchOp]: pattern } })),
              ...matchPatterns.map(pattern => ({ brand: { [searchOp]: pattern } })),
              ...matchPatterns.map(pattern => ({ description: { [searchOp]: pattern } })),
              ...matchPatterns.map(pattern => ({ '$category.name$': { [searchOp]: pattern } })),
            ]
          };
        });
      }
    }

    // Filter by Category
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Filter by Price Range
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    // Filter by Brand
    if (brand) {
      where.brand = brand;
    }

    // Filter by Ratings
    if (minRating) {
      where.ratings = { [Op.gte]: parseFloat(minRating) };
    }

    // Sorting
    let order = [['id', 'DESC']]; // default newest
    if (sort === 'priceAsc') {
      order = [['price', 'ASC']];
    } else if (sort === 'priceDesc') {
      order = [['price', 'DESC']];
    } else if (sort === 'rating') {
      order = [['ratings', 'DESC']];
    } else if (sort === 'popular') {
      order = [['reviewsCount', 'DESC']];
    } else if (sort === 'oldest') {
      order = [['id', 'ASC']];
    }

    const queryOptions = {
      where,
      order,
      limit: parseInt(limit),
      offset,
      include: [{ model: Category, as: 'category', attributes: ['name', 'slug'] }],
    };

    if (search) {
      queryOptions.subQuery = false;
    }

    const { count, rows: products } = await Product.findAndCountAll(queryOptions);

    res.status(200).json({
      products,
      total: count,
      pages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 3. PRODUCT DETAIL & RELATED PRODUCTS
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        {
          model: Review,
          as: 'reviews',
          include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
        },
      ],
      order: [[{ model: Review, as: 'reviews' }, 'createdAt', 'DESC']],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Fetch related products (same category, excluding this product)
    const related = await Product.findAll({
      where: {
        categoryId: product.categoryId,
        id: { [Op.ne]: product.id },
      },
      limit: 4,
    });

    res.status(200).json({ product, related });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 4. SUBMIT REVIEW & RATING
router.post('/:id/reviews', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required.' });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      where: { userId: req.user.id, productId: id },
    });

    if (existingReview) {
      // Update review instead of creating new one
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
    } else {
      // Create new review
      await Review.create({
        userId: req.user.id,
        productId: id,
        rating,
        comment,
      });
    }

    // Recalculate average rating & count
    const allReviews = await Review.findAll({ where: { productId: id } });
    const reviewsCount = allReviews.length;
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount;

    product.ratings = parseFloat(avgRating.toFixed(1));
    product.reviewsCount = reviewsCount;
    await product.save();

    res.status(200).json({ message: 'Review submitted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 5. CREATE PRODUCT (ADMIN ONLY)
router.post('/', verifyToken, isAdmin, async (req, res) => {
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
    } = req.body;

    if (!name || !description || !price || !categoryId) {
      return res.status(400).json({ message: 'Name, description, price, and category are required.' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      discountPrice,
      categoryId,
      brand,
      stock: stock || 0,
      images: images || [],
      specifications: specifications || {},
      isFeatured: isFeatured || false,
    });

    res.status(201).json({ message: 'Product created successfully.', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 6. UPDATE PRODUCT (ADMIN ONLY)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
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
    } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (categoryId) product.categoryId = categoryId;
    if (brand) product.brand = brand;
    if (stock !== undefined) product.stock = stock;
    if (images) product.images = images;
    if (specifications) product.specifications = specifications;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;

    await product.save();

    res.status(200).json({ message: 'Product updated successfully.', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// 7. DELETE PRODUCT (ADMIN ONLY)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
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

export default router;
