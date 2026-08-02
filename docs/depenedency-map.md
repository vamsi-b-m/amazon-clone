# Dependency Map

## Frontend

Depends On

- API Gateway

---

## Gateway

Depends On

- User Service
- Product Service
- Cart Service
- Order Service

---

## User Service

Depends On

- MongoDB

---

## Product Service

Depends On

- MongoDB

---

## Cart Service

Depends On

- Redis

---

## Order Service

Depends On

- MongoDB
- RabbitMQ

---

## Notification Service

Depends On

- RabbitMQ

---

## Infrastructure Dependencies

MongoDB

No dependencies

Redis

No dependencies

RabbitMQ

No dependencies