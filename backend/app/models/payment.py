from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import Float
from sqlalchemy import String
from sqlalchemy import ForeignKey

from app.database.database import Base

class Payment(Base):

    __tablename__="payments"
    
    id=Column(
        Integer,
        primary_key=True,
        index=True
    )
    order_id=Column(
        Integer,
        ForeignKey("orders.id")
    )
    amount=Column(
        Float
    )
    payment_method=Column(
        String
    )
    payment_status=Column(
        String,
        default="PENDING"
    )
