import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loading from "../components/Loading";

const HomePage = lazy(() => import("../pages/Home"));
const EditProfile = lazy(() => import("../pages/user/EditProfile"));
const EditEmail = lazy(() => import("../pages/user/EditEmail"));
const History = lazy(() => import("../pages/user/History"));
const Return = lazy(() => import("../components/Return"));
const NotFound = lazy(() => import("../components/NotFound404"));

export default function UserLayout() {
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

export const userRoutes = [
  { index: true, element: <Suspense fallback={<Loading />}><HomePage /></Suspense> },
  { path: "Return", element: <Suspense fallback={<Loading />}><Return /></Suspense> },
  { path: "EditProfile", element: <Suspense fallback={<Loading />}><EditProfile /></Suspense> },
  { path: "EditEmail", element: <Suspense fallback={<Loading />}><EditEmail /></Suspense> },
  { path: "History", element: <Suspense fallback={<Loading />}><History /></Suspense> },
  { path: "*", element: <Suspense fallback={<Loading />}><NotFound /></Suspense> },
];
