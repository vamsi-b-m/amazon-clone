import { useEffect, useState } from "react";
import api from "../services/api";

function Orders() {

    const [orders, setOrders] = useState([]);


    useEffect(() => {
        fetchOrders();
    }, []);


    async function fetchOrders() {

        try {

            const response = await api.get(
                "/orders"
            );

            setOrders(
                response.data
            );

        } catch(error){

            console.log(error);

        }

    }


    async function pay(orderId){

        try{

            // simulate payment gateway

            const paymentResponse =
            await api.post(
                `/payments/${orderId}`
            );

            const paymentStatus =
            paymentResponse.data.payment_status;


            // update order status

            await api.put(
                `/orders/${orderId}/payment`,
                {},
                {
                    params:{
                        status:paymentStatus
                    }
                }
            );


            alert(
                `Payment ${paymentStatus}`
            );

            fetchOrders();

        }
        catch(error){

            console.log(error);

            alert(
                "Payment Failed"
            );

        }

    }


    return(

        <div>

            <h1>
                Orders
            </h1>

            {

                orders.length===0 ?

                (

                    <h3>
                        No Orders Found
                    </h3>

                )

                :

                (

                    orders.map((order)=>(

                        <div
                            key={order.order_id}
                            style={{
                                border:"1px solid gray",
                                padding:"10px",
                                margin:"10px"
                            }}
                        >

                            <h3>
                                Order ID:
                            </h3>

                            <p>
                                {order.order_id}
                            </p>

                            <p>
                                Status:
                                {order.status}
                            </p>

                            <p>
                                Payment:
                                {order.payment_status}
                            </p>

                            <p>
                                Items:
                                {order.items.length}
                            </p>


                            {

                                order.payment_status==="PENDING" &&

                                <button
                                    onClick={() =>
                                        pay(
                                            order.order_id
                                        )
                                    }
                                >

                                    Pay

                                </button>

                            }

                        </div>

                    ))

                )

            }

        </div>

    )

}

export default Orders;