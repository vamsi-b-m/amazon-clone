import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/home.css";

function Home() {

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");


    useEffect(() => {

        fetchProducts();

    }, []);


    async function fetchProducts() {

        try {

            const response = await api.get(
                "/products"
            );

            setProducts(
                response.data
            );

        }
        catch(error){

            console.log(error);

        }

    }


    async function searchProducts(){

        try{

            if(search.trim()===""){

                fetchProducts();
                return;

            }

            const response =
            await api.get(
                `/products/search?q=${search}`
            );

            setProducts(
                response.data
            );

        }
        catch(error){

            console.log(error);

        }

    }


    async function addToCart(id){

        try{

            await api.post(
                `/cart/add/${id}`
            );

            alert(
                "Added To Cart"
            );

        }
        catch{

            alert(
                "Login First"
            );

        }

    }


    return(

        <div className="container">

            <div className="search-container">

                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e)=>
                        setSearch(
                            e.target.value
                        )
                    }
                    className="search-input"
                />

                <button
                    className="search-button"
                    onClick={
                        searchProducts
                    }
                >
                    Search
                </button>

            </div>


            <h1>
                Products
            </h1>


            <div className="product-grid">

                {

                    products.map((product)=>(

                        <div
                            key={product.id}
                            className="product-card"
                        >

                            <h2>
                                {product.name}
                            </h2>

                            <p>
                                ₹{product.price}
                            </p>

                            <button
                                onClick={() =>
                                    addToCart(
                                        product.id
                                    )
                                }
                            >
                                Add To Cart
                            </button>

                        </div>

                    ))

                }

            </div>

        </div>

    )

}

export default Home;