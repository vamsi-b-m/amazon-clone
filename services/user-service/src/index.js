const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const morgan = require('morgan');
const client = require("prom-client");
require('dotenv').config();

// ─── Prometheus Metrics ───────────────────────────────────────

const register = new client.Registry();

// Collect default Node.js metrics
client.collectDefaultMetrics({
  register,
});

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests",
  labelNames: ["method", "route", "status"],
  buckets: [0.05, 0.1, 0.2, 0.5, 1, 2, 5],
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDuration);

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => {

  const start = process.hrtime();

  res.on("finish", () => {

    const diff = process.hrtime(start);

    const duration = diff[0] + diff[1] / 1e9;

    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode,
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
        status: res.statusCode,
      },
      duration
    );

  });

  next();

});

// ─── MongoDB Connection ────────────────────────────────────────
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/amazon_users');
    console.log('✅ MongoDB connected (user-service)');
    await seedUsers();
  } catch (err) {
    console.error('MongoDB error:', err.message);
    setTimeout(connectDB, 5000);
  }
};
connectDB();

// ─── User Schema ───────────────────────────────────────────────
const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },
  line1: String, line2: String, city: String,
  state: String, zip: String, country: { type: String, default: 'US' },
  isDefault: { type: Boolean, default: false },
});
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: String,
  phone: String,
  addresses: [addressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId }],
  createdAt: { type: Date, default: Date.now },
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
const User = mongoose.model('User', userSchema);

const generateToken = (user) => jwt.sign(
  { id: user._id, email: user.email, role: user.role, name: user.name },
  process.env.JWT_SECRET || 'super_secret_jwt_key_amazon_clone',
  { expiresIn: '7d' }
);

// ─── Seed Data ─────────────────────────────────────────────────
async function seedUsers() {
  const count = await User.countDocuments();
  if (count === 0) {
    await User.create([
      { name: 'Admin User', email: 'admin@amazon.com', password: 'Admin@123', role: 'admin' },
      { name: 'John Doe', email: 'john@example.com', password: 'John@123', role: 'user' },
    ]);
    console.log('✅ Users seeded');
  }
}

// ─── Routes ───────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'user-service' }));

app.get("/metrics", async (req, res) => {

  res.set("Content-Type", register.contentType);

  res.end(await register.metrics());

});

app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already exists' });
    const user = await User.create({ name, email, password });
    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/profile', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(userId, { name, phone, avatar }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/addresses', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const user = await User.findById(userId).select('addresses');
    res.json(user.addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/addresses', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const user = await User.findById(userId);
    user.addresses.push(req.body);
    await user.save();
    res.status(201).json(user.addresses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 User Service running on port ${PORT}`));
