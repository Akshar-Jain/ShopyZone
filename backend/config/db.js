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
  throw new Error('DATABASE_URL environment variable is missing or contains placeholder [YOUR-PASSWORD]. Direct connection to Supabase PostgreSQL is required.');
}

export default sequelize;
