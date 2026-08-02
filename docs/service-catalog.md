# Service Catalog

| Service | Purpose | Port | Type | Database | Public |
|----------|----------|------|------|----------|--------|
| Frontend | React Application | 3000 | Stateless | None | Yes |
| API Gateway | Request Routing | 8080 | Stateless | None | Yes |
| User Service | Authentication & Users | 5001 | Stateless | MongoDB | No |
| Product Service | Product APIs | 5002 | Stateless | MongoDB | No |
| Cart Service | Shopping Cart | 5003 | Stateless | Redis | No |
| Order Service | Orders | 5004 | Stateless | MongoDB | No |
| Notification Service | Emails & Notifications | 5005 | Stateless | None | No |
| MongoDB | Database | 27017 | Stateful | Persistent | No |
| Redis | Cache | 6379 | Stateful | Memory | No |
| RabbitMQ | Message Broker | 5672 | Stateful | Persistent | No |

---

## Scaling Strategy

Frontend

- Multiple replicas

Gateway

- Multiple replicas

Backend Services

- Horizontal scaling

MongoDB

- Single replica (development)

Redis

- Single replica

RabbitMQ

- Single replica