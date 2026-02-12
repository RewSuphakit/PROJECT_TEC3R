import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { useMemo } from "react";
import useAuth from "../hooks/useAuth";
import GuestRoutes, { guestRoutes } from "./GuestRoutes";
import UserLayout, { userRoutes } from "./UserRoutes";
import AdminLayout, { adminRoutes } from "./AdminRoutes";

export default function AppRouter() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const router = useMemo(() => createBrowserRouter([
    {
      path: "/RMUTI",
      element: !user ? <GuestRoutes /> : isAdmin ? <AdminLayout /> : <UserLayout />,
      children: !user
        ? guestRoutes
        : isAdmin
        ? adminRoutes
        : userRoutes,
    },
  ], {
    future: {
      v7_relativeSplatPath: true,
    },
  }), [user, isAdmin]);

  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}

