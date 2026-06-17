import sequelize from './config/db.js';
import { Product } from './models/index.js';

const removeVersionSuffixes = async () => {
  try {
    console.log('Connecting to database to remove "v" + number suffixes from product names...');
    await sequelize.authenticate();

    const products = await Product.findAll();
    let updatedCount = 0;

    for (const p of products) {
      if (p.name.match(/\s+v\d+$/i)) {
        const oldName = p.name;
        const newName = oldName.replace(/\s+v\d+$/i, '');
        
        p.name = newName;
        await p.save();
        updatedCount++;
      }
    }

    console.log(`Successfully updated ${updatedCount} product names (removed version suffixes).`);

  } catch (error) {
    console.error('Failed to update product names:', error.message);
  } finally {
    await sequelize.close();
  }
};

removeVersionSuffixes();
