const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/amazon_products');
    console.log('✅ MongoDB connected (product-service)');
    await seedProducts();
  } catch (err) {
    console.error('MongoDB error:', err.message);
    setTimeout(connectDB, 5000);
  }
};
connectDB();

// ─── Schemas ───────────────────────────────────────────────────
const reviewSchema = new mongoose.Schema({
  userId: String, userName: String,
  rating: { type: Number, min: 1, max: 5 },
  comment: String, createdAt: { type: Date, default: Date.now },
});
const productSchema = new mongoose.Schema({
  title: { type: String, required: true, index: true },
  description: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  category: { type: String, required: true, index: true },
  brand: String,
  images: [String],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  stock: { type: Number, default: 100 },
  tags: [String],
  features: [String],
  reviews: [reviewSchema],
  isFeatured: { type: Boolean, default: false },
  badge: String,
}, { timestamps: true });

productSchema.index({ title: 'text', description: 'text', brand: 'text' });
const Product = mongoose.model('Product', productSchema);

// ─── Seed Data ─────────────────────────────────────────────────
async function seedProducts() {
  const count = await Product.countDocuments();
  if (count > 0) return;
  const products = [
    { title: 'Apple MacBook Pro 14"', description: 'Supercharged by M3 Pro or M3 Max chip, the MacBook Pro delivers exceptional performance.', price: 1999, originalPrice: 2199, category: 'Electronics', brand: 'Apple', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'], rating: 4.8, numReviews: 2847, stock: 50, tags: ['laptop', 'apple', 'macbook'], features: ['M3 Pro chip', '18GB RAM', '512GB SSD', '14-inch Liquid Retina XDR'], isFeatured: true, badge: 'Best Seller' },
    { title: 'Sony WH-1000XM5 Headphones', description: 'Industry-leading noise canceling with Auto NC Optimizer. Exceptional sound quality.', price: 279, originalPrice: 349, category: 'Electronics', brand: 'Sony', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'], rating: 4.7, numReviews: 15832, stock: 200, tags: ['headphones', 'wireless', 'noise-canceling'], features: ['30hr battery', 'Multipoint connection', 'LDAC codec', 'Speak-to-Chat'], isFeatured: true, badge: "Amazon's Choice" },
    { title: 'Samsung 65" QLED 4K TV', description: 'Quantum HDR, Quantum Processor 4K, Neo QLED gaming capabilities with 120Hz.', price: 1299, originalPrice: 1799, category: 'Electronics', brand: 'Samsung', images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600'], rating: 4.6, numReviews: 4201, stock: 30, tags: ['tv', 'samsung', '4k', 'qled'], features: ['4K QLED', '120Hz', 'Smart TV', 'HDR10+'], isFeatured: true },
    { title: 'iPhone 15 Pro Max', description: 'A17 Pro chip. A monster win for gaming. Titanium design. 48MP Main camera.', price: 1199, originalPrice: 1199, category: 'Electronics', brand: 'Apple', images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600'], rating: 4.9, numReviews: 8923, stock: 75, tags: ['iphone', 'apple', 'smartphone'], features: ['A17 Pro chip', '48MP camera', 'Titanium design', 'USB 3 speed'], badge: 'New' },
    { title: 'Kindle Paperwhite', description: 'The thinnest, lightest Paperwhite ever. 3 months of battery life. Waterproof.', price: 139, originalPrice: 159, category: 'Electronics', brand: 'Amazon', images: ['https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?w=600'], rating: 4.7, numReviews: 34521, stock: 500, tags: ['kindle', 'ebook', 'reader'], features: ['6.8" display', 'Adjustable warm light', 'Waterproof IPX8', '3 months battery'], badge: 'Best Seller' },
    { title: 'Nike Air Max 270', description: 'Inspired by two icons of Air, the Nike Air Max 270 delivers a super-soft ride.', price: 150, originalPrice: 150, category: 'Clothing', brand: 'Nike', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'], rating: 4.5, numReviews: 12045, stock: 150, tags: ['shoes', 'nike', 'sneakers'], features: ['Air Max 270 unit', 'Foam midsole', 'Rubber waffle outsole'] },
    { title: 'Levi\'s 501 Original Jeans', description: 'The original straight fit jean. The most famous and recognizable jeans in the world.', price: 59, originalPrice: 79, category: 'Clothing', brand: "Levi's", images: ['https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600'], rating: 4.4, numReviews: 22103, stock: 300, tags: ['jeans', 'levis', 'denim'] },
    { title: 'Instant Pot Duo 7-in-1', description: 'Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer.', price: 79, originalPrice: 99, category: 'Home & Kitchen', brand: 'Instant Pot', images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=600'], rating: 4.7, numReviews: 89234, stock: 250, tags: ['kitchen', 'cooking', 'instant-pot'], features: ['7-in-1 multi-use', '6 Quart', '14 one-touch programs', 'Stainless steel inner pot'], badge: 'Best Seller' },
    { title: 'Dyson V15 Detect Vacuum', description: 'Laser reveals microscopic dust on hard floors. Hair screw tool auto-removes hair.', price: 749, originalPrice: 899, category: 'Home & Kitchen', brand: 'Dyson', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], rating: 4.6, numReviews: 5621, stock: 45, tags: ['vacuum', 'dyson', 'cordless'], features: ['Laser dust detection', '60min battery', 'Anti-tangle tech', 'LCD screen'], badge: "Editor's Choice" },
    { title: 'The Pragmatic Programmer', description: 'Your journey to mastery. 20th Anniversary Edition. A timeless guide for developers.', price: 49, originalPrice: 59, category: 'Books', brand: 'Addison-Wesley', images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600'], rating: 4.8, numReviews: 3421, stock: 1000, tags: ['books', 'programming', 'software'] },
    { title: 'Atomic Habits', description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones by James Clear.', price: 16, originalPrice: 27, category: 'Books', brand: 'Avery', images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600'], rating: 4.9, numReviews: 98234, stock: 2000, tags: ['books', 'habits', 'self-help'], badge: '#1 Best Seller' },
    { title: 'Whey Protein Powder', description: 'Gold Standard 100% Whey Protein. 24g of protein per serving. Multiple flavors.', price: 54, originalPrice: 79, category: 'Sports', brand: 'Optimum Nutrition', images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600'], rating: 4.7, numReviews: 45123, stock: 500, tags: ['protein', 'sports', 'nutrition'], badge: 'Best Seller' },
    { title: 'Yoga Mat Premium', description: 'Extra thick 1/3" yoga mat with alignment lines. Non-slip textured surface.', price: 82, originalPrice: 110, category: 'Sports', brand: 'Liforme', images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600'], rating: 4.8, numReviews: 8932, stock: 200, tags: ['yoga', 'fitness', 'mat'] },
    { title: 'LEGO Technic Bugatti Chiron', description: 'Build an authentic recreation of the Bugatti Chiron with working parts.', price: 349, originalPrice: 449, category: 'Toys', brand: 'LEGO', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600'], rating: 4.9, numReviews: 2341, stock: 80, tags: ['lego', 'toys', 'technic'], badge: "Editor's Pick" },
    { title: 'Coffee Maker 12-Cup', description: 'Programmable coffee maker with thermal carafe. Brew strength control.', price: 89, originalPrice: 119, category: 'Home & Kitchen', brand: 'Cuisinart', images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600'], rating: 4.5, numReviews: 18234, stock: 175, tags: ['coffee', 'kitchen', 'brewing'] },
    { title: 'Gaming Chair Ergonomic', description: 'Racing style gaming chair with lumbar support, adjustable armrests, and reclining.', price: 299, originalPrice: 399, category: 'Electronics', brand: 'Secretlab', images: ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600'], rating: 4.6, numReviews: 7823, stock: 60, tags: ['gaming', 'chair', 'ergonomic'] },
  ];
  await Product.insertMany(products);
  console.log('✅ Products seeded');
}

// ─── Routes ───────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'product-service' }));

app.get('/api/products', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, minPrice, maxPrice, sort, brand } = req.query;
    const query = {};
    if (category && category !== 'All') query.category = category;
    if (brand) query.brand = brand;
    if (minPrice || maxPrice) query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { rating: -1 };
    else if (sort === 'popular') sortObj = { numReviews: -1 };
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortObj).skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) return res.json({ products: [] });
    const products = await Product.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ]
    }).limit(parseInt(limit));
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(['All', ...categories]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const { rating, comment } = req.body;
    const userId = req.headers['x-user-id'];
    const userName = req.headers['x-user-name'] || 'Anonymous';
    product.reviews.push({ userId, userName, rating, comment });
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((a, r) => a + r.rating, 0) / product.numReviews;
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`🚀 Product Service running on port ${PORT}`));
