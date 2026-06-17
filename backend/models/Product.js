import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discountPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  images: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('images');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('images', JSON.stringify(value));
    },
  },
  ratings: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  reviewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  specifications: {
    type: DataTypes.TEXT,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('specifications');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('specifications', JSON.stringify(value));
    },
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

export default Product;
