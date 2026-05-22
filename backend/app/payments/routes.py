from fastapi import APIRouter
import random

router=APIRouter()

payments=[]


@router.post("/{order_id}")
def process_payment(
    order_id:str
):

    payment_status=random.choice(
        [
            "SUCCESS",
            "FAILED"
        ]
    )

    payment={

        "order_id":order_id,

        "payment_status":payment_status

    }

    payments.append(
        payment
    )

    return payment