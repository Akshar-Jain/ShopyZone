import sequelize from './config/db.js';
import { Product, Category } from './models/index.js';

const seedMoreProducts = async () => {
  try {
    console.log('Connecting to database for seeding 300 additional products...');
    await sequelize.authenticate();
    
    const categories = await Category.findAll();
    if (categories.length === 0) {
      console.error('No categories found. Please run the server once to seed initial categories first.');
      process.exit(1);
    }

    const categoryMap = {
      'electronics': {
        id: categories.find(c => c.slug === 'electronics')?.id,
        items: ['Wireless Earbuds', 'Fast Charger', 'Mechanical Keyboard', 'Bluetooth Speaker', 'RGB Mouse', 'Smart Watch Pro', 'Aluminum Laptop Stand', 'Fast Charge Power Bank', 'USB-C Adapter Hub', 'HD Streaming Webcam'],
        brands: ['AuraTech', 'CyberPulse', 'Quantum', 'Nova', 'Apex'],
        descSuffix: 'features cutting-edge components, high-grade materials, and holds long-lasting durability certified for advanced everyday performance.',
        specs: { 'Connectivity': 'Wireless', 'Color': 'Matte Black', 'Warranty': '1 Year' },
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600'
        ]
      },
      'fashion': {
        id: categories.find(c => c.slug === 'fashion')?.id,
        items: ['Slim-Fit Denim Jeans', 'Premium Cotton Hoodie', 'Running Athletic Sneakers', 'Classic Leather Belt', 'Water-Resistant Windbreaker', 'Casual Summer Chinos', 'Knitted Winter Beanie', 'Polarized Retro Sunglasses', 'Activewear Track Pants', 'Formal Linen Button-Up'],
        brands: ['UrbanThread', 'VogueFit', 'ActiveFit', 'Sartorial', 'Metro'],
        descSuffix: 'is tailored from premium breathable fabrics, designed for comfortable everyday lifestyle utility and timeless modern aesthetics.',
        specs: { 'Material': '100% Breathable Fabric', 'Style': 'Modern Casual', 'Care': 'Machine Washable' },
        images: [
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1524041255898-ac375041623b?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600'
        ]
      },
      'home-kitchen': {
        id: categories.find(c => c.slug === 'home-kitchen')?.id,
        items: ['Stainless Steel Mixing Bowls', 'Digital Precision Food Scale', 'Ultrasonic Aroma Diffuser', 'Non-Stick Ceramic Skillet', 'Insulated Stainless Tumbler', 'Bamboo Wooden Cutting Board', 'Electric Rapid Milk Frother', 'Ergonomic Memory Foam Pillow', 'Compact Handheld Garment Steamer', 'Self-Watering Indoor Planter'],
        brands: ['HomeEssence', 'CulinaryPro', 'DecoSpace', 'ComfortLyfe', 'EcoKitchen'],
        descSuffix: 'is a premium household addition constructed using eco-friendly materials and designed to maximize storage utility and lifestyle ease.',
        specs: { 'Material': 'Stainless Steel / Bamboo', 'Safety': 'BPA Free', 'Usage': 'Indoor' },
        images: [
          'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=600'
        ]
      },
      'books': {
        id: categories.find(c => c.slug === 'books')?.id,
        items: ['Data Structures & Algorithms guide', 'Cryptocurrency and Blockchain Blueprint', 'Introduction to Machine Learning Essentials', 'The Whispering Pines Thriller', 'Habits of High Achievers Self-Help', 'Mindset for Creative Thinkers', 'A History of Civilizations Volume I', 'The Quantum Physics Handbook', 'Cooking with Whole Foods Cookbook', 'Product Management Playbook'],
        brands: ['TechPress', 'SagePublishing', 'Chronicle', 'NexusBooks', 'EduPublish'],
        descSuffix: 'contains detailed explanations, high-quality paperback print binding, and diagrams mapping comprehensive topic study guides.',
        specs: { 'Format': 'Paperback', 'Edition': '2026 Edition', 'Language': 'English' },
        images: [
          'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600'
        ]
      },
      'food-groceries': {
        id: categories.find(c => c.slug === 'food-groceries')?.id,
        items: ['Gourmet Dark Chocolate Almonds', 'Organic Japanese Matcha Powder', 'Cold-Pressed Pure Avocado Oil', 'Roasted Whole Bean Coffee', 'Gluten-Free Oats Pack', 'Pure Raw Wildflower Honey', 'Himalayan Pink Salt Shaker', 'Organic Chia Seeds pouch', 'Crispy Vegetable Chips Mix', 'Premium Earl Grey Tea Bags'],
        brands: ['GourmetEarth', 'PureNature', 'DailyBrew', 'WholeEats', 'MatchaMantra'],
        descSuffix: 'is 100% organic, freshly packaged with no artificial preservatives, and locally sourced to preserve standard nutritional excellence.',
        specs: { 'Diet': 'Gluten-Free / Vegan', 'Type': 'Organic Certified', 'Storage': 'Store in Cool, Dry Place' },
        images: [
          'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1473116763269-255448993f16?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=600'
        ]
      },
      'packaging-wrappers': {
        id: categories.find(c => c.slug === 'packaging-wrappers')?.id,
        items: ['Biodegradable Bubble Wrap Roll', 'Kraft Paper Shipping Boxes Set', 'Self-Adhesive Packing Tape Roll', 'Glossy Gift Wrapping Paper Pack', 'Clear Poly Zip Bags Pack', 'Corrugated Cardboard Sheets', 'Custom Decorative Mailing Envelopes', 'Tissue Paper Sheets bundle', 'Fragile Warning Tape Roll', 'Heavy-Duty Bubble Mailers'],
        brands: ['PackMaster', 'EcoShield', 'SecureWrap', 'GiftCraft', 'BoxIt'],
        descSuffix: 'provides heavy-duty surface cushioning, structural tear-resistance, and ensures clean shipping safety for fragile items.',
        specs: { 'Material': 'Recycled Kraft / Poly', 'Weight Capacity': 'Up to 15 kg', 'Eco-friendly': 'Yes' },
        images: [
          'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600'
        ]
      }
    };

    const newProducts = [];
    const slugs = Object.keys(categoryMap);

    // Create 300 products (50 products per category)
    for (const slug of slugs) {
      const cat = categoryMap[slug];
      if (!cat.id) continue;

      for (let i = 1; i <= 50; i++) {
        // Pick dynamic combinations
        const baseItem = cat.items[(i - 1) % cat.items.length];
        const brand = cat.brands[(i - 1) % cat.brands.length];
        const name = `${brand} ${baseItem}`;
        const description = `This premium edition ${name.toLowerCase()} ${cat.descSuffix} Highly recommended for daily utility and engineered with precise quality checks.`;
        
        // Random price between values
        let price = Math.round(500 + Math.random() * 5000);
        if (slug === 'electronics') price = Math.round(1000 + Math.random() * 15000);
        if (slug === 'books') price = Math.round(300 + Math.random() * 2000);
        if (slug === 'food-groceries') price = Math.round(200 + Math.random() * 1500);

        const discountPercent = 10 + Math.round(Math.random() * 30);
        const discountPrice = Math.round(price * (1 - discountPercent / 100));
        const stock = 10 + Math.round(Math.random() * 90);
        const images = [cat.images[(i - 1) % cat.images.length]];
        const ratings = parseFloat((3.5 + Math.random() * 1.5).toFixed(1));
        const reviewsCount = Math.round(Math.random() * 50);

        newProducts.push({
          name,
          description,
          price,
          discountPrice,
          brand,
          stock,
          images,
          ratings,
          reviewsCount,
          isFeatured: i % 10 === 0,
          isActive: true,
          categoryId: cat.id,
          specifications: {
            ...cat.specs,
            'Item Model': `${brand.slice(0,2).toUpperCase()}-${i+100}`,
            'Origin': 'Made in India'
          }
        });
      }
    }

    console.log(`Generated ${newProducts.length} premium products. Inserting to database...`);
    await Product.bulkCreate(newProducts);
    console.log('Seeded 300 additional products successfully.');

  } catch (error) {
    console.error('Failed to seed additional products:', error.message);
  } finally {
    await sequelize.close();
  }
};

seedMoreProducts();
