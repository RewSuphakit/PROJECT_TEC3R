import { Outlet } from "react-router-dom";
import Herderadmin from "../pages/admin/Herderadmin";
import Dashboard from "../pages/admin/Dashboard";
import ManageTools from "../pages/admin/ManageTools";
import ListBorrow from "../pages/admin/ListBorrow";
import ListReturn from "../pages/admin/ListReturn";
import ManageUsers from "../pages/admin/ManageUsers";
import Report from "../pages/admin/Report";
import ReportDetails from "../pages/admin/ReportDetails";
import NotFound from "../components/NotFound404";

export default function AdminLayout() {
  return (
    <>
      <Herderadmin />
      <Outlet />
    </>
  );
}

export const adminRoutes = [
  { index: true, element: <Dashboard /> },
  { path: "Dashboard", element: <Dashboard /> },
  { path: "ManageTools", element: <ManageTools /> },
  { path: "ListBorrow", element: <ListBorrow /> },
  { path: "ListReturn", element: <ListReturn /> },
  { path: "ManageUsers", element: <ManageUsers /> },
  { path: "Report", element: <Report /> },
  { path: "ReportDetails/:transaction_id", element: <ReportDetails /> },
  { path: "*", element: <NotFound /> },
];

