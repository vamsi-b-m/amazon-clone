import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";

import Navbar from "./components/Navbar";

function App(){
   
  return(
      <>
          <Navbar/>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/orders" element={<Orders />} />
          </Routes>
      </>
    )
}

export default App
