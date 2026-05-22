from pydantic import BaseModel

class ProductCreate(BaseModel):
    name:str
    description:str
    category:str
    price:float
    image_url:str

class ProductResponse(ProductCreate):
    id:int
    class Config:
        from_attributes=True