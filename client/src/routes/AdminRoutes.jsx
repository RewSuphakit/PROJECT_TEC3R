import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import Loading from "../components/Loading";

const Herderadmin = lazy(() => import("../pages/admin/Herderadmin"));
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const ManageTools = lazy(() => import("../pages/admin/ManageTools"));
const ListBorrow = lazy(() => import("../pages/admin/ListBorrow"));
const ListReturn = lazy(() => import("../pages/admin/ListReturn"));
const ManageUsers = lazy(() => import("../pages/admin/ManageUsers"));
const Report = lazy(() => import("../pages/admin/Report"));
const ReportDetails = lazy(() => import("../pages/admin/ReportDetails"));
const NotFound = lazy(() => import("../components/NotFound404"));

export default function AdminLayout() {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Herderadmin />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
    </>
  );
}

export const adminRoutes = [
  { index: true, element: <Suspense fallback={<Loading />}><Dashboard /></Suspense> },
  { path: "Dashboard", element: <Suspense fallback={<Loading />}><Dashboard /></Suspense> },
  { path: "ManageTools", element: <Suspense fallback={<Loading />}><ManageTools /></Suspense> },
  { path: "ListBorrow", element: <Suspense fallback={<Loading />}><ListBorrow /></Suspense> },
  { path: "ListReturn", element: <Suspense fallback={<Loading />}><ListReturn /></Suspense> },
  { path: "ManageUsers", element: <Suspense fallback={<Loading />}><ManageUsers /></Suspense> },
  { path: "Report", element: <Suspense fallback={<Loading />}><Report /></Suspense> },
  { path: "ReportDetails/:transaction_id", element: <Suspense fallback={<Loading />}><ReportDetails /></Suspense> },
  { path: "*", element: <Suspense fallback={<Loading />}><NotFound /></Suspense> },
];

