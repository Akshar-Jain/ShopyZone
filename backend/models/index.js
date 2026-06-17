import User from './User.js';
import Product from './Product.js';
import Category from './Category.js';
import Order from './Order.js';
import Cart from './Cart.js';
import Review from './Review.js';
import Coupon from './Coupon.js';
import VerificationToken from './VerificationToken.js';

// Setup associations
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products', onDelete: 'CASCADE' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Cart, { foreignKey: 'userId', as: 'cart', onDelete: 'CASCADE' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

export {
  User,
  Product,
  Category,
  Order,
  Cart,
  Review,
  Coupon,
  VerificationToken
};
