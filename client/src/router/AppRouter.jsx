import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"; 
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
const guestRouter = createBrowserRouter([
    {
      path: "/RMUTI/",
      element: (
        <>
          <Header />
          <Outlet />
          <Footer />
        </>
      ),
      children: [
        // หน้าหลัก
        { index: true, element: <HomePage /> },
        // หน้าเข้าสู่ระบบ
        { path: "/RMUTI/login", element: <LoginForm /> },
        // หน้าลงทะเบียน
        { path: "/RMUTI/register", element: <RegisterForm /> },
        // เพิ่มเส้นทางสำหรับ 404 Not Found
        { path: "*", element: <NotFound /> }
      ]
    }
  ]);
  
  // สร้าง Router สำหรับผู้ใช้ที่เข้าสู่ระบบแล้ว
  const userRouter = createBrowserRouter([
    {
      path: "/RMUTI/",
      element: (
        <>
          <Header />
          <Outlet />
          <Footer />
        </>
      ),
      children: [
        { index: true, element: <HomePage /> },
        {path: "/RMUTI/Return", element: <Return />},
        { path: "/RMUTI/*", element: <NotFound /> },
        
      ]
    }
  ]);
  
 // สร้าง Router สำหรับผู้ใช้ที่เป็น Admin
const adminRouter = createBrowserRouter([
  {
    path: "/RMUTI/",
    element: (
      <>
        <Herderadmin />
        <Outlet />
        <Footer />
      </>
    ),
    children: [
      // หน้าหลักสำหรับผู้ใช้ที่เป็น Admin
      { index: true, element: <Dashboard /> },
      { path: "/RMUTI/Dashboard", element: <Dashboard /> },
      { path: "/RMUTI/ManageTools", element: <ManageTools /> },
      { path: "/RMUTI/ListBorrow", element: <ListBorrow /> },
      { path: "/RMUTI/ListReturn", element: <ListReturn /> },
      { path: "/RMUTI/ManageUsers", element: <ManageUsers /> },
      { path: "/RMUTI/ReportResults", element: <ReportResults /> },
      { path: "/RMUTI/ReportDetails/:transaction_id", element: <ReportDetails /> },
      // เพิ่มเส้นทา��สำหรับ 404 Not Found
      { path: "/RMUTI/*", element: <NotFound /> }
      // อื่น ๆ ที่เฉพาะสำหรับผู้ใช้ที่เป็น Admin
    ]
  }
]);

// สร้าง Router สำหรับผู้ใช้ที่เข้าสู่ระบบแล้ว
export default function AppRouter() {
  const { user } = useAuth();

  // เช็คว่ามีข้อมูลผู้ใช้และมี role เป็น Admin หรือไม่
  const isAdmin = user?.role === "admin";

  // เลือก Router ตามสถานะการเข้าสู่ระบบและบทบาทของผู้ใช้
  const finalRouter = user ? (isAdmin ? adminRouter : userRouter) : guestRouter;

  // ส่ง Router ที่เลือกไปยัง RouterProvider เพื่อให้ระบบทำงาน
  return <RouterProvider router={finalRouter} />;
}


  
