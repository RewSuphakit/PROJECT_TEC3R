import React from 'react'; // นำเข้า React
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"; 
import useAuth from "../hooks/useAuth";
import LoginForm from "../pages/Login";
import RegisterForm from "../pages/Register";
import HomePage from "../pages/HomePage";
import NotFound from "../components/NotFound404";




const guestRouter = createBrowserRouter([
    {
      path: "/Rmuti/",
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
        { path: "/Rmuti/login", element: <LoginForm /> },
        // หน้าลงทะเบียน
        { path: "/Rmuti/register", element: <RegisterForm /> },
        // เพิ่มเส้นทางสำหรับ 404 Not Found
        { path: "*", element: <NotFound /> }
      ]
    }
  ]);
  
  // สร้าง Router สำหรับผู้ใช้ที่เข้าสู่ระบบแล้ว
  const userRouter = createBrowserRouter([
    {
      path: "/Rmuti/",
      element: (
        <>
          <Header />
          <Outlet />
          <Footer />
        </>
      ),
      children: [
        { index: true, element: <UserProduct /> },
        { path: "/Rmuti/UserProduct", element: <UserProduct /> },
        { path: "/Rmuti/ProductDetails/:id", element: <ProductDetails /> },
        { path: "/Rmuti/Cart/:id", element: <Cart /> },
        { path: "/Rmuti/Profile", element: <UserProfile /> },
        { path: "/Rmuti/*", element: <NotFound /> },
        
      ]
    }
  ]);
  
 // สร้าง Router สำหรับผู้ใช้ที่เป็น Admin
const adminRouter = createBrowserRouter([
  {
    path: "/Rmuti/",
    element: (
      <>
        <Navbar/>
        <Outlet />
      </>
    ),
    children: [
      // หน้าหลักสำหรับผู้ใช้ที่เป็น Admin
      { index: true, element: <Dashboard /> },
      { path: "/Rmuti/Dashboard", element: <Dashboard /> },
      { path: "/Rmuti/AddProductForm", element: <AddProductForm/> },
      { path: "/Rmuti/Dashboard", element: <Dashboard />},
      { path: "/Rmuti/ListProduct", element: <ListProduct /> },
      { path:"/Rmuti/EditProduct/:id",element :<EditProduct />},
      { path: "/Rmuti/*", element: <NotFound /> }
      // อื่น ๆ ที่เฉพาะสำหรับผู้ใช้ที่เป็น Admin
    ]
  }
]);

// ตรวจสอบสถานะการเข้าสู่ระบบของผู้ใช้และเลือก Router ที่เหมาะสม
export default function AppRouter() {
  const { user } = useAuth();

  // เช็คว่ามีข้อมูลผู้ใช้และมี role เป็น Admin หรือไม่
  const isAdmin = user?.role === "Admin";

  // เลือก Router ตามสถานะการเข้าสู่ระบบและบทบาทของผู้ใช้
  const finalRouter = user ? (isAdmin ? adminRouter : userRouter) : guestRouter;

  // ส่ง Router ที่เลือกไปยัง RouterProvider เพื่อให้ระบบทำงาน
  return <RouterProvider router={finalRouter} />;
}


  
