from app.database.database import SessionLocal
from app.models.product import Product

db=SessionLocal()

products=[

    Product(
        name="Apple iPhone 16",
        price=89999
    ),

    Product(
        name="Samsung Galaxy S25",
        price=79999
    ),

    Product(
        name="MacBook Pro M4",
        price=169999
    ),

    Product(
        name="Dell XPS 15",
        price=129999
    ),

    Product(
        name="Sony WH-1000XM5",
        price=24999
    ),

    Product(
        name="Apple AirPods Pro",
        price=22999
    ),

    Product(
        name="iPad Air",
        price=54999
    ),

    Product(
        name="Samsung Smart TV",
        price=64999
    ),

    Product(
        name="Logitech MX Master 3S",
        price=8999
    ),

    Product(
        name="Mechanical Keyboard",
        price=4999
    ),

    Product(
        name="Gaming Mouse",
        price=2999
    ),

    Product(
        name="HP Pavilion Laptop",
        price=59999
    ),

    Product(
        name="Nike Running Shoes",
        price=6999
    ),

    Product(
        name="Adidas Hoodie",
        price=2999
    ),

    Product(
        name="Boat Bluetooth Speaker",
        price=1999
    )

]

db.add_all(products)

db.commit()

print(
    "Products Added"
)