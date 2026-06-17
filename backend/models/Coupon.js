import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('code', value.toUpperCase());
    },
  },
  discountType: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['percentage', 'fixed']],
    },
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  minOrderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

export default Coupon;
