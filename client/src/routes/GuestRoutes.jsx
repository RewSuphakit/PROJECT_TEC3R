import { Suspense, lazy } from "react";
import { Outlet, Navigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loading from "../components/Loading";

const HomePage = lazy(() => import("../pages/Home"));
const LoginForm = lazy(() => import("../pages/Login"));
const RegisterForm = lazy(() => import("../pages/Register"));

export default function GuestRoutes() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col">
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export const guestRoutes = [
  { index: true, element: <Suspense fallback={<Loading />}><HomePage /></Suspense> },
  { path: "login", element: <Suspense fallback={<Loading />}><LoginForm /></Suspense> },
  { path: "register", element: <Suspense fallback={<Loading />}><RegisterForm /></Suspense> },
  { path: "*", element: <Navigate to="/RMUTI/login" replace /> },
];
