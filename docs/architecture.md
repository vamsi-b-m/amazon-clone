# Amazon Clone Architecture

## Overview

The Amazon Clone is designed as a microservices-based e-commerce platform.

Each business capability is implemented as an independent service.

The frontend communicates only with the API Gateway. The gateway routes requests to backend services.

RabbitMQ provides asynchronous communication.

Redis is used for caching.

MongoDB stores persistent application data.

---

## High Level Architecture

```
                 Internet
                     │
                     ▼
              React Frontend
                     │
                     ▼
               API Gateway
      ┌──────────┼──────────┬──────────┐
      ▼          ▼          ▼          ▼
   User      Product      Cart      Order
                                         │
                                         ▼
                                    RabbitMQ
                                         │
                                         ▼
                                  Notification

MongoDB ◄───────────────┐
                         │
Redis ◄──────────── Cart ┘
```

---

## Communication

Frontend → Gateway

Gateway → Services (HTTP REST)

Order → RabbitMQ

Notification ← RabbitMQ

Cart → Redis

Services → MongoDB

---

## Design Principles

- Stateless services
- Independent deployment
- API Gateway pattern
- Event-driven communication
- Containerized workloads
- Cloud-native deployment