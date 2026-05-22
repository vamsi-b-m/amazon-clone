import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function Register(){
const navigate=useNavigate()
const [username,setUsername]=useState("")
const [email,setEmail]=useState("")
const [password,setPassword]=useState("")

async function register(){
    try {
            await api.post("/auth/register",{username,email,password})
            navigate("/login")
        }

    catch {
            alert("Registration failed")
        }
    }

return(
        <div>
        <h1>Register</h1>
        <input placeholder="Username" onChange={(e)=>setUsername(e.target.value)}/>
        <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)}/>
        <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)}/>
        <button onClick={register}>Register</button>
        </div>

    )
}

export default Register
