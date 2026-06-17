import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  items: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('items');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('items', JSON.stringify(value));
    },
  },
});

export default Cart;
