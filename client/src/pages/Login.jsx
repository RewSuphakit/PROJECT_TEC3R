import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
const Login = () => {
  const [student_email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', { student_email, password });
      setMessage(response.data.message);
      localStorage.setItem('token', response.data.token); 
      navigate('/RMUTI/');// เก็บ token สำหรับการล็อกอิน
    } catch (error) {
      setMessage('Login failed');
    }
  };

  return (
    <div>

      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={student_email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
      
    </div>
  );
};

export default Login;
