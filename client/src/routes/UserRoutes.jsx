import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HomePage from "../pages/Home";
import Return from "../components/Return";
import EditProfile from "../pages/user/EditProfile";
import EditEmail from "../pages/user/EditEmail";
import History from "../pages/user/History";
import NotFound from "../components/NotFound404";

export default function UserLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export const userRoutes = [
  { index: true, element: <HomePage /> },
  { path: "Return", element: <Return /> },
  { path: "EditProfile", element: <EditProfile /> },
  { path: "EditEmail", element: <EditEmail /> },
  {path: "History", element: <History /> },
  { path: "*", element: <NotFound /> },
];
