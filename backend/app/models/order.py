from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Float
from sqlalchemy import String
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

from app.database.database import Base

class Order(Base):
    __tablename__="orders"
    id=Column(
        Integer,
        primary_key=True,
        index=True
    )
    user_email=Column(
        String
    )
    total_amount=Column(
        Float
    )
    status=Column(
        String,
        default="PLACED"
    )
    items=relationship(
        "OrderItem",
        back_populates="order"
    )

class OrderItem(Base):
    __tablename__="order_items"
    id=Column(
        Integer,
        primary_key=True
    )
    order_id=Column(
        Integer,
        ForeignKey("orders.id")
    )
    product_id=Column(
        Integer
    )
    quantity=Column(
        Integer
    )
    price=Column(
        Float
    )
    order=relationship(
        "Order",
        back_populates="items"
    )
