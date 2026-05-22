const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createClient } = require('redis');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Redis Client ──────────────────────────────────────────────
let redisClient;
(async () => {
  try {
    redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    redisClient.on('error', (err) => console.log('Redis error:', err));
    await redisClient.connect();
    console.log('✅ Redis connected');
  } catch (err) {
    console.log('⚠️  Redis not available, continuing without cache');
  }
})();

// ─── Middleware ────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 500, message: { error: 'Too many requests' } });
app.use(limiter);

// ─── Auth Middleware ───────────────────────────────────────────
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_amazon_clone');
    req.user = decoded;
    req.headers['x-user-id'] = decoded.id;
    req.headers['x-user-email'] = decoded.email;
    req.headers['x-user-role'] = decoded.role;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_amazon_clone');
      req.user = decoded;
      req.headers['x-user-id'] = decoded.id;
    } catch {}
  }
  next();
};

// ─── Proxy Helper ──────────────────────────────────────────────
const proxyRequest = async (targetUrl, req, res) => {
  try {
    const config = {
      method: req.method,
      url: targetUrl,
      headers: { ...req.headers, host: undefined },
      data: req.body,
      params: req.query,
      timeout: 10000,
    };
    const response = await axios(config);
    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      console.error('Proxy error:', err.message);
      res.status(503).json({ error: 'Service unavailable', message: err.message });
    }
  }
};

const USER_SVC = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const PRODUCT_SVC = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';
const CART_SVC = process.env.CART_SERVICE_URL || 'http://localhost:3003';
const ORDER_SVC = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';

// ─── Health Check ──────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const services = [
    { name: 'user-service', url: `${USER_SVC}/health` },
    { name: 'product-service', url: `${PRODUCT_SVC}/health` },
    { name: 'cart-service', url: `${CART_SVC}/health` },
    { name: 'order-service', url: `${ORDER_SVC}/health` },
  ];
  const results = await Promise.allSettled(services.map(s => axios.get(s.url, { timeout: 3000 })));
  const statuses = services.map((s, i) => ({
    service: s.name,
    status: results[i].status === 'fulfilled' ? 'healthy' : 'unhealthy',
  }));
  res.json({ gateway: 'healthy', timestamp: new Date(), services: statuses });
});

// ─── User Service Routes ───────────────────────────────────────
app.post('/api/auth/register', (req, res) => proxyRequest(`${USER_SVC}/api/users/register`, req, res));
app.post('/api/auth/login', (req, res) => proxyRequest(`${USER_SVC}/api/users/login`, req, res));
app.get('/api/auth/profile', authenticate, (req, res) => proxyRequest(`${USER_SVC}/api/users/profile`, req, res));
app.put('/api/auth/profile', authenticate, (req, res) => proxyRequest(`${USER_SVC}/api/users/profile`, req, res));
app.get('/api/auth/addresses', authenticate, (req, res) => proxyRequest(`${USER_SVC}/api/users/addresses`, req, res));
app.post('/api/auth/addresses', authenticate, (req, res) => proxyRequest(`${USER_SVC}/api/users/addresses`, req, res));

// ─── Product Service Routes ────────────────────────────────────
app.get('/api/products', optionalAuth, async (req, res) => {
  const cacheKey = `products:${JSON.stringify(req.query)}`;
  if (redisClient?.isOpen) {
    const cached = await redisClient.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));
  }
  try {
    const response = await axios.get(`${PRODUCT_SVC}/api/products`, { params: req.query, timeout: 10000 });
    if (redisClient?.isOpen) await redisClient.setEx(cacheKey, 60, JSON.stringify(response.data));
    res.json(response.data);
  } catch (err) {
    err.response ? res.status(err.response.status).json(err.response.data) : res.status(503).json({ error: 'Product service unavailable' });
  }
});
app.get('/api/products/search', optionalAuth, (req, res) => proxyRequest(`${PRODUCT_SVC}/api/products/search`, req, res));
app.get('/api/products/categories', (req, res) => proxyRequest(`${PRODUCT_SVC}/api/products/categories`, req, res));
app.get('/api/products/:id', optionalAuth, (req, res) => proxyRequest(`${PRODUCT_SVC}/api/products/${req.params.id}`, req, res));
app.post('/api/products', authenticate, (req, res) => proxyRequest(`${PRODUCT_SVC}/api/products`, req, res));
app.put('/api/products/:id', authenticate, (req, res) => proxyRequest(`${PRODUCT_SVC}/api/products/${req.params.id}`, req, res));
app.delete('/api/products/:id', authenticate, (req, res) => proxyRequest(`${PRODUCT_SVC}/api/products/${req.params.id}`, req, res));
app.post('/api/products/:id/reviews', authenticate, (req, res) => proxyRequest(`${PRODUCT_SVC}/api/products/${req.params.id}/reviews`, req, res));

// ─── Cart Service Routes ───────────────────────────────────────
app.get('/api/cart', authenticate, (req, res) => proxyRequest(`${CART_SVC}/api/cart`, req, res));
app.post('/api/cart/items', authenticate, (req, res) => proxyRequest(`${CART_SVC}/api/cart/items`, req, res));
app.put('/api/cart/items/:productId', authenticate, (req, res) => proxyRequest(`${CART_SVC}/api/cart/items/${req.params.productId}`, req, res));
app.delete('/api/cart/items/:productId', authenticate, (req, res) => proxyRequest(`${CART_SVC}/api/cart/items/${req.params.productId}`, req, res));
app.delete('/api/cart', authenticate, (req, res) => proxyRequest(`${CART_SVC}/api/cart`, req, res));

// ─── Order Service Routes ──────────────────────────────────────
app.post('/api/orders', authenticate, (req, res) => proxyRequest(`${ORDER_SVC}/api/orders`, req, res));
app.get('/api/orders', authenticate, (req, res) => proxyRequest(`${ORDER_SVC}/api/orders`, req, res));
app.get('/api/orders/:id', authenticate, (req, res) => proxyRequest(`${ORDER_SVC}/api/orders/${req.params.id}`, req, res));
app.put('/api/orders/:id/cancel', authenticate, (req, res) => proxyRequest(`${ORDER_SVC}/api/orders/${req.params.id}/cancel`, req, res));

app.listen(PORT, () => console.log(`🚀 API Gateway running on port ${PORT}`));
