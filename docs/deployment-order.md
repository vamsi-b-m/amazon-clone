# Deployment Order

Infrastructure components must be deployed before application services.

## Step 1

MongoDB

## Step 2

Redis

## Step 3

RabbitMQ

## Step 4

User Service

## Step 5

Product Service

## Step 6

Cart Service

## Step 7

Order Service

## Step 8

Notification Service

## Step 9

API Gateway

## Step 10

Frontend

---

## Verification

After each deployment verify:

- Pod Running
- Readiness Passed
- Liveness Passed
- Service Reachable
- Logs Clean

Only continue after verification.