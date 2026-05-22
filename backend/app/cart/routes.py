from fastapi import APIRouter
from fastapi import Depends

import json

from app.database.redis import redis_client
from app.auth.dependencies import get_current_user

router=APIRouter()

@router.post("/add/{product_id}")
def add_to_cart(product_id: int, current_user: str = Depends(get_current_user)):
    key = f"cart:{current_user}"
    cart = redis_client.get(key)
    
    if cart:
        cart = json.loads(cart)
    else:
        cart = []
    
    found = False
    
    for item in cart:
        if item["product_id"] == product_id:
            item["quantity"] += 1
            found = True
            break

    if not found:
        cart.append({
            "product_id": product_id,
            "quantity": 1
        })
    
    redis_client.set(
        key,
        json.dumps(cart)
    )
    
    return {
        "message": "added",
        "cart": cart
    }

@router.get("/")
def get_cart(
    current_user=Depends(
        get_current_user
    )
):

    key = f"cart:{current_user}"

    cart = redis_client.get(key)

    if not cart:
        return []

    return json.loads(cart)

@router.delete("/{product_id}")
def remove_from_cart(
    product_id: int,
    current_user=Depends(
        get_current_user
    )
):

    key = f"cart:{current_user}"

    cart = redis_client.get(key)

    if not cart:
        return {
            "message":"Cart empty"
        }

    cart_items = json.loads(cart)

    updated_cart = []

    for item in cart_items:

        item_id = item.get(
            "product_id",
            item.get("id")
        )

        if item_id != product_id:

            updated_cart.append(
                item
            )

    redis_client.set(
        key,
        json.dumps(updated_cart)
    )

    return {
        "message":"Removed successfully"
    }

@router.delete("/clear")
def clear_cart(
    current_user:str=Depends(get_current_user)):
    key=f"cart:{current_user}"
    redis_client.delete(key)
    return {
        "message":"cart cleared"
    }
