import React from 'react'
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    let loginUserStatus = JSON.parse(localStorage.getItem('login')) || [];
    console.log(loginUserStatus);
    const logout = () => {
        localStorage.removeItem("login");
        navigate('/register')
    };
    if (loginUserStatus.length === 0) {
        return (
            <nav className="navbar navbar-light bg-light">
                {location.pathname !== '/login' && <Link to="/login" className="btn btn-outline-success" type="button">Login</Link>}
                {location.pathname !== '/register' && <Link to="/register" className="btn btn-outline-secondary" type="button">Register</Link>}
            </nav>
        )
    } else {
        return (
            <nav className="navbar navbar-light bg-light">
                <button to="/login" className="btn btn-outline-success" type="button" onClick={logout}>Logout</button>
            </nav>
        )
    }
}
export default Header