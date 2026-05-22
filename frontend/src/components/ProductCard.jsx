function ProductCard({product, addToCart}){
    return(
        <div style={{ border:"1px solid gray", padding:"15px", margin:"10px", width:"250px" }}>
            <img src={product.image_url} alt={product.name} width="150" />
            <h3>{product.name}</h3>
            <p>₹ {product.price}</p>
            <p>{product.description}</p>
            <button onClick={()=>addToCart(product.id)}>Add To Cart</button>
        </div>
    )
}

export default ProductCard
