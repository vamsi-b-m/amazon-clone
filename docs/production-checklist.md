# Production Readiness Checklist

## Containers

- Multi-stage Dockerfile
- Non-root user
- Small image size
- Healthcheck
- Read-only filesystem (where possible)

---

## Application

- Graceful shutdown
- Structured logging
- Environment-based configuration
- No hardcoded secrets
- Retry logic
- Connection timeouts

---

## Kubernetes

- Namespace
- ConfigMap
- Secret
- Deployment
- Service
- Ingress
- HPA
- Resource requests
- Resource limits
- Pod Disruption Budget

---

## Security

- RBAC
- Network Policies
- Image Scanning
- Secret Management
- Least Privilege

---

## Observability

- Prometheus
- Grafana
- Loki
- Alertmanager
- OpenTelemetry

---

## CI/CD

- Unit Tests
- Docker Build
- Image Scan
- Push Images
- Helm Upgrade
- Smoke Tests