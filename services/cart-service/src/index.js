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
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/amazon_carts');
    console.log('✅ MongoDB connected (cart-service)');
  } catch (err) {
    console.error('MongoDB error:', err.message);
    setTimeout(connectDB, 5000);
  }
};
connectDB();

// ─── Schema ────────────────────────────────────────────────────
const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  title: String, price: Number, image: String,
  quantity: { type: Number, default: 1, min: 1 },
});
const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [cartItemSchema],
  updatedAt: { type: Date, default: Date.now },
});
const Cart = mongoose.model('Cart', cartSchema);

// ─── Routes ───────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'cart-service' }));

app.get('/api/cart', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = { userId, items: [], total: 0 };
    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({ ...cart.toObject ? cart.toObject() : cart, total: Math.round(total * 100) / 100 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cart/items', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { productId, title, price, image, quantity = 1 } = req.body;
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });
    const existing = cart.items.find(i => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ productId, title, price, image, quantity });
    }
    cart.updatedAt = new Date();
    await cart.save();
    const total = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.json({ ...cart.toObject(), total: Math.round(total * 100) / 100 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cart/items/:productId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { quantity } = req.body;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    const item = cart.items.find(i => i.productId === req.params.productId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    item.quantity = quantity;
    cart.updatedAt = new Date();
    await cart.save();
    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({ ...cart.toObject(), total: Math.round(total * 100) / 100 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cart/items/:productId', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    cart.items = cart.items.filter(i => i.productId !== req.params.productId);
    await cart.save();
    const total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({ ...cart.toObject(), total: Math.round(total * 100) / 100 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cart', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    await Cart.findOneAndUpdate({ userId }, { items: [] });
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`🚀 Cart Service running on port ${PORT}`));
