# 🛒 Amazon Clone — DevOps Engineer Spec Sheet

You have been handed the application source code for a microservices-based e-commerce platform.
Your job is to **containerize, orchestrate, and deploy it**.

No Dockerfiles. No Compose file. No CI/CD. That's your work.

---

## 📁 What You've Been Given

Raw application code only:

```
amazon-clone/
├── frontend/                   # React 18 SPA
│   ├── package.json
│   ├── public/index.html
│   └── src/                    # Components, pages, contexts
│
└── services/
    ├── api-gateway/            # Express — port 4000
    ├── user-service/           # Express — port 3001
    ├── product-service/        # Express — port 3002
    ├── cart-service/           # Express — port 3003
    ├── order-service/          # Express — port 3004
    └── notification-service/  # Express — port 3005
```

---

## 🧠 Architecture You Need to Understand

Before touching any config, read the source code and answer these for yourself:

- What port does each service run on? (check each `src/index.js`)
- What environment variables does each service expect?
- Which services talk to MongoDB? Which database name does each use?
- Which services connect to Redis?
- Which services connect to RabbitMQ?
- How does the API Gateway route requests to downstream services? (what env vars does it use?)
- How does the frontend know where the API is? (check `src/services/api.js`)
- What does the frontend build output look like, and how should it be served?

---

## ✅ Your Tasks

### Level 1 — Containerization

- [ ] Write a `Dockerfile` for each of the 6 Node.js services
  - Use an appropriate base image
  - Follow best practices: non-root user, `.dockerignore`, layer caching
  - Services should start with `node src/index.js`
- [ ] Write a multi-stage `Dockerfile` for the React frontend
  - Stage 1: build the React app (`npm run build`)
  - Stage 2: serve the `build/` output with Nginx
  - The Nginx config must handle **SPA routing** (all paths → `index.html`)
  - The Nginx config must **proxy `/api/*`** requests to the API Gateway

### Level 2 — Local Orchestration

- [ ] Write a `docker-compose.yml` that brings up the full stack:
  - All 6 application services
  - MongoDB (with auth enabled)
  - Redis
  - RabbitMQ (with management UI)
  - Frontend (Nginx)
  - A custom Docker network so services can talk by name
  - Named volumes for MongoDB data persistence
- [ ] Wire all environment variables correctly
- [ ] Ensure services that depend on MongoDB/Redis/RabbitMQ wait for them (use `depends_on` and/or retry logic — note: the services already have retry logic built in)
- [ ] Verify: `docker compose up --build` → app works end-to-end

### Level 3 — Operational Tooling

- [ ] Write a `Makefile` with targets: `up`, `down`, `logs`, `build`, `clean`, `health`, `shell-<service>`
- [ ] Write `.dockerignore` files for each service (at minimum: `node_modules`, `.env`, `*.log`)
- [ ] Add a `healthcheck` to each service in your Compose file using the `/health` endpoint each service already exposes

### Level 4 — Kubernetes (Stretch)

- [ ] Write K8s manifests (or use `kompose convert` as a starting point, then clean up):
  - `Deployment` + `Service` for each microservice
  - `ConfigMap` for non-sensitive env vars
  - `Secret` for MongoDB credentials and JWT secret
  - `Ingress` to route external traffic to the frontend and API gateway
- [ ] Deploy to a local cluster (Minikube or Kind)
- [ ] Verify: `kubectl get pods` — all pods Running

### Level 5 — CI/CD Pipeline (Stretch)

- [ ] Write a GitHub Actions workflow (`.github/workflows/ci.yml`) that:
  - Triggers on push to `main`
  - Builds Docker images for all services
  - Pushes images to Docker Hub (or GHCR)
  - Optionally: deploys to your K8s cluster

---

## 🔌 Environment Variables Reference

Discover these yourself by reading the source — but here's a hint on what categories to look for in each service:

| Variable Type | Services That Need It |
|---|---|
| `MONGO_URI` | user, product, cart, order |
| `JWT_SECRET` | user-service (signs tokens), api-gateway (verifies tokens) |
| `REDIS_URL` | api-gateway, product-service, cart-service |
| `RABBITMQ_URL` | order-service, notification-service |
| `PORT` | all services |
| `*_SERVICE_URL` | api-gateway only (one per downstream service) |
| `REACT_APP_API_URL` | frontend build (or handled via Nginx proxy) |

> 💡 Tip: Using an Nginx proxy in the frontend container to forward `/api/*` to the gateway is cleaner than baking a URL into the React build.

---

## 🧪 Verification Checklist

Once your stack is running, confirm each of these works:

- [ ] Frontend loads at http://localhost:3000
- [ ] `GET http://localhost:4000/health` returns JSON with all services listed
- [ ] You can register a new user
- [ ] You can log in with `admin@amazon.com` / `Admin@123` (seeded on first boot)
- [ ] Products load on the homepage
- [ ] Search returns results
- [ ] You can add a product to cart
- [ ] You can complete a checkout and see the order in `/orders`
- [ ] RabbitMQ UI at http://localhost:15672 shows messages flowing on `order_events` queue
- [ ] Stopping and restarting MongoDB preserves data (volume works)
- [ ] `docker compose down && docker compose up` — app still works

---

## 💡 Tips & Gotchas

- **Service startup order matters.** MongoDB takes a few seconds to be ready. The services have built-in retry loops, but you should still use `depends_on`.
- **React routing.** The frontend uses React Router with client-side routing. Your Nginx config must serve `index.html` for all unknown paths, not return a 404.
- **API proxying.** The frontend calls `/api/*`. In development this hits `localhost:4000` directly. In the Docker setup, Nginx should proxy these to `http://api-gateway:4000`.
- **JWT secret must match.** The user-service signs tokens and the api-gateway verifies them — they must share the same `JWT_SECRET`.
- **MongoDB auth.** If you enable MongoDB authentication (recommended), the URI format is: `mongodb://user:pass@mongo:27017/dbname?authSource=admin`
- **Network naming.** In Docker Compose, services communicate by their service name as hostname. `http://user-service:3001` works inside the network.
- **Node.js base image.** Use `node:20-alpine` for small images. Avoid `node:latest` (too large, unstable).
- **Multi-stage builds.** For the React frontend, the final image should contain only Nginx + the built static files — not Node.js.

---

## 📐 Target Architecture Diagram

```
Browser
  │
  ▼
[Nginx :80]  ──/api/*──►  [API Gateway :4000]
  │  serves                      │
  │  React SPA            ┌──────┼──────────────┐
  │                       ▼      ▼              ▼
  │                   [User]  [Product]  [Cart] [Order]
  │                     │       │          │      │
  │                     └───────┴──────────┘      │
  │                             │                 │
  │                         [MongoDB]         [RabbitMQ]
  │                         [Redis]               │
  │                                          [Notification]
```

---

Good luck. Read the code first. Everything you need to know is in there.
