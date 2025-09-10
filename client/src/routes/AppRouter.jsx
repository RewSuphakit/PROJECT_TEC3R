import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import GuestRoutes, { guestRoutes } from "./GuestRoutes";
import UserLayout, { userRoutes } from "./UserRoutes";
import AdminLayout, { adminRoutes } from "./AdminRoutes";

export default function AppRouter() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const router = createBrowserRouter([
    {
      path: "/RMUTI",
      element: !user ? <GuestRoutes /> : isAdmin ? <AdminLayout /> : <UserLayout />,
      children: !user
        ? guestRoutes
        : isAdmin
        ? adminRoutes
        : userRoutes,
    },
  ]);

  return <RouterProvider router={router} />;
}
