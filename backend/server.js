import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import sequelize from './config/db.js';
import { User, Product, Category, Coupon, Cart } from './models/index.js';

// Route imports
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes mounting
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Simple Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', database: sequelize.options.dialect });
});

// Database seeding function
const seedDatabase = async () => {
  try {
    // 1. Seed Categories
    const categoriesCount = await Category.count();
    let seededCategories = [];
    if (categoriesCount === 0) {
      console.log('Seeding initial categories...');
      seededCategories = await Category.bulkCreate([
        {
          name: 'Electronics',
          slug: 'electronics',
          description: 'Laptops, smartphones, smartwatches, and headphones.',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
        },
        {
          name: 'Fashion',
          slug: 'fashion',
          description: 'Trendy clothing, shoes, and accessories.',
          image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=400',
        },
        {
          name: 'Home & Kitchen',
          slug: 'home-kitchen',
          description: 'Modern cookware, home decor, and appliances.',
          image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400',
        },
        {
          name: 'Books',
          slug: 'books',
          description: 'Best-selling novels, self-improvement guides, and algorithms textbooks.',
          image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400',
        },
        {
          name: 'Food & Groceries',
          slug: 'food-groceries',
          description: 'Snacks, cookies, chocolates, coffee, and gourmet ingredients.',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
        },
        {
          name: 'Packaging & Wrappers',
          slug: 'packaging-wrappers',
          description: 'Gift wraps, bubble wraps, packing paper, and shipping supplies.',
          image: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=400',
        }
      ]);
      console.log('Categories seeded successfully.');
    } else {
      seededCategories = await Category.findAll();
    }

    // 2. Seed Products
    const productsCount = await Product.count();
    if (productsCount === 0 && seededCategories.length > 0) {
      console.log('Seeding initial products (106 items)...');
      const electronicsId = seededCategories.find(c => c.slug === 'electronics').id;
      const fashionId = seededCategories.find(c => c.slug === 'fashion').id;
      const homeId = seededCategories.find(c => c.slug === 'home-kitchen').id;
      const booksId = seededCategories.find(c => c.slug === 'books').id;
      const foodId = seededCategories.find(c => c.slug === 'food-groceries').id;
      const packagingId = seededCategories.find(c => c.slug === 'packaging-wrappers').id;

      const productsList = [
        // ELECTRONICS (20 items)
        {
          name: 'ShopyZone Pro Headphones',
          description: 'Experience studio-quality sound with adaptive active noise cancellation, deep bass boost, and up to 40 hours of battery life. Includes an ergonomic headband and plush earcups for premium comfort.',
          price: 5999.00, discountPrice: 4999.00, brand: 'SoundMaster', stock: 25,
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.8, reviewsCount: 1, isFeatured: true, categoryId: electronicsId,
          specifications: { 'Bluetooth Version': '5.2', 'Battery Life': '40 Hours', 'Noise Cancellation': 'Active (ANC)' }
        },
        {
          name: 'Ultimate Fit Smartwatch v4',
          description: 'Track your health in style. Monitor heart rate, blood oxygen levels, sleep scores, and 120+ workout modes. Built-in GPS and voice assistant. IP68 water resistance.',
          price: 4999.00, discountPrice: 3499.00, brand: 'FitTech', stock: 15,
          images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: true, categoryId: electronicsId,
          specifications: { 'Screen Size': '1.78 inch AMOLED', 'Water Resistance': 'IP68', 'Battery Backup': '7 Days' }
        },
        {
          name: 'Wireless Ergonomic Mouse',
          description: 'High-precision wireless optical gaming/office mouse. Lightweight design with customizable buttons, long-lasting rechargeable battery, and smooth gliding pads.',
          price: 1999.00, discountPrice: 1499.00, brand: 'FitTech', stock: 40,
          images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Resolution': '16000 DPI', 'Connectivity': '2.4GHz Wireless', 'Battery Life': 'Up to 70 Hours' }
        },
        {
          name: 'Ultra-Thin Aluminum Laptop Stand',
          description: 'Ergonomic aluminum laptop riser with 6 adjustable height angles. Folds down flat for travel. Prevents neck strain and promotes optimal device cooling.',
          price: 1299.00, discountPrice: 899.00, brand: 'FitTech', stock: 30,
          images: ['https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Material': 'Aluminum Alloy', 'Height Adjustments': '6 Levels' }
        },
        {
          name: 'Mechanical RGB Gaming Keyboard',
          description: 'Tactile mechanical switches with customizable RGB lighting and premium build quality. Keycap puller included.',
          price: 4500.00, discountPrice: 3999.00, brand: 'SoundMaster', stock: 12,
          images: ['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.7, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Switches': 'Blue Mechanical', 'Lighting': 'RGB' }
        },
        {
          name: 'Portable Bluetooth Speaker',
          description: 'Waterproof portable speaker with rich bass and up to 12 hours of playtime. Connects instantly with Bluetooth 5.0.',
          price: 2999.00, discountPrice: 2499.00, brand: 'SoundMaster', stock: 18,
          images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Bluetooth': '5.0', 'Playtime': '12 Hours', 'Waterproof': 'IPX7' }
        },
        {
          name: '1080p Ultra-Wide Webcam',
          description: 'High-definition webcam with built-in noise reduction dual microphones. Perfect for streaming, video conferences, and online education.',
          price: 2499.00, discountPrice: 1999.00, brand: 'FitTech', stock: 22,
          images: ['https://images.unsplash.com/photo-1600541519468-4a812181503a?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.3, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Resolution': '1080p Full HD', 'Focus': 'Autofocus', 'Mic': 'Dual Stereo' }
        },
        {
          name: 'Gigabit Dual-Band Wi-Fi Router',
          description: 'High-speed router supporting dual-band Wi-Fi. Simultaneous 2.4GHz and 5GHz connection for smooth 4K streaming and online gaming.',
          price: 3499.00, discountPrice: 2999.00, brand: 'FitTech', stock: 15,
          images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.2, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Bands': '2.4GHz & 5GHz', 'Speed': '1200 Mbps', 'Antennas': '4 External' }
        },
        {
          name: '27-inch IPS Gaming Monitor',
          description: 'Full HD IPS display with 144Hz refresh rate and 1ms response time. Anti-glare coating and eye care mode.',
          price: 16999.00, discountPrice: 14999.00, brand: 'FitTech', stock: 8,
          images: ['https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.9, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Screen Size': '27 inches', 'Refresh Rate': '144Hz', 'Panel': 'IPS' }
        },
        {
          name: 'Noise-Isolating Wired Earbuds',
          description: 'In-ear wired earbuds with crystal clear vocals, deep bass, and comfortable silicone ear tips. Includes inline microphone.',
          price: 1299.00, discountPrice: 999.00, brand: 'SoundMaster', stock: 50,
          images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.1, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Driver Size': '10mm', 'Cable': '1.2m Tangle-Free', 'Jack': '3.5mm' }
        },
        {
          name: 'Fast Charging Power Bank 20Ah',
          description: 'High capacity power bank with fast charging support. Features dual USB output and dual input (Type-C and Micro-USB).',
          price: 2199.00, discountPrice: 1799.00, brand: 'FitTech', stock: 35,
          images: ['https://images.unsplash.com/photo-1609592424085-f542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Capacity': '20000mAh', 'Input': 'Type-C / Micro', 'Output': '18W Fast Charge' }
        },
        {
          name: 'USB-C 7-in-1 Hub Adapter',
          description: 'Expand your laptop connectivity. Features 4K HDMI output, USB 3.0 ports, Type-C Power Delivery, and SD/MicroSD card readers.',
          price: 1599.00, discountPrice: 1299.00, brand: 'FitTech', stock: 20,
          images: ['https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'HDMI Output': '4K @ 30Hz', 'Power Delivery': '87W USB-C PD' }
        },
        {
          name: 'Wireless Charging Stand 15W',
          description: 'Fast wireless charger for smartphones and earbuds. Double coils allow horizontal and vertical charging.',
          price: 1499.00, discountPrice: 1199.00, brand: 'FitTech', stock: 28,
          images: ['https://images.unsplash.com/photo-1622448376702-3f66f32aef97?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.3, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Power': '15W Fast Charge', 'Coils': 'Dual Coils' }
        },
        {
          name: 'Professional Condenser Mic',
          description: 'Studio microphone for recording, streaming, and podcasting with high-fidelity USB connection and adjustable arm stand.',
          price: 5499.00, discountPrice: 4599.00, brand: 'SoundMaster', stock: 15,
          images: ['https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.7, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Polar Pattern': 'Cardioid', 'Connection': 'USB', 'Frequency Response': '20Hz-20kHz' }
        },
        {
          name: 'Active Tablet Stylus Pen',
          description: 'Precision stylus pen for tablets and iPads. Supports palm rejection, tilt sensitivity, and magnetic attachment.',
          price: 1999.00, discountPrice: 1499.00, brand: 'FitTech', stock: 30,
          images: ['https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Charging Time': '1 Hour', 'Usage Time': '10 Hours', 'Palm Rejection': 'Yes' }
        },
        {
          name: 'Smart Home Security Camera',
          description: '1080p indoor security camera with night vision, motion tracking alerts, and two-way real-time audio.',
          price: 2799.00, discountPrice: 2299.00, brand: 'FitTech', stock: 16,
          images: ['https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Resolution': '1080p HD', 'Rotation': '360° Horizontal', 'Storage': 'MicroSD / Cloud' }
        },
        {
          name: 'Noise-Cancelling Office Headset',
          description: 'Lightweight business headset with noise-cancelling microphone and inline volume and mute control. USB connection.',
          price: 1899.00, discountPrice: 1599.00, brand: 'SoundMaster', stock: 40,
          images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.2, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Mic Type': 'Uni-Directional', 'Connector': 'USB-A' }
        },
        {
          name: 'Gaming Mouse Pad XL',
          description: 'Extra large mouse pad with stitched edges, anti-slip rubber base, and micro-textured cloth surface for optimal precision.',
          price: 899.00, discountPrice: 699.00, brand: 'SoundMaster', stock: 60,
          images: ['https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Size': '900 x 400 x 3 mm', 'Base': 'Natural Rubber' }
        },
        {
          name: 'Bluetooth Smart Audio Glasses',
          description: 'Polarized sunglasses with built-in open-ear wireless speakers, micro-microphone, and voice assistant support.',
          price: 5999.00, discountPrice: 4999.00, brand: 'FitTech', stock: 10,
          images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Bluetooth': '5.0', 'Battery Life': '5 Hours', 'UV Protection': 'UV400' }
        },
        {
          name: 'Multi-Device Bluetooth Keyboard',
          description: 'Sleek, lightweight wireless keyboard that connects with up to 3 devices simultaneously. Compatible with Windows, Mac, iOS, Android.',
          price: 2999.00, discountPrice: 2499.00, brand: 'FitTech', stock: 25,
          images: ['https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Battery': '2 AAA Batteries', 'Range': '10 meters' }
        },

        // FASHION (20 items)
        {
          name: 'Premium Leather Jacket',
          description: 'Handcrafted from 100% genuine top-grain lambskin leather. Features a classic asymmetrical zip closure, multiple secure pockets, and a soft quilted inner lining. Elevate your wardrobe instantly.',
          price: 7999.00, discountPrice: 5999.00, brand: 'UrbanStyle', stock: 10,
          images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.7, reviewsCount: 0, isFeatured: true, categoryId: fashionId,
          specifications: { 'Material': '100% Lambskin Leather', 'Closure': 'Asymmetrical Zipper', 'Dry Clean Only': 'Yes' }
        },
        {
          name: 'Running Breathable Sneakers',
          description: 'Engineered mesh upper for maximum breathability. Advanced responsive foam cushioning absorbs impact and returns energy with every stride. Non-slip grip rubber outsole.',
          price: 2999.00, discountPrice: 2499.00, brand: 'AeroStride', stock: 30,
          images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.2, reviewsCount: 0, isFeatured: true, categoryId: fashionId,
          specifications: { 'Sole Material': 'Rubber', 'Closure': 'Lace-Up', 'Arch Support': 'Neutral' }
        },
        {
          name: 'Classic Red Cotton T-Shirt',
          description: 'A premium, 100% organic cotton red t-shirt. Features a comfortable crew neck, short sleeves, and a soft, breathable fit. Perfect for casual daily wear.',
          price: 799.00, discountPrice: 599.00, brand: 'UrbanStyle', stock: 50,
          images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: true, categoryId: fashionId,
          specifications: { 'Material': '100% Organic Cotton', 'Color': 'Red', 'Sleeve': 'Short Sleeve' }
        },
        {
          name: 'Unisex Cotton Pullover Hoodie',
          description: 'Premium heavyweight organic cotton fleece hoodie. Features a cozy brushed interior, adjustable drawstring hood, kangaroo front pocket, and ribbed cuffs. Ultra-soft feel.',
          price: 2499.00, discountPrice: 1999.00, brand: 'UrbanStyle', stock: 20,
          images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Material': '100% Organic Cotton', 'Style': 'Oversized Fit' }
        },
        {
          name: 'Polarized Retro Sunglasses',
          description: 'Classic vintage-style round sunglasses with polarized lenses. 100% UV400 protection. Durable lightweight acetate frame with reinforced metal hinges.',
          price: 1899.00, discountPrice: 1299.00, brand: 'UrbanStyle', stock: 15,
          images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.3, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Lens Protection': 'Polarized UV400', 'Frame Material': 'Acetate' }
        },
        {
          name: 'Slim Fit Stretch Denim Jeans',
          description: 'Classic slim fit denim jeans made of premium stretch cotton fabric. Comfortable for all-day wear with 5 functional pockets.',
          price: 2199.00, discountPrice: 1799.00, brand: 'DenimCo', stock: 25,
          images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Material': '98% Cotton, 2% Elastane', 'Fit': 'Slim Fit' }
        },
        {
          name: 'Moisture-Wicking Sports T-Shirt',
          description: 'Lightweight dry-fit athletic t-shirt. Breathable fabric pulls sweat away from your body to keep you cool and dry.',
          price: 999.00, discountPrice: 799.00, brand: 'AeroStride', stock: 40,
          images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.3, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Material': '100% Polyester', 'Fit': 'Athletic Fit' }
        },
        {
          name: 'Waterproof Hiking Backpack 35L',
          description: 'Spacious backpack with multi-compartments, dedicated laptop sleeve, secure zippers, and water-repellent coating.',
          price: 2799.00, discountPrice: 2299.00, brand: 'AeroStride', stock: 15,
          images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Capacity': '35 Liters', 'Material': 'Nylon' }
        },
        {
          name: 'Minimalist Metal Mesh Watch',
          description: 'Ultra-thin analog wristwatch with premium stainless steel mesh strap and scratch-resistant mineral glass.',
          price: 3999.00, discountPrice: 3499.00, brand: 'UrbanStyle', stock: 12,
          images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.7, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Strap': 'Mesh Metal', 'Waterproof': '30m' }
        },
        {
          name: 'Casual Canvas Sneakers',
          description: 'Classic low-top canvas shoes with durable rubber soles. Easy slip-on style suitable for casual hangouts.',
          price: 1499.00, discountPrice: 1199.00, brand: 'AeroStride', stock: 35,
          images: ['https://images.unsplash.com/photo-1525966222434-6ad5334a3588?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.2, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Sole': 'Rubber', 'Material': 'Canvas' }
        },
        {
          name: 'Soft Knitted Winter Beanie',
          description: 'Stretchable ribbed knit beanie cap. Warm acrylic material fits snugly to protect your head during winter.',
          price: 699.00, discountPrice: 499.00, brand: 'UrbanStyle', stock: 50,
          images: ['https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Material': '100% Acrylic Knit', 'Size': 'One Size Fits All' }
        },
        {
          name: 'Double-Breasted Trench Coat',
          description: 'Premium wool-blend long trench coat. Double-breasted closure, adjustable belt, and deep side pockets.',
          price: 7999.00, discountPrice: 6999.00, brand: 'VogueWear', stock: 8,
          images: ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.8, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Material': 'Wool-Polyester', 'Closure': 'Double-Breasted' }
        },
        {
          name: 'Lightweight Windbreaker Jacket',
          description: 'Water-resistant and windproof athletic jacket. Packs down small. Ideal for running, cycling, and hiking.',
          price: 2199.00, discountPrice: 1899.00, brand: 'AeroStride', stock: 20,
          images: ['https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Material': 'Nylon Shell', 'Waterproof': 'Yes' }
        },
        {
          name: 'Soft Fleece Lounge Joggers',
          description: 'Relaxed fit jogger pants with elastic drawstring waistband and ribbed ankle cuffs. Soft fleece inner lining.',
          price: 1299.00, discountPrice: 1099.00, brand: 'UrbanStyle', stock: 30,
          images: ['https://images.unsplash.com/photo-1551854838-212c50b4c184?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.3, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Material': 'Cotton Blend', 'Wash': 'Machine Wash' }
        },
        {
          name: 'Full-Grain Genuine Leather Belt',
          description: 'Classic formal/casual dress belt. Features solid brass buckle and hand-finished double-stitched leather strap.',
          price: 899.00, discountPrice: 699.00, brand: 'UrbanStyle', stock: 45,
          images: ['https://images.unsplash.com/photo-1624222247344-550fb8ecf73d?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Material': 'Full-Grain Leather', 'Width': '1.4 inches' }
        },
        {
          name: 'Athletic Running Socks (Pack of 3)',
          description: 'Breathable combed cotton socks with compressed arch support and padded heels. Keeps feet dry during runs.',
          price: 499.00, discountPrice: 399.00, brand: 'AeroStride', stock: 60,
          images: ['https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Quantity': '3 Pairs', 'Material': '80% Cotton, 20% Nylon' }
        },
        {
          name: 'Aviator Metal Frame Sunglasses',
          description: 'Timeless aviator styling with lightweight alloy frames and polarization gradient lenses. UV400 protection.',
          price: 1199.00, discountPrice: 999.00, brand: 'UrbanStyle', stock: 25,
          images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Frame': 'Alloy', 'Lenses': 'Polarized UV400' }
        },
        {
          name: 'Eco-Friendly Canvas Tote Bag',
          description: 'Heavy duty, reusable grocery/travel bag made from natural organic cotton canvas. Sturdy shoulder straps.',
          price: 399.00, discountPrice: 299.00, brand: 'UrbanStyle', stock: 100,
          images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Material': '12oz Canvas Cotton', 'Size': '15 x 16 inches' }
        },
        {
          name: 'Midi Floral Summer Dress',
          description: 'Flowy, lightweight linen summer dress with adjustable straps and front buttons. Cozy and stylish.',
          price: 1999.00, discountPrice: 1599.00, brand: 'VogueWear', stock: 12,
          images: ['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Material': 'Linen Blend', 'Length': 'Midi' }
        },
        {
          name: 'Soft EVA Cushion Slides',
          description: 'Thick compression-molded EVA slides. Ergonomic shape targets foot fatigue. Water-resistant and anti-slip.',
          price: 799.00, discountPrice: 599.00, brand: 'AeroStride', stock: 35,
          images: ['https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.3, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Material': 'EVA', 'Sole Thickness': '1.5 inches' }
        },
        {
          name: 'Classic Slim Fit Casual Blazer',
          description: 'Single-breasted stretch blazer with notch lapels, flap pockets, and inner lining. Ideal smart-casual addition.',
          price: 3499.00, discountPrice: 2999.00, brand: 'VogueWear', stock: 15,
          images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Material': 'Polyester-Viscose', 'Buttons': 'Two Button' }
        },

        // HOME & KITCHEN (20 items)
        {
          name: 'Designer Ceramic Coffee Mug Set',
          description: 'A set of 4 artisanal, double-walled matte ceramic coffee mugs. Keep your beverages hot for longer. Sleek, minimalist design that fits beautifully in any contemporary kitchen.',
          price: 1499.00, discountPrice: 999.00, brand: 'KitchenArt', stock: 50,
          images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Capacity': '350ml each', 'Material': 'High-Grade Ceramic', 'Microwave Safe': 'Yes' }
        },
        {
          name: 'Automatic Electric Kettle',
          description: 'Fast boiling 1.7L stainless steel kettle with cool-touch handle, auto shut-off, and boil-dry safety protection. Perfect for tea, coffee, and instant soups.',
          price: 2199.00, discountPrice: 1699.00, brand: 'KitchenArt', stock: 25,
          images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.7, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Capacity': '1.7 Liters', 'Power': '1500 Watts', 'Material': '304 Food-Grade Stainless Steel' }
        },
        {
          name: 'Indoor Succulent Ceramic Pots (Set of 3)',
          description: 'Artisanal modern terracotta/ceramic planters for mini succulents, cacti, or herbs. Features drainage holes and bamboo saucers to keep roots healthy.',
          price: 899.00, discountPrice: 699.00, brand: 'KitchenArt', stock: 35,
          images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Quantity': 'Set of 3 Pots', 'Pot Dimensions': '3.15 x 3.15 x 2.2 inches', 'Saucer Material': 'Natural Bamboo' }
        },
        {
          name: 'Non-Stick Cookware Set (5-Piece)',
          description: 'Heavy duty pressed aluminum cookware set. Includes fry pan, saucepan, kadhai with lid, and nylon spatula. Multi-layer non-stick coating.',
          price: 3499.00, discountPrice: 2999.00, brand: 'KitchenArt', stock: 15,
          images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Cookware': '5 Pieces', 'Induction Friendly': 'Yes' }
        },
        {
          name: 'Premium Chef Knife 8-inch',
          description: 'Ultra-sharp Japanese high-carbon stainless steel knife with ergonomic pakkawood handle. Engineered for slicing, dicing, and mincing.',
          price: 1299.00, discountPrice: 999.00, brand: 'KitchenArt', stock: 30,
          images: ['https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.8, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Blade': 'High-Carbon Steel', 'Handle': 'Pakkawood', 'Length': '8 Inches' }
        },
        {
          name: 'High-Speed Countertop Blender',
          description: 'Powerful 1000W professional blender. Features stainless steel crushing blades, variable speed dials, and a BPA-free 2.0L jar.',
          price: 4599.00, discountPrice: 3999.00, brand: 'KitchenArt', stock: 12,
          images: ['https://images.unsplash.com/photo-1578643463396-0997cb5328c1?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Power': '1000W', 'Jar Capacity': '2.0 Liters', 'Blades': '6 Stainless Steel' }
        },
        {
          name: 'Shredded Memory Foam Pillow',
          description: 'Adjustable, therapeutic memory foam sleeping pillow. Promotes optimal alignment for side, back, and stomach sleepers. Bamboo cover.',
          price: 1199.00, discountPrice: 899.00, brand: 'KitchenArt', stock: 40,
          images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Fill': 'Shredded Memory Foam', 'Cover': 'Bamboo Rayon' }
        },
        {
          name: 'Ultra-Soft Sherpa Throw Blanket',
          description: 'Cozy dual-sided plush throw blanket. Features silky flannel fleece on one side and warm fluffy sherpa lining on the other.',
          price: 1599.00, discountPrice: 1299.00, brand: 'KitchenArt', stock: 25,
          images: ['https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.7, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Size': '50 x 60 inches', 'Material': 'Microfiber Polyester' }
        },
        {
          name: 'LED Smart Table Lamp',
          description: 'Dimmable smart desk lamp. Touch control, adjustable brightness, multiple color temperatures, and built-in USB charging output.',
          price: 1999.00, discountPrice: 1499.00, brand: 'KitchenArt', stock: 30,
          images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Charging Port': 'USB Output', 'Color Modes': '5 Modes', 'LED Power': '10W' }
        },
        {
          name: 'Wall-Mounted Spice Rack Organizer',
          description: '3-tier heavy-duty metal spice organizer shelf. Holds jars, bottles, and canisters. Easy screw-in installation for kitchen walls.',
          price: 999.00, discountPrice: 799.00, brand: 'KitchenArt', stock: 50,
          images: ['https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Material': 'Powder-Coated Iron', 'Tiers': '3 Tiers' }
        },
        {
          name: 'Handwoven Cotton Doormat',
          description: 'Eco-friendly handwoven doormat. Made from natural recycled cotton yarns. Absorbs moisture and traps dirt easily.',
          price: 499.00, discountPrice: 349.00, brand: 'KitchenArt', stock: 70,
          images: ['https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.2, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Material': 'Recycled Cotton', 'Dimensions': '18 x 30 inches' }
        },
        {
          name: 'Digital Glass Kitchen Scale',
          description: 'Slim tempered glass kitchen food scale. Tares weight instantly. Measures in grams, ounces, milliliters, and pounds.',
          price: 799.00, discountPrice: 599.00, brand: 'KitchenArt', stock: 45,
          images: ['https://images.unsplash.com/photo-1594735803768-45198263773f?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Capacity': '5 kg Max', 'Precision': '1g Resolution', 'Battery': '2 AAA Included' }
        },
        {
          name: 'Double-Walled Insulated Flask 1L',
          description: 'Vacuum-insulated stainless steel flask. Keeps liquids piping hot for 18 hours or ice cold for 24 hours. Leak-proof cap.',
          price: 1199.00, discountPrice: 999.00, brand: 'KitchenArt', stock: 40,
          images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Capacity': '1.0 Liter', 'Material': 'Double-Wall Stainless Steel' }
        },
        {
          name: 'Floating Wooden Wall Shelves',
          description: 'Set of 3 rustic solid pine floating shelves with sturdy metal brackets. Perfect for displays, photos, and plants.',
          price: 1299.00, discountPrice: 999.00, brand: 'KitchenArt', stock: 25,
          images: ['https://images.unsplash.com/photo-1595514534835-248df967e885?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.7, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Quantity': 'Set of 3', 'Material': 'Solid Pine Wood' }
        },
        {
          name: 'Handheld Fabric Garment Steamer',
          description: 'Portable, quick-heating garment steamer. Unwrinkles shirts, drapes, and suits within minutes. Compact travel design.',
          price: 1999.00, discountPrice: 1599.00, brand: 'KitchenArt', stock: 20,
          images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.3, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Power': '800W', 'Heating Time': '30 Seconds', 'Water Capacity': '120ml' }
        },
        {
          name: 'Microfiber Floor Mop Set',
          description: 'Flat floor cleaning mop with a double-sided washable microfiber pad. 360° rotating head reaches narrow corners.',
          price: 999.00, discountPrice: 799.00, brand: 'KitchenArt', stock: 35,
          images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Mop Type': 'Flat Floor Mop', 'Handle Length': '125cm Extendable' }
        },
        {
          name: 'Airtight Food Storage Containers',
          description: 'Set of 6 plastic pantry canisters with easy lock airtight lids. Keeps flour, cereal, sugar, and dry goods fresh.',
          price: 1499.00, discountPrice: 1199.00, brand: 'KitchenArt', stock: 30,
          images: ['https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Quantity': '6 Containers', 'Material': 'BPA-Free Acrylic' }
        },
        {
          name: 'Modern Geometric Table Runner',
          description: 'Textured geometric pattern table runner. Woven cotton-polyester fabric protects and styling dining table setups.',
          price: 699.00, discountPrice: 499.00, brand: 'KitchenArt', stock: 45,
          images: ['https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.2, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Dimensions': '13 x 72 inches', 'Material': 'Cotton-Polyester' }
        },
        {
          name: 'Ceramic Essential Oil Diffuser',
          description: 'Artisanal stone ceramic ultrasonic cool-mist humidifier diffuser. Auto-shutoff timer and 7 soft LED ambient lights.',
          price: 1199.00, discountPrice: 899.00, brand: 'KitchenArt', stock: 28,
          images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Volume': '100ml', 'Mist Duration': '3 Hours Continuous' }
        },
        {
          name: 'Scented Soy Candles (Pack of 3)',
          description: 'Hand-poured 100% natural soy wax candles. Infused with Lavender, Vanilla, and Eucalyptus essential aromatherapy oils.',
          price: 799.00, discountPrice: 599.00, brand: 'KitchenArt', stock: 50,
          images: ['https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Count': '3 Candles', 'Burn Time': '25 Hours Each', 'Wax': '100% Soy Wax' }
        },

        // BOOKS (16 items)
        {
          name: 'Atomic Habits - James Clear',
          description: 'The instant New York Times bestseller. Tiny Changes, Remarkable Results. Learn the proven framework for self-improvement, breaking bad habits, and building good ones daily.',
          price: 799.00, discountPrice: 499.00, brand: 'Penguin Books', stock: 100,
          images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.9, reviewsCount: 0, isFeatured: true, categoryId: booksId,
          specifications: { 'Author': 'James Clear', 'Format': 'Paperback', 'Pages': '320', 'Language': 'English' }
        },
        {
          name: 'Deep Work - Cal Newport',
          description: 'Deep Work: Rules for Focused Success in a Distracted World. Renowned author Cal Newport explains how focusing without distraction allows you to quickly master complicated information and produce better results in less time.',
          price: 699.00, discountPrice: 425.00, brand: 'Penguin Books', stock: 60,
          images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.8, reviewsCount: 0, isFeatured: false, categoryId: booksId,
          specifications: { 'Author': 'Cal Newport', 'Publisher': 'Grand Central Publishing', 'Pages': '304' }
        },
        {
          name: 'Thinking, Fast and Slow - Daniel Kahneman',
          description: 'Daniel Kahneman, recipient of the Nobel Prize in Economic Sciences, takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think.',
          price: 899.00, discountPrice: 599.00, brand: 'Penguin Books', stock: 45,
          images: ['https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.9, reviewsCount: 0, isFeatured: false, categoryId: booksId,
          specifications: { 'Author': 'Daniel Kahneman', 'Publisher': 'Farrar, Straus and Giroux', 'Pages': '499' }
        },
        {
          name: 'The Silent Patient - Alex Michaelides',
          description: 'The Silent Patient is a shocking psychological thriller of a woman’s act of violence against her husband—and of the therapist obsessed with uncovering her motive.',
          price: 499.00, discountPrice: 399.00, brand: 'Penguin Books', stock: 35,
          images: ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: booksId,
          specifications: { 'Author': 'Alex Michaelides', 'Publisher': 'Celadon Books', 'Pages': '336' }
        },
        {
          name: 'Sapiens: A Brief History of Humankind',
          description: 'Dr. Yuval Noah Harari spans the whole of human history, from the very first humans to walk the earth to the radical breakthroughs of the Cognitive, Agricultural, and Scientific Revolutions.',
          price: 699.00, discountPrice: 499.00, brand: 'Penguin Books', stock: 55,
          images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.8, reviewsCount: 0, isFeatured: false, categoryId: booksId,
          specifications: { 'Author': 'Yuval Noah Harari', 'Publisher': 'Harper', 'Pages': '498' }
        },
        {
          name: 'Educated: A Memoir - Tara Westover',
          description: 'An unforgettable memoir about a young girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.',
          price: 599.00, discountPrice: 449.00, brand: 'Penguin Books', stock: 30,
          images: ['https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.7, reviewsCount: 0, isFeatured: false, categoryId: booksId,
          specifications: { 'Author': 'Tara Westover', 'Publisher': 'Random House', 'Pages': '352' }
        },
        {
          name: 'Zero to One - Peter Thiel',
          description: 'The next Bill Gates will not build an operating system. Thiel shows how to find singular ways to create those new things.',
          price: 499.00, discountPrice: 375.00, brand: 'Penguin Books', stock: 40,
          images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: booksId,
          specifications: { 'Author': 'Peter Thiel', 'Publisher': 'Crown Business', 'Pages': '224' }
        },
        {
          name: 'The Alchemist - Paulo Coelho',
          description: 'A magical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.',
          price: 399.00, discountPrice: 299.00, brand: 'Penguin Books', stock: 80,
          images: ['https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.8, reviewsCount: 0, isFeatured: false, categoryId: booksId,
          specifications: { 'Author': 'Paulo Coelho', 'Publisher': 'HarperOne', 'Pages': '163' }
        },
        {
          name: "Man's Search for Meaning",
          description: 'Psychiatrist Viktor Frankl’s memoir has officially become one of the most influential books in America. It struggles with survival in Auschwitz.',
          price: 399.00, discountPrice: 299.00, brand: 'Penguin Books', stock: 65,
          images: ['https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.9, reviewsCount: 0, isFeatured: false, categoryId: booksId,
          specifications: { 'Author': 'Viktor E. Frankl', 'Publisher': 'Beacon Press', 'Pages': '165' }
        },
        {
          name: 'Rich Dad Poor Dad - Robert Kiyosaki',
          description: 'Explodes the myth that you need to earn a high income to become rich and challenges the belief that your house is an asset.',
          price: 499.00, discountPrice: 349.00, brand: 'Penguin Books', stock: 90,
          images: ['https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: booksId,
          specifications: { 'Author': 'Robert T. Kiyosaki', 'Publisher': 'Warner Books', 'Pages': '336' }
        },
        {
          name: 'The Psychology of Money',
          description: 'Doing well with money isn’t necessarily about what you know. It’s about how you behave. And behavior is hard to teach.',
          price: 399.00, discountPrice: 275.00, brand: 'Penguin Books', stock: 100,
          images: ['https://images.unsplash.com/photo-1554907906-896cf4f2da46?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.9, reviewsCount: 0, isFeatured: false, categoryId: booksId,
          specifications: { 'Author': 'Morgan Housel', 'Publisher': 'Harriman House', 'Pages': '256' }
        },
        {
          name: 'Start with Why - Simon Sinek',
          description: 'Sinek starts with a fundamental question: Why are some people and organizations more innovative, more influential, and more profitable than others?',
          price: 599.00, discountPrice: 449.00, brand: 'Penguin Books', stock: 40,
          images: ['https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: booksId,
          specifications: { 'Author': 'Simon Sinek', 'Publisher': 'Portfolio', 'Pages': '256' }
        },
        {
          name: 'Clean Code - Robert C. Martin',
          description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees.',
          price: 2499.00, discountPrice: 1999.00, brand: 'Penguin Books', stock: 15,
          images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.8, reviewsCount: 0, isFeatured: false, categoryId: booksId,
          specifications: { 'Author': 'Robert C. Martin', 'Publisher': 'Prentice Hall', 'Pages': '464' }
        },
        {
          name: 'Introduction to Algorithms - CLRS',
          description: 'A comprehensive and detailed introduction to the modern study of computer algorithms.',
          price: 3999.00, discountPrice: 3499.00, brand: 'Penguin Books', stock: 10,
          images: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.9, reviewsCount: 0, isFeatured: false, categoryId: booksId,
          specifications: { 'Authors': 'Cormen, Leiserson, Rivest, Stein', 'Pages': '1312' }
        },
        {
          name: 'Designing Data-Intensive Applications',
          description: 'Want to know how the best engineering organizations build reliable, scalable, and maintainable systems? Martin Kleppmann shows you.',
          price: 1999.00, discountPrice: 1599.00, brand: 'Penguin Books', stock: 18,
          images: ['https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.9, reviewsCount: 0, isFeatured: false, categoryId: booksId,
          specifications: { 'Author': 'Martin Kleppmann', 'Publisher': "O'Reilly", 'Pages': '616' }
        },
        {
          name: 'Elon Musk - Walter Isaacson',
          description: 'The astonishingly intimate story of the most fascinating and controversial innovator of our era—a creative visionary.',
          price: 999.00, discountPrice: 799.00, brand: 'Penguin Books', stock: 35,
          images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.7, reviewsCount: 0, isFeatured: false, categoryId: booksId,
          specifications: { 'Author': 'Walter Isaacson', 'Publisher': 'Simon & Schuster', 'Pages': '688' }
        },

        // FOOD & GROCERIES (15 items)
        {
          name: 'Creamy Chocolate Chip Cookies',
          description: 'Freshly baked chocolate chip cookies. Features a crunchy exterior and a soft, chewy, chocolate-loaded core. Melt-in-your-mouth goodness.',
          price: 249.00, discountPrice: 199.00, brand: 'BakeFresh', stock: 100,
          images: ['https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.7, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Weight': '250g', 'Diet Type': 'Vegetarian', 'Shelf Life': '3 Months' }
        },
        {
          name: 'Organic Dark Chocolate Bar 70%',
          description: 'Rich dark chocolate crafted from single-origin organic cocoa beans. 70% dark cocoa content. Smooth texture with complex fruit notes.',
          price: 349.00, discountPrice: 299.00, brand: 'ChocoLuxe', stock: 80,
          images: ['https://images.unsplash.com/photo-1549007994-cb92ca87df46?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Cocoa Percentage': '70% Dark', 'Weight': '80g', 'Organic': 'USDA Certified' }
        },
        {
          name: 'Roasted Salted Cashew Nuts 250g',
          description: 'Premium whole cashews dry roasted to golden perfection and lightly dusted with sea salt. Packaged in a resealable bag to maintain crunch.',
          price: 599.00, discountPrice: 499.00, brand: 'NutriDay', stock: 40,
          images: ['https://images.unsplash.com/photo-1534149793915-d72b22ecf048?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Type': 'Cashews W240', 'Weight': '250g', 'Nutrient Profile': 'High Protein' }
        },
        {
          name: 'Premium Jasmine Green Tea Bags',
          description: 'Aromatic green tea leaves scented with natural jasmine blossoms. Individually wrapped tea bags preserve freshness and delicate fragrance.',
          price: 399.00, discountPrice: 349.00, brand: 'PureLeaf', stock: 50,
          images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Tea Type': 'Green Tea (Jasmine)', 'Pack Count': '25 Tea Bags', 'Brewing Time': '2-3 Mins' }
        },
        {
          name: 'Whole Bean Medium Roast Coffee',
          description: '100% Arabica coffee beans ethically sourced. Medium roasted to highlight notes of caramel and milk chocolate. Ideal for espresso or pour-over.',
          price: 699.00, discountPrice: 599.00, brand: 'CafeBlend', stock: 30,
          images: ['https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.8, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Bean Type': '100% Arabica', 'Roast Level': 'Medium', 'Weight': '500g' }
        },
        {
          name: 'Gourmet Potato Chips Sea Salt',
          description: 'Thinly sliced premium potatoes cooked in small batches and seasoned with natural sea salt. Crispy texture and authentic potato flavor.',
          price: 129.00, discountPrice: 99.00, brand: 'CrunchTime', stock: 120,
          images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.2, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Flavor': 'Sea Salt', 'Weight': '150g', 'Trans Fat': '0g' }
        },
        {
          name: 'Italian Penne Rigate Pasta',
          description: 'Authentic Italian durum wheat semolina pasta. Extruded through bronze dies for a rough surface that holds sauces perfectly.',
          price: 199.00, discountPrice: 149.00, brand: 'Pastificio', stock: 60,
          images: ['https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Shape': 'Penne Rigate', 'Cooking Time': '11 Mins Al Dente', 'Weight': '500g' }
        },
        {
          name: 'Extra Virgin Cold Pressed Olive Oil',
          description: 'First cold-pressed extra virgin olive oil. Delicate and balanced flavor profile, ideal for salad dressings, marinades, and low-heat cooking.',
          price: 999.00, discountPrice: 899.00, brand: 'Olife', stock: 35,
          images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.7, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Volume': '1 Liter', 'Extraction': 'Cold Pressed', 'Acidity': '< 0.8%' }
        },
        {
          name: 'Spicy Arrabbiata Pasta Sauce',
          description: 'Gourmet tomato pasta sauce cooked with fresh garlic, basil, and crushed red chili pepper flakes. No added preservatives or colors.',
          price: 249.00, discountPrice: 199.00, brand: 'ChefSpecial', stock: 40,
          images: ['https://images.unsplash.com/photo-1608797178974-15b35a61d121?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Spice Level': 'Spicy', 'Weight': '350g', 'Packaging': 'Glass Jar' }
        },
        {
          name: 'Rolled Oats Breakfast Porridge',
          description: '100% whole grain rolled oats. Rich in dietary fiber and beta-glucan to support heart health. Quick cooking, perfect for oatmeal or baking.',
          price: 299.00, discountPrice: 249.00, brand: 'HealthFirst', stock: 65,
          images: ['https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Grain Type': '100% Rolled Oats', 'Weight': '1 kg', 'Fiber Content': 'High Fiber' }
        },
        {
          name: 'Premium Long Grain Basmati Rice',
          description: 'Authentic aged Himalayan Basmati rice. Super long grains with rich aroma and fluffy, non-sticky texture after cooking.',
          price: 499.00, discountPrice: 399.00, brand: 'RoyalGrain', stock: 50,
          images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.8, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Rice Variety': 'Basmati (Aged 2 Years)', 'Weight': '1 kg', 'Grain Length': '> 8.2mm' }
        },
        {
          name: 'Raw Organic Forest Honey',
          description: 'Unfiltered, unpasteurized honey gathered from wild forest blossoms. Retains natural pollen, enzymes, and nutritional value.',
          price: 349.00, discountPrice: 299.00, brand: 'BeeWild', stock: 55,
          images: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.7, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Type': 'Wild Forest Honey', 'Weight': '250g', 'Purity': '100% Unprocessed' }
        },
        {
          name: 'Instant Veg Masala Cup Noodles',
          description: 'A quick and delicious noodle meal in a cup. Rich vegetable broth with a spicy Indian masala flavor, carrots, peas, and green onion bits.',
          price: 59.00, discountPrice: 49.00, brand: 'QuickMeal', stock: 150,
          images: ['https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.1, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Flavor': 'Spicy Masala', 'Net Weight': '70g', 'Preparation Time': '3 Mins' }
        },
        {
          name: 'Sparkling Lime & Lemon Soda',
          description: 'Refreshing carbonated water with natural lime and lemon juices. Low calorie, crisp taste with zero artificial sweeteners.',
          price: 99.00, discountPrice: 79.00, brand: 'Fizzy', stock: 80,
          images: ['https://images.unsplash.com/photo-1603396405373-41a56a64f896?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.3, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Flavor': 'Lime & Lemon', 'Volume': '330ml Can', 'Calories': '15 kcal' }
        },
        {
          name: 'Organic Apple Cider Vinegar',
          description: 'Raw apple cider vinegar with the "Mother". Made from organically grown cold-pressed apples. Unfiltered and unpasteurized.',
          price: 399.00, discountPrice: 349.00, brand: 'HealthFirst', stock: 45,
          images: ['https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Acidity': '5%', 'Volume': '500ml', 'Packaging': 'Glass Bottle' }
        },

        // PACKAGING & WRAPPERS (15 items)
        {
          name: 'Heavy Duty Bubble Wrap Roll',
          description: 'Premium cushioning bubble wrap roll. Durable 3/16 inch bubbles provide superior shock absorption for glassware and electronics during shipping.',
          price: 499.00, discountPrice: 399.00, brand: 'WrapSafe', stock: 40,
          images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Bubble Size': '3/16 inch', 'Dimensions': '12 inches x 50 feet', 'Perforated': 'Every 12 inches' }
        },
        {
          name: 'Eco-Friendly Brown Kraft Paper',
          description: '100% recycled brown kraft packing paper. Heavyweight, tear-resistant wrap suitable for packing shipping parcels, table covers, and art projects.',
          price: 349.00, discountPrice: 299.00, brand: 'EcoPack', stock: 50,
          images: ['https://images.unsplash.com/photo-1616047006788-b29c36c77f2c?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Paper Weight': '80 GSM', 'Dimensions': '18 inches x 100 feet', 'Biodegradable': 'Yes' }
        },
        {
          name: 'Glossy Gift Wrap Sheets (Set of 10)',
          description: 'A set of 10 beautiful, high-gloss wrapping paper sheets with geometric and floral patterns. Features grid lines on back for easy cutting.',
          price: 199.00, discountPrice: 149.00, brand: 'DecoWrap', stock: 120,
          images: ['https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Quantity': '10 Sheets', 'Sheet Size': '20 x 28 inches', 'Material': 'Glossy Art Paper' }
        },
        {
          name: 'Heavy-Duty Industrial Stretch Film',
          description: 'Strong, stretchable shrink wrap film roll with double-handles. Self-adhering plastic stretch wraps secure moving boxes and pallets.',
          price: 599.00, discountPrice: 499.00, brand: 'PackStrong', stock: 25,
          images: ['https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Thickness': '80 Gauge', 'Dimensions': '18 inches x 1000 feet', 'Type': 'Cast Stretch Film' }
        },
        {
          name: 'Food Grade Aluminum Foil Roll',
          description: 'High quality kitchen aluminum foil roll. Extra thick, non-stick wrap keeps baked meals fresh, locking in heat and moisture.',
          price: 299.00, discountPrice: 249.00, brand: 'FreshLock', stock: 65,
          images: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Thickness': '18 Microns', 'Dimensions': '12 inches x 25 meters', 'Non-Stick': 'Yes' }
        },
        {
          name: 'Non-Stick Baking Parchment Paper',
          description: 'Silicone coated greaseproof parchment paper roll. Heat resistant up to 230°C. Prevents cookies and cakes from sticking to baking trays.',
          price: 249.00, discountPrice: 199.00, brand: 'BakeFresh', stock: 70,
          images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.7, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Coating': 'Double-Sided Silicone', 'Dimensions': '12 inches x 20 meters', 'Microwave Safe': 'Yes' }
        },
        {
          name: 'Clear Plastic Cling Wrap Film',
          description: 'Airtight food cling film wrap with easy slider cutter. Clings tightly to bowls, plates, and produce to preserve food freshness.',
          price: 159.00, discountPrice: 129.00, brand: 'FreshLock', stock: 80,
          images: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Material': 'Food-Grade PVC', 'Dimensions': '12 inches x 30 meters', 'Cutter': 'Slide Cutter Included' }
        },
        {
          name: 'Double-Sided Adhesive Foam Tape',
          description: 'Strong mounting tape with double-sided adhesive foam backing. Perfect for wrapping packages securely and home mounting.',
          price: 129.00, discountPrice: 99.00, brand: 'GripFast', stock: 90,
          images: ['https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.3, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Width': '1 inch', 'Length': '5 meters', 'Adhesive': 'Acrylic Foam' }
        },
        {
          name: 'Biodegradable Starch Packing Peanuts',
          description: 'Cornstarch-based eco-friendly packaging peanuts. Dissolves in water. Offers shock protection inside shipping boxes.',
          price: 399.00, discountPrice: 349.00, brand: 'EcoPack', stock: 40,
          images: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Material': '100% Cornstarch', 'Volume': '1 Cubic Foot', 'Soluble': 'Yes' }
        },
        {
          name: 'Corrugated Cardboard Boxes (Pack of 5)',
          description: 'Heavy duty, dual-walled corrugated shipping boxes. High crush resistance, flat-packed for easy storage.',
          price: 599.00, discountPrice: 499.00, brand: 'PackStrong', stock: 50,
          images: ['https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.7, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Quantity': '5 Boxes', 'Dimensions': '12 x 10 x 8 inches', 'Type': 'Double-Wall Corrugated' }
        },
        {
          name: 'Self-Sealing Poly Mailers (Set of 50)',
          description: 'Durable, waterproof white poly mailing bags. Feature a strong self-adhesive peel-and-seal strip and tear-resistant shell.',
          price: 349.00, discountPrice: 299.00, brand: 'PackStrong', stock: 110,
          images: ['https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Quantity': '50 Envelopes', 'Dimensions': '10 x 13 inches', 'Waterproof': 'Yes' }
        },
        {
          name: 'Fragile Warning Packaging Tape',
          description: 'Heavy-duty warning packing tape with bold red "FRAGILE - HANDLE WITH CARE" text. Strong hot melt adhesive.',
          price: 199.00, discountPrice: 149.00, brand: 'WrapSafe', stock: 65,
          images: ['https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Width': '2 inches', 'Length': '50 meters', 'Adhesive': 'Hot Melt Acrylic' }
        },
        {
          name: 'Colorful Tissue Paper Sheets (Set of 30)',
          description: 'Set of 30 rainbow tissue paper sheets for wrapping gifts, lining boxes, and decorative art crafts.',
          price: 129.00, discountPrice: 99.00, brand: 'DecoWrap', stock: 150,
          images: ['https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Quantity': '30 Sheets (10 Colors)', 'Sheet Size': '20 x 26 inches' }
        },
        {
          name: 'Gift Ribbons & Pull Bows Set',
          description: 'Premium collection of wrapping ribbons and pull bows. Includes 4 metallic ribbon rolls and 20 assorted quick-forming bows.',
          price: 159.00, discountPrice: 129.00, brand: 'DecoWrap', stock: 85,
          images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Ribbon Length': '10 meters each', 'Bows Count': '20 Bows', 'Colors': 'Gold, Silver, Red, Blue' }
        },
        {
          name: 'Reusable Cotton Produce Bags',
          description: 'Set of 6 organic cotton mesh drawstring produce bags. Washable and breathable. Replaces plastic shopping bags.',
          price: 349.00, discountPrice: 299.00, brand: 'EcoPack', stock: 40,
          images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Quantity': 'Set of 6', 'Material': '100% Organic Mesh Cotton', 'Sizes': '2 Small, 2 Medium, 2 Large' }
        },
        // ADDITIONAL PRODUCTS - ELECTRONICS (5 items)
        {
          name: 'USB-C Premium Braided Cable (2-Pack)',
          description: 'Durable nylon-braided USB-C to USB-C charging cables. Supports power delivery up to 60W and high-speed data sync.',
          price: 699.00, discountPrice: 499.00, brand: 'FitTech', stock: 50,
          images: ['https://images.unsplash.com/photo-1580983231454-e0eb3e1a0670?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Length': '6.6 Feet', 'Quantity': '2 Cables', 'Material': 'Braided Nylon' }
        },
        {
          name: 'Universal Travel Adapter',
          description: 'All-in-one international wall charger adapter. Fits outlets in 150+ countries. Features multiple USB and Type-C outputs.',
          price: 999.00, discountPrice: 799.00, brand: 'FitTech', stock: 40,
          images: ['https://images.unsplash.com/photo-1601524909162-be87252be298?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Outlets': '4 USB + 1 Type-C', 'Compatibility': 'US/EU/UK/AU', 'Max Load': '1500W' }
        },
        {
          name: 'Compact Portable Laptop Charger',
          description: 'Ultra-slim 65W power delivery charger. Pocket-sized design suitable for fast-charging compatible laptops, tablets, and phones.',
          price: 2499.00, discountPrice: 1999.00, brand: 'FitTech', stock: 30,
          images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.7, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Power': '65W Power Delivery', 'Output Ports': '2 Type-C, 1 USB-A' }
        },
        {
          name: 'Bluetooth Sleep Eye Mask Headphones',
          description: 'Cozy padded sleeping eye mask with built-in thin HD stereo speakers. Block out ambient light and noise for restful sleep.',
          price: 1499.00, discountPrice: 1199.00, brand: 'SoundMaster', stock: 25,
          images: ['https://images.unsplash.com/photo-1563861826100-9cb868fdcd1d?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Bluetooth': '5.0', 'Playtime': '10 Hours', 'Material': 'Memory Foam & Cotton' }
        },
        {
          name: 'Mini Table USB Fan',
          description: 'Sleek, lightweight USB desk fan with 3 speeds and adjustable rotation. Ultra-quiet operation makes it perfect for study and office.',
          price: 799.00, discountPrice: 599.00, brand: 'FitTech', stock: 45,
          images: ['https://images.unsplash.com/photo-1619241696013-eb1c6bc1b126?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.3, reviewsCount: 0, isFeatured: false, categoryId: electronicsId,
          specifications: { 'Power Source': 'USB Powered', 'Speeds': '3 Speeds', 'Rotation': '360 Degrees' }
        },
        // ADDITIONAL PRODUCTS - FASHION (5 items)
        {
          name: 'Athletic Quick-Dry Gym Shorts',
          description: 'Lightweight active wear shorts with zip pockets and breathable fabric. Features comfortable elastic waistband with internal drawcord.',
          price: 899.00, discountPrice: 699.00, brand: 'AeroStride', stock: 35,
          images: ['https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Material': '95% Polyester, 5% Spandex', 'Fit': 'Active Fit' }
        },
        {
          name: 'Waterproof Sports Wristband',
          description: 'Premium soft silicone wrist strap compatible with smartwatches. Sweat-proof, waterproof, and extremely comfortable for fitness exercises.',
          price: 499.00, discountPrice: 349.00, brand: 'AeroStride', stock: 60,
          images: ['https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Material': 'Silicone', 'Waterproof': 'Yes (IP67)' }
        },
        {
          name: 'Classic Wool Scarf',
          description: 'Luxurious and warm knitted scarf made from pure merino wool. Keeps you stylishly warm through cold autumn and winter days.',
          price: 1199.00, discountPrice: 899.00, brand: 'UrbanStyle', stock: 30,
          images: ['https://images.unsplash.com/photo-1520903074187-fc58d41df36d?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Material': '100% Merino Wool', 'Dimensions': '70 x 12 inches' }
        },
        {
          name: 'Unisex Slip-On Canvas Loafers',
          description: 'Easy slip-on canvas shoes with breathable lining and memory foam insoles. Vulcanized non-slip rubber soles offer stable grip.',
          price: 1799.00, discountPrice: 1399.00, brand: 'AeroStride', stock: 40,
          images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.3, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Closure': 'Slip-On', 'Material': 'Canvas', 'Sole': 'Rubber' }
        },
        {
          name: 'Lightweight Running Cap',
          description: 'Breathable sports cap with sweat-wicking band and mesh side panels. Adjustable strap fits all head sizes securely.',
          price: 599.00, discountPrice: 449.00, brand: 'AeroStride', stock: 50,
          images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: fashionId,
          specifications: { 'Material': 'Quick-Dry Polyester', 'Sun Protection': 'UPF 50+' }
        },
        // ADDITIONAL PRODUCTS - HOME & KITCHEN (5 items)
        {
          name: 'Minimalist Glass Water Carafe',
          description: 'Sleek borosilicate glass pitcher with stainless steel filter lid. Beautiful container for hot and cold beverages like tea, juice, and water.',
          price: 899.00, discountPrice: 699.00, brand: 'KitchenArt', stock: 35,
          images: ['https://images.unsplash.com/photo-1613274554329-70f997f5789f?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Capacity': '1.2 Liters', 'Material': 'Borosilicate Glass', 'Lid': 'Stainless Steel' }
        },
        {
          name: 'Silicone Kitchen Cooking Utensils',
          description: '8-piece non-scratch silicone cooking utensils set with natural wooden handles. Heat-resistant up to 230°C. Sturdy and elegant.',
          price: 1499.00, discountPrice: 1199.00, brand: 'KitchenArt', stock: 40,
          images: ['https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.7, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Quantity': '8 Pieces', 'Material': 'Silicone & Wood', 'Heat Resistance': 'Up to 230°C' }
        },
        {
          name: 'Aromatherapy Scented Reed Diffuser',
          description: 'Natural aromatherapy essential oil diffuser set with fiber sticks. Long-lasting scent releases a soothing french lavender fragrance.',
          price: 699.00, discountPrice: 499.00, brand: 'KitchenArt', stock: 55,
          images: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Volume': '150ml', 'Fragrance': 'French Lavender', 'Lasts': 'Up to 60 Days' }
        },
        {
          name: 'Anti-Fatigue Kitchen Rug Mat',
          description: 'Ergonomic thick cushioned foam floor mat. Provides support for knees and ankles, perfect for standing desk and kitchen cooking.',
          price: 1299.00, discountPrice: 999.00, brand: 'KitchenArt', stock: 30,
          images: ['https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Dimensions': '17 x 29 inches', 'Thickness': '0.47 inches', 'Material': 'Phthalate-free PVC' }
        },
        {
          name: 'Ceramic Flower Vase (Set of 2)',
          description: 'Two modern off-white ceramic vases with textured ribbed finishes. Enhances tabletop decor for weddings, bookshelves, and mantels.',
          price: 999.00, discountPrice: 799.00, brand: 'KitchenArt', stock: 28,
          images: ['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: homeId,
          specifications: { 'Quantity': 'Set of 2 Vases', 'Heights': '8 inches & 6 inches', 'Finish': 'Glazed Matte' }
        },
        // ADDITIONAL PRODUCTS - FOOD & GROCERIES (5 items)
        {
          name: 'Organic Granola Bars (Pack of 6)',
          description: 'USDA certified organic honey oat granola bars. Packed with rolled oats, crisp grains, and honey. Healthy snacking on-the-go.',
          price: 299.00, discountPrice: 249.00, brand: 'NutriDay', stock: 90,
          images: ['https://images.unsplash.com/photo-1568254183919-78a4f43a2877?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Quantity': '6 Bars', 'Weight': '240g Total', 'Organic': 'USDA Certified' }
        },
        {
          name: 'Roasted Almonds (Smoked BBQ)',
          description: 'Crunchy whole almonds slow roasted and seasoned with rich, smoky BBQ spices. Great source of fiber and energy.',
          price: 449.00, discountPrice: 399.00, brand: 'NutriDay', stock: 65,
          images: ['https://images.unsplash.com/photo-1590004953392-5aba2e72269a?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Flavor': 'Smoked BBQ', 'Weight': '200g', 'Nutrient Profile': 'High Protein & Fiber' }
        },
        {
          name: 'Sparkling Coconut Water',
          description: 'Refreshing organic coconut water with soft carbonation. Made from young green coconuts with no added sugars or preservatives.',
          price: 129.00, discountPrice: 99.00, brand: 'Fizzy', stock: 80,
          images: ['https://images.unsplash.com/photo-1543362906-acfc16c67564?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Flavor': 'Natural Coconut', 'Volume': '330ml Can', 'Calories': '45 kcal' }
        },
        {
          name: 'Gluten-Free Quinoa Pasta',
          description: 'Healthy and delicious quinoa flour fusilli pasta. Ideal choice for gluten-sensitive diets. Cook with fresh basil pesto or tomato sauce.',
          price: 249.00, discountPrice: 199.00, brand: 'Pastificio', stock: 50,
          images: ['https://images.unsplash.com/photo-1621961424579-f60148bfa019?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Shape': 'Fusilli', 'Cooking Time': '9 Mins', 'Weight': '400g' }
        },
        {
          name: 'Pure Organic Maple Syrup',
          description: '100% pure Grade A Canadian maple syrup. Free from artificial colors or corn syrup. Perfect for pancakes, waffles, and baking.',
          price: 799.00, discountPrice: 699.00, brand: 'ChefSpecial', stock: 35,
          images: ['https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.8, reviewsCount: 0, isFeatured: false, categoryId: foodId,
          specifications: { 'Grade': 'Grade A Amber', 'Volume': '250ml', 'Purity': '100% Pure' }
        },
        // ADDITIONAL PRODUCTS - PACKAGING & WRAPPERS (5 items)
        {
          name: 'Kraft Cardboard Mailing Tubes',
          description: 'Pack of 3 heavy-duty spiral-wound mailing tubes. Perfect for mailing posters, blueprints, art prints, and maps safely.',
          price: 249.00, discountPrice: 199.00, brand: 'PackStrong', stock: 45,
          images: ['https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.5, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Quantity': '3 Tubes', 'Dimensions': '3 x 24 inches', 'End Caps': 'White Plastic Caps Included' }
        },
        {
          name: 'Self-Adhesive Bubble Mailers',
          description: 'Set of 20 secure self-sealing bubble-padded mailing envelopes. Lightweight poly material keeps shipping costs low.',
          price: 399.00, discountPrice: 329.00, brand: 'WrapSafe', stock: 75,
          images: ['https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Quantity': '20 Mailers', 'Dimensions': '6 x 10 inches', 'Closure': 'Self-Sealing Peel & Stick' }
        },
        {
          name: 'Colored Shredded Paper Fill',
          description: '500g bag of eco-friendly shredded kraft paper. Ideal cushioning and presentation fill for gift boxes and Easter baskets.',
          price: 199.00, discountPrice: 159.00, brand: 'DecoWrap', stock: 100,
          images: ['https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Weight': '500g', 'Color': 'Kraft Brown', 'Material': '100% Recycled Paper' }
        },
        {
          name: 'Customizable Kraft Gift Bags',
          description: 'Pack of 12 elegant matte brown Kraft paper gift bags with sturdy twisted cotton rope handles. Perfect for birthdays and events.',
          price: 349.00, discountPrice: 299.00, brand: 'DecoWrap', stock: 90,
          images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.6, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Quantity': '12 Bags', 'Dimensions': '8 x 4.75 x 10.5 inches', 'Handles': 'Cotton Rope' }
        },
        {
          name: 'Clear Zip-Lock Poly Bags',
          description: 'Set of 100 high-clarity reclosable zip plastic bags. Excellent for sorting jewelry, small parts, and crafting supplies.',
          price: 149.00, discountPrice: 119.00, brand: 'PackStrong', stock: 150,
          images: ['https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&q=80&w=600'],
          ratings: 4.4, reviewsCount: 0, isFeatured: false, categoryId: packagingId,
          specifications: { 'Quantity': '100 Bags', 'Dimensions': '4 x 6 inches', 'Thickness': '2 Mil' }
        }
      ];

      await Product.bulkCreate(productsList);
      console.log('Products (132 items) seeded successfully.');
    }

    // 3. Seed Coupons
    const couponsCount = await Coupon.count();
    if (couponsCount === 0) {
      console.log('Seeding initial coupons...');
      await Coupon.bulkCreate([
        {
          code: 'WELCOME10',
          discountType: 'percentage',
          discountAmount: 10.00,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          minOrderAmount: 499.00,
          isActive: true,
        },
        {
          code: 'FLAT500',
          discountType: 'fixed',
          discountAmount: 500.00,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          minOrderAmount: 2499.00,
          isActive: true,
        },
      ]);
      console.log('Coupons seeded successfully.');
    }

    // 4. Seed Users (Demo Admin and Demo User)
    const adminExists = await User.findOne({ where: { email: 'aksharjain034@gmail.com' } });
    if (!adminExists) {
      console.log('Seeding demo admin and user...');
      const adminPassword = await bcrypt.hash('admin123', 10);
      const userPassword = await bcrypt.hash('user123', 10);

      const adminUser = await User.create({
        name: 'Demo Admin',
        email: 'aksharjain034@gmail.com',
        password: adminPassword,
        role: 'admin',
        isVerified: true,
      });
      await Cart.create({ userId: adminUser.id, items: [] });

      const regularUser = await User.create({
        name: 'Demo Customer',
        email: 'user@shopyzone.com',
        password: userPassword,
        role: 'user',
        isVerified: true,
      });
      await Cart.create({ userId: regularUser.id, items: [] });

      // Seed one review to first product from user
      const prod = await Product.findOne();
      if (prod) {
        await User.findOne({ where: { email: 'user@shopyzone.com' } }).then(async (u) => {
          await sequelize.models.Review.create({
            userId: u.id,
            productId: prod.id,
            rating: 5,
            comment: 'Absolutely love these headphones! Sound quality is top-notch and noise cancelling works perfectly.'
          });
        });
      }

      console.log('Demo accounts seeded successfully.');
      console.log('Admin Account -> Email: aksharjain034@gmail.com | Password: admin123');
      console.log('User Account  -> Email: user@shopyzone.com  | Password: user123');
    }

  } catch (error) {
    console.error('Seeding database failed:', error.message);
  }
};

// Start Server and Sync DB
const startServer = async () => {
  try {
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');

    // Seed data
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
