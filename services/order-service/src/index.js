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
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/amazon_orders');
    console.log('✅ MongoDB connected (order-service)');
  } catch (err) {
    console.error('MongoDB error:', err.message);
    setTimeout(connectDB, 5000);
  }
};
connectDB();

// ─── RabbitMQ Publisher ────────────────────────────────────────
let channel;
const connectRabbitMQ = async () => {
  try {
    const amqplib = require('amqplib');
    const conn = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await conn.createChannel();
    await channel.assertQueue('order_events', { durable: true });
    console.log('✅ RabbitMQ connected (order-service)');
  } catch (err) {
    console.log('⚠️  RabbitMQ not available:', err.message);
    setTimeout(connectRabbitMQ, 5000);
  }
};
connectRabbitMQ();

const publishEvent = (event, data) => {
  if (channel) {
    channel.sendToQueue('order_events', Buffer.from(JSON.stringify({ event, data, timestamp: new Date() })), { persistent: true });
  }
};

// ─── Schema ────────────────────────────────────────────────────
const orderItemSchema = new mongoose.Schema({
  productId: String, title: String, price: Number, image: String, quantity: Number,
});
const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  items: [orderItemSchema],
  subtotal: Number,
  tax: Number,
  shipping: Number,
  total: Number,
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  shippingAddress: {
    name: String, line1: String, line2: String,
    city: String, state: String, zip: String, country: String,
  },
  paymentMethod: { type: String, default: 'card' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'paid' },
  trackingNumber: String,
  estimatedDelivery: Date,
  notes: String,
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// ─── Routes ───────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'order-service' }));

app.post('/api/orders', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: 'No items in order' });
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const shipping = subtotal > 35 ? 0 : 4.99;
    const total = Math.round((subtotal + tax + shipping) * 100) / 100;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.floor(Math.random() * 5) + 3);
    const order = await Order.create({
      userId, items, subtotal: Math.round(subtotal * 100) / 100,
      tax, shipping, total, shippingAddress, paymentMethod,
      trackingNumber: `AMZ${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      estimatedDelivery,
    });
    // Simulate order confirmation after 2s
    setTimeout(async () => {
      await Order.findByIdAndUpdate(order._id, { status: 'confirmed' });
      publishEvent('order_confirmed', { orderId: order._id, userId, total });
    }, 2000);
    publishEvent('order_placed', { orderId: order._id, userId, total, items: items.length });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const order = await Order.findOne({ _id: req.params.id, userId });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/cancel', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const order = await Order.findOne({ _id: req.params.id, userId });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (['shipped', 'delivered'].includes(order.status))
      return res.status(400).json({ error: 'Cannot cancel order that has been shipped' });
    order.status = 'cancelled';
    await order.save();
    publishEvent('order_cancelled', { orderId: order._id, userId });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`🚀 Order Service running on port ${PORT}`));
