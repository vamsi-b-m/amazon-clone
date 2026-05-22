from fastapi import APIRouter
from app.database.database import SessionLocal
from app.models.product import Product

router=APIRouter()


@router.get("/")
def get_products():

    db=SessionLocal()

    products=db.query(
        Product
    ).all()

    return products


@router.get("/search")
def search_products(
    q:str
):

    db=SessionLocal()

    products=(
        db.query(Product)
        .filter(
            Product.name.ilike(
                f"%{q}%"
            )
        )
        .all()
    )

    return products


@router.get("/{product_id}")
def get_product(
    product_id:int
):

    db=SessionLocal()

    product=(
        db.query(Product)
        .filter(
            Product.id==product_id
        )
        .first()
    )

    return product