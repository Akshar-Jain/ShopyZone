import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

let sequelize;

if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('[YOUR-PASSWORD]')) {
  console.log('Connecting to Supabase PostgreSQL database...');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Required for Supabase SSL connection
      },
    },
    logging: false,
  });
} else {
  console.log('DATABASE_URL is not set. Falling back to local SQLite database (shopyzone.db)...');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './shopyzone.db',
    logging: false,
  });
}

export default sequelize;
