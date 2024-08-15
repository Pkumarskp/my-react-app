import React  from 'react'
import { Link, useLocation } from 'react-router-dom';
const Header = () => {
    const location = useLocation();
    return (
        <nav className="navbar navbar-light bg-light">
            {location.pathname !== '/login' && <Link to="/login" className="btn btn-outline-success" type="button">Login</Link>}
            {location.pathname !== '/register' && <Link to="/register" className="btn btn-outline-secondary" type="button">Register</Link>}
        </nav>
    )
}
export default Header