import { Outlet, Navigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HomePage from "../pages/Home";
import LoginForm from "../pages/Login";
import RegisterForm from "../pages/Register";

export default function GuestRoutes() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export const guestRoutes = [
  { index: true, element: <HomePage /> },
  { path: "login", element: <LoginForm /> },
  { path: "register", element: <RegisterForm /> },
  { path: "*", element: <Navigate to="/RMUTI/login" replace /> },
];
