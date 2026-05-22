from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.database.redis import redis_client

import json
import uuid

router=APIRouter()

orders_db=[]


@router.post("/create")
def create_order(
    current_user=Depends(
        get_current_user
    )
):

    key=f"cart:{current_user}"

    cart=redis_client.get(key)

    if not cart:

        return {
            "message":"Cart Empty"
        }

    cart_items=json.loads(cart)

    order={

        "order_id":str(
            uuid.uuid4()
        ),

        "user":current_user,

        "items":cart_items,

        "status":"CREATED",

        "payment_status":"PENDING"

    }

    orders_db.append(
        order
    )

    redis_client.delete(
        key
    )

    return order


@router.get("/")
def get_orders(
    current_user=Depends(
        get_current_user
    )
):

    return [

        order
        for order in orders_db
        if order["user"]==current_user

    ]


@router.put(
    "/{order_id}/payment"
)
def update_payment(
    order_id:str,
    status:str
):

    for order in orders_db:

        if order["order_id"]==order_id:

            order[
                "payment_status"
            ]=status

            if status=="SUCCESS":

                order[
                    "status"
                ]="CONFIRMED"

            else:

                order[
                    "status"
                ]="FAILED"

            return order


    return {
        "message":"Order not found"
    }