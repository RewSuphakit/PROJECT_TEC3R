import React from 'react'
import logofix from '../assets/logofix.png'
import register from '../assets/register.png'
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
function Header() {
  const navigate = useNavigate();
  return (

    // ยังไม่ได้ลล็อคอิน
    <section className="w-full bg-white text-gray-700 sticky top-0 z-50">
  <nav className="navbar bg-white shadow-md  border-b border-gray-200 ">
    <div className="container mx-auto flex flex-wrap items-center justify-around">
      {/* Logo Section */}
      <div className="flex items-center">
        <a href="/RMUTI/" className="flex items-center">
          <img className="rounded-md " src={logofix} alt="logo" />
        </a>
      </div>
       
      {/* Login and Register Buttons */}
      <div className="flex space-x-4">
        {/* Login Button */}
        <Link to="/RMUTI/Login" className="btn btn-ghost text-gray-600  flex items-center space-x-2">
          <img
            className="rounded-md w-5 h-5"
            src="https://img.icons8.com/?size=100&id=98957&format=png&color=0F4C75"
            alt="login-icon"
          />
          <span>เข้าสู่ระบบ</span>
       </Link>

        {/* Register Button */}
        <Link
          to="/RMUTI/Register"
          className="btn bg-[#0F4C75] text-white hover:bg-teal-500 border-0 flex items-center space-x-2"
        >
          <img className="w-5 h-5" src={register} alt="register-icon" />
          <span>สมัครใช้งาน</span>
        </Link>
      </div>
    </div>
  </nav>
</section>



<section>











</section>



<section>




</section>



































  )
}

export default Header
