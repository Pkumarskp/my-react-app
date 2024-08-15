import React from 'react'
import { v4 as uuidv4 } from 'uuid';
import { useLocation, useNavigate } from 'react-router-dom';
const LoginForm = () => {
  let navigate = useNavigate();
  const [password, SetPassword] = React.useState('')
  const [email, Setemail] = React.useState('')
  const handleSubmit = (e) => {
    e.preventDefault();
    const userId = uuidv4();
    const userData = {
      id: userId,
      email,
      password,
    };
    const existingUsers = JSON.parse(localStorage.getItem('user')) || [];
    const userIndex = existingUsers.findIndex(user => user.email === email);
    if (userIndex !== -1) {
      let loginUser = { status: true, email: email }
      localStorage.setItem('login', JSON.stringify(loginUser));
      navigate('/');
    } else {
      navigate('/register');
    }

  };
  return (
    <div className="container mt-5">
      <h2 className="mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6">
            <input
              type="email"
              value={email}
              onChange={(e) => Setemail(e.target.value)}
              className="form-control"
              placeholder="Email"
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <input
              type="password"
              value={password}
              onChange={(e) => SetPassword(e.target.value)}
              className="form-control"
              placeholder="Password"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <button
              type="submit"
              className="btn btn-primary"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default LoginForm