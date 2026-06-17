import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  items: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('items');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('items', JSON.stringify(value));
    },
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('shippingAddress');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('shippingAddress', JSON.stringify(value));
    },
  },
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending', // 'pending', 'paid', 'failed'
  },
  orderStatus: {
    type: DataTypes.STRING,
    defaultValue: 'pending', // 'pending', 'shipped', 'delivered', 'cancelled'
  },
  trackingUpdates: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('trackingUpdates');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('trackingUpdates', JSON.stringify(value));
    },
  },
  totals: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const value = this.getDataValue('totals');
      return value ? JSON.parse(value) : { subtotal: 0, discount: 0, shipping: 0, total: 0 };
    },
    set(value) {
      this.setDataValue('totals', JSON.stringify(value));
    },
  },
});

export default Order;
