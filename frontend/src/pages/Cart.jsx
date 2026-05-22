import { useEffect, useState } from "react";
import api from "../services/api";

function Cart() {

    const [cart, setCart] = useState([]);


    useEffect(() => {
        fetchCart();
    }, []);


    async function fetchCart() {

        try {

            const response=await api.get(
                "/cart"
            );

            console.log(
                "Cart:",
                response.data
            );

            setCart(
                response.data
            );

        }
        catch(error){

            console.log(error);

        }

    }


    async function removeItem(productId){

        try{

            await api.delete(
                `/cart/${productId}`
            );

            fetchCart();

        }
        catch(error){

            console.log(error);

        }

    }


    async function checkout(){

        try{

            const response=await api.post(
                "/orders/create"
            );

            console.log(
                "Order:",
                response.data
            );

            alert(
                "Order Created Successfully"
            );

            window.location.href="/orders";

        }
        catch(error){

            console.log(
                error.response?.data
            );

            alert(
                "Checkout Failed"
            );

        }

    }


    return(

        <div>

            <h1>Your Cart</h1>

            {
                cart.length===0 &&
                <h3>Cart Empty</h3>
            }

            {
                cart.map((item)=>(

                    <div
                        key={item.product_id}
                        style={{
                            border:"1px solid gray",
                            margin:"10px",
                            padding:"10px"
                        }}
                    >

                        <h3>
                            Product ID:
                            {item.product_id}
                        </h3>

                        <p>
                            Quantity:
                            {item.quantity}
                        </p>

                        <button
                            onClick={()=>
                                removeItem(
                                    item.product_id
                                )
                            }
                        >
                            Remove
                        </button>

                    </div>

                ))
            }


            {
                cart.length>0 &&

                <button
                    onClick={checkout}
                    style={{
                        marginTop:"20px"
                    }}
                >
                    Checkout
                </button>
            }

        </div>

    )

}

export default Cart;