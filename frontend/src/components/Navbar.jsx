import { Link } from "react-router-dom";
import "./../styles/navbar.css";

function Navbar() {

    return (

        <nav className="navbar">

            <div className="logo">
                AmazonClone
            </div>

            <div className="nav-links">

                <Link to="/">Home</Link>

                <Link to="/cart">
                    Cart
                </Link>

                <Link to="/orders">
                    Orders
                </Link>

                <Link to="/login">
                    Login
                </Link>

                <Link to="/register">
                    Register
                </Link>

            </div>

        </nav>

    )

}

export default Navbar;