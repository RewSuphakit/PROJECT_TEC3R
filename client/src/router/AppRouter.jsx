import React from 'react'; // นำเข้า React
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"; 
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
  
 


  
