const express = require('express');
const cors = require('cors');
require('dotenv').config();

const client = require("prom-client");

const app = express();

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

app.use(cors());
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

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'notification-service' }));

app.get("/metrics", async (req, res) => {

  res.set("Content-Type", register.contentType);

  res.end(await register.metrics());

});

// ─── RabbitMQ Consumer ─────────────────────────────────────────
const startConsumer = async () => {
  try {
    const amqplib = require('amqplib');
    const conn = await amqplib.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    const channel = await conn.createChannel();
    await channel.assertQueue('order_events', { durable: true });
    channel.prefetch(1);
    console.log('✅ RabbitMQ consumer started (notification-service)');
    channel.consume('order_events', (msg) => {
      if (msg) {
        const { event, data } = JSON.parse(msg.content.toString());
        handleEvent(event, data);
        channel.ack(msg);
      }
    });
  } catch (err) {
    console.log('⚠️  RabbitMQ not available, retrying...', err.message);
    setTimeout(startConsumer, 5000);
  }
};

function handleEvent(event, data) {
  const timestamp = new Date().toISOString();
  switch (event) {
    case 'order_placed':
      console.log(`📧 [${timestamp}] NOTIFICATION: Order placed! Order ID: ${data.orderId}, User: ${data.userId}, Total: $${data.total}`);
      // In production: send email, push notification, SMS
      break;
    case 'order_confirmed':
      console.log(`✅ [${timestamp}] NOTIFICATION: Order confirmed! Order ID: ${data.orderId}`);
      break;
    case 'order_cancelled':
      console.log(`❌ [${timestamp}] NOTIFICATION: Order cancelled! Order ID: ${data.orderId}`);
      break;
    default:
      console.log(`📨 [${timestamp}] Event received: ${event}`, data);
  }
}

startConsumer();

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`🚀 Notification Service running on port ${PORT}`));
