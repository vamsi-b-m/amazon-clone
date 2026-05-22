from fastapi import FastAPI

from app.database.database import engine
from app.database.database import Base

from app.models.user import User
from app.models.product import Product

from app.auth.routes import router as auth_router
from app.products.routes import router as product_router

from app.cart.routes import router as cart_router

from app.models.order import Order
from app.models.order import OrderItem

from app.orders.routes import router as order_router

from app.models.payment import Payment

from app.payments.routes import (
    router as payment_router
)

from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(
    bind=engine
)

app=FastAPI(
    title="Amazon Clone API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"]
)

app.include_router(
    product_router,
    prefix="/products",
    tags=["Products"]
)

app.include_router(
    cart_router,
    prefix="/cart",
    tags=["Cart"]
)

app.include_router(
    order_router,
    prefix="/orders",
    tags=["Orders"]
)

app.include_router(
    payment_router,
    prefix="/payments",
    tags=["Payments"]
)

@app.get("/")
def health():
    return {
        "status":"running"
    }
