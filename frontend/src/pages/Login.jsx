import { useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import api from "../services/api";

import { useNavigate } from "react-router-dom";


function Login(){

    const navigate=useNavigate()

    const {login}=useContext(AuthContext)
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")

    async function handleLogin(){

        try {
                const response=await api.post("/auth/login", {email,password})
                console.log("Backend response:", response.data)
                console.log("Access token:", response.data.access_token)

                login(response.data.access_token)
                
                navigate("/")
            }
        catch(error){
                console.log(error)
                console.log(error.response?.data)
                alert(JSON.stringify(error.response?.data))
            }
    }

    return(
            <div>
            <h1>Login</h1>
            <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)}/>
            <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)}/>
            <button onClick={handleLogin}>Login</button>
            </div>
        )
    }

export default Login
