# Runtime Configuration

## User Service

| Variable | Purpose |
|-----------|----------|
| MONGO_URI | MongoDB Connection |
| JWT_SECRET | JWT Signing Key |
| PORT | Application Port |

---

## Product Service

| Variable | Purpose |
|-----------|----------|
| MONGO_URI | MongoDB Connection |
| PORT | Application Port |

---

## Cart Service

| Variable | Purpose |
|-----------|----------|
| REDIS_HOST | Redis Host |
| REDIS_PORT | Redis Port |
| PORT | Application Port |

---

## Order Service

| Variable | Purpose |
|-----------|----------|
| MONGO_URI | MongoDB |
| RABBITMQ_URL | RabbitMQ |
| PORT | Application Port |

---

## Notification Service

| Variable | Purpose |
|-----------|----------|
| RABBITMQ_URL | RabbitMQ |
| EMAIL_HOST | SMTP Server |
| EMAIL_USERNAME | SMTP Username |
| EMAIL_PASSWORD | SMTP Password |

---

## Gateway

Gateway should contain only routing configuration.

---

## Frontend

Frontend should contain only public API URLs.