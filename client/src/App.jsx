import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import useAuth from "./hooks/useAuth";
import AppRouter from "./router/AppRouter";
import 'react-toastify/dist/ReactToastify.css';
function App() {
  const { loading } = useAuth();
  return (
   
    <div>
    {loading ? (
      <span className="loading loading-bars loading-lg"></span>
    ) : (
      <>
        <ToastContainer />
        <AppRouter />
      </>
    )}
  </div>

  );
}

export default App;
