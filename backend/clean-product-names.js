import sequelize from './config/db.js';
import { Product } from './models/index.js';

const cleanProductNames = async () => {
  try {
    console.log('Connecting to database to clean up product names...');
    await sequelize.authenticate();

    const products = await Product.findAll();
    let updatedCount = 0;

    for (const p of products) {
      if (p.name.match(/ #\d+$/)) {
        const oldName = p.name;
        // Replace " #57" with " Series 57" or similar, or just remove it
        // Let's remove the " #" and replace it with " v" or " Series " so it looks clean, e.g., "BoxIt Heavy-Duty Bubble Mailers v60"
        const num = oldName.match(/ #(\d+)$/)[1];
        const newName = oldName.replace(/ #\d+$/, ` v${num}`);
        
        p.name = newName;
        await p.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} product names (removed '#' suffixes).`);

  } catch (error) {
    console.error('Failed to clean product names:', error.message);
  } finally {
    await sequelize.close();
  }
};

cleanProductNames();
