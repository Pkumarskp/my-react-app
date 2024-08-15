import React from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import Header from './Header';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import List from './List';
import 'bootstrap/dist/css/bootstrap.css';
function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route exact path="/" element={<List />} />
        <Route exact path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
      </Routes>
    </Router>
  );
}

export default App;
