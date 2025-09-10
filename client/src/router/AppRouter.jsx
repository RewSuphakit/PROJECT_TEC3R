import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import LoginForm from "../pages/Login";
import RegisterForm from "../pages/Register";
import HomePage from "../pages/Home";
import NotFound from "../components/NotFound404";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Dashboard from "../pages/admin/Dashboard";
import Return from '../components/Return';
import Herderadmin from '../pages/admin/Herderadmin';
import ManageTools from '../pages/admin/ManageTools';
import ListBorrow from'../pages/admin/ListBorrow';
import ListReturn from'../pages/admin/ListReturn';
import ManageUsers from '../pages/admin/ManageUsers';
import ReportResults from '../pages/admin/ReportResults';
import ReportDetails from '../pages/admin/ReportDetails';
import ReportBorrow from '../pages/admin/Reportborrow';
import EditProfile from "../pages/user/EditProfile";
import EditEmail from "../pages/user/EditEmail";

export default function AppRouter() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const router = createBrowserRouter([
    {
      path: "/RMUTI",
      element: user ? (isAdmin ? <Herderadmin /> : <><Header /><Outlet /><Footer /></>) : <><Header /><Outlet /><Footer /></>,
      children: [
        { index: true, element: <HomePage /> },

        // Guest only
        !user && { path: "login", element: <LoginForm /> },
        !user && { path: "register", element: <RegisterForm /> },

        // User only
        user && !isAdmin && { path: "Return", element: <Return /> },
        user && !isAdmin && { path: "EditProfile", element: <EditProfile /> },
        user && !isAdmin && { path: "EditEmail", element: <EditEmail /> },

        // Admin only
        user && isAdmin && { path: "Dashboard", element: <Dashboard /> },
        user && isAdmin && { path: "ManageTools", element: <ManageTools /> },
        user && isAdmin && { path: "ListBorrow", element: <ListBorrow /> },
        user && isAdmin && { path: "ListReturn", element: <ListReturn /> },
        user && isAdmin && { path: "ManageUsers", element: <ManageUsers /> },
        user && isAdmin && { path: "ReportResults", element: <ReportResults /> },
        user && isAdmin && { path: "ReportBorrow", element: <ReportBorrow /> },
        user && isAdmin && { path: "ReportDetails/:transaction_id", element: <ReportDetails /> },

        // Redirect if unauthorized
        !user && { path: "*", element: <Navigate to="/RMUTI/login" replace /> },
        user && { path: "*", element: <NotFound /> },
      ].filter(Boolean)
    }
  ]);

  return <RouterProvider router={router} />;
}
