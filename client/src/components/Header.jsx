import logoTec from '../assets/LOGGG.png'

import register from '../assets/register.png'
import icon from '../assets/rmutikkc.png'
import ContactAdminModal from './ContactAdminModal';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
function Header() {
  const navigate = useNavigate();
  const { user, logout,borrowedCount} = useAuth();
  const handleLogout = () => {
    logout();
    navigate('/RMUTI/');
  }
  const [showContactModal, setShowContactModal] = useState(false);

  
  const userMenu = user?.user_id && (
    <>
     <li className="hover:border-l-4 hover:border-blue-500 py-2 px-2 ">
    <Link to="/RMUTI/EditProfile" className="flex items-center gap-3  ">
      <img
        className="w-6 h-6"
        src="https://img.icons8.com/?size=100&id=98957&format=png&color=374151"
        alt="user icon"
      />
      <p className='text-wrap'>ชื่อผู้ใช้: {user?.student_name}</p>
    </Link>
  </li>
  <li className="hover:border-l-4 hover:border-blue-500 py-2 px-2 text-wrap">
    <Link to ="/RMUTI/EditEmail" className="flex items-center gap-3">
      <img
        className="w-6 h-6"
        src="https://img.icons8.com/?size=100&id=59835&format=png&color=374151"
        alt="email icon"
      />
      อีเมล: {user?.student_email}
    </Link>
  </li>
  <li className="hover:border-l-4 hover:border-blue-500 py-2 px-2">
    <a href="/RMUTI/Return" className="flex justify-start  gap-3">
      <img
        className="w-6 h-6"
        src="https://img.icons8.com/?size=100&id=1846&format=png&color=374151"
        alt="history icon"
      />
      <div >คืนอุปกรณ์</div>
      {borrowedCount <= 0  ? null : (
      <div className="badge badge-error">{borrowedCount}</div>
      )}
    </a>
   </li>
    <li className="hover:border-l-4 hover:border-blue-500 py-2 px-2">
    <a href="/RMUTI/History" className="flex justify-start  gap-3">
      <img
        className="w-6 h-6"
        src="https://img.icons8.com/?size=100&id=6904&format=png&color=000000"
        alt="history icon"
      />
      <div >ประวัติการยืม/คืน</div>
    </a>
     </li>
  <li className="hover:border-l-4 hover:border-blue-500 py-2 px-2">
    <button className="flex items-center gap-3 w-full text-left" onClick={() => setShowContactModal(true)}>
      <img
        className="w-6 h-6"
        src="https://img.icons8.com/?size=100&id=2817&format=png&color=374151"
        alt="contact admin icon"
      />
      ติดต่อแอดมิน
    </button>
  </li>

  



  <li className="hover:border-l-4 hover:border-blue-500 py-2 px-2">
    <button   onClick={handleLogout}  className="flex items-center gap-3">
      <img
        className="w-6 h-6"
        src="https://img.icons8.com/?size=100&id=2445&format=png&color=374151"
        alt="logout icon"
      />
      ออกจากระบบ
    </button>
  </li>
    </>

  
  );
  return (
    <section className="w-full text-gray-700 sticky top-0 z-50">
      {/* Gradient Background for Header */}
      <nav className="navbar shadow-lg  border-gray-200/50 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-50 via-white to-slate-50  ">
        
        {/* Logo Container - Modern Layout */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Logo Image */}
          <div className="flex-shrink-0">
            <img 
              className="rounded-lg w-12 h-12 sm:w-20 sm:h-16 md:w-32 md:h-24 lg:w-[180px] lg:h-[90px] object-contain drop-shadow-sm" 
              src={logoTec} 
              alt="logo" 
            />
          </div>
          
          {/* Brand Text */}
          <a href="/RMUTI/" className="flex flex-col justify-center">
            {/* RMUTI KKC - Stylized */}
            <div className="flex items-baseline gap-1 sm:gap-2">
              <span className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
                RMUTI
              </span>
              <span className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-800 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
                KKC
              </span>
            </div>
            
            {/* Subtitle - Elegant display */}
            <div className="hidden sm:block">
              <p className="text-xs md:text-sm text-gray-600 font-semibold tracking-wide">
                ระบบการยืม-คืนอุปกรณ์
              </p>
              <p className="text-[10px] md:text-xs text-gray-500 font-medium">
                สาขาครุศาสตร์อุตสาหกรรมคอมพิวเตอร์
              </p>
            </div>
          </a>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>
        
        {/* Menu Section */}
        <div className="dropdown dropdown-end">
          {user?.user_id && (
            <>
              <div className="flex items-center gap-2 sm:gap-4">
                {/* User role badge */}
                <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium">
                    {user?.role === "user" 
                      ? "นักศึกษา" 
                      : user?.role === "teacher" 
                        ? "อาจารย์" 
                        : "ผู้ใช้งาน"}
                  </p>
                </div>

                <div className="relative">
                  <label
                    tabIndex={0}
                    className="btn btn-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-md hover:shadow-lg transition-all duration-200 gap-1 sm:gap-2"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                    <span className="hidden sm:inline">เมนู</span>
                  </label>
                  {borrowedCount <= 0 ? null : (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 sm:h-5 sm:w-5 bg-red-500 text-white text-[10px] sm:text-xs items-center justify-center font-bold">
                        {borrowedCount}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              <ul className="menu menu-sm dropdown-content mt-3 p-3 shadow-xl bg-white rounded-2xl w-60 z-10 border border-gray-100">
                {userMenu}
              </ul>
            </>
          )}
          
          {!user?.user_id && (
            <>
              {/* Mobile Menu - Modern Design */}
              <div className="dropdown dropdown-end sm:hidden">
                <label
                  tabIndex={0}
                  className="btn btn-sm bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 gap-2 px-4"
                >
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                  <span className="text-xs font-semibold">เมนู</span>
                </label>
                
                <div className="dropdown-content mt-3 p-4 shadow-2xl bg-white/95 backdrop-blur-lg rounded-3xl w-64 z-10 border border-orange-100">
                  {/* Header */}
                  <div className="text-center mb-4 pb-3 border-b border-orange-100">
                    <p className="text-sm font-bold text-gray-800">ยินดีต้อนรับ</p>
                    <p className="text-xs text-gray-500">เลือกเพื่อเริ่มต้นใช้งาน</p>
                  </div>
                  
                  {/* Login Card */}
                  <Link 
                    to="/RMUTI/Login" 
                    onClick={() => document.activeElement.blur()}
                    className="block mb-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-orange-300/50">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">เข้าสู่ระบบ</p>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Register Card */}
                  <Link 
                    to="/RMUTI/Register" 
                    onClick={() => document.activeElement.blur()}
                    className="block p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-md group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-300/50">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">สมัครใช้งาน</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Desktop Buttons */}
              <div className="hidden sm:flex items-center gap-3">
                <Link 
                  to="/RMUTI/Login" 
                  className="btn btn-md btn-ghost text-orange-500 hover:bg-orange-50 flex items-center gap-2 font-semibold transition-all duration-200 px-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-base">เข้าสู่ระบบ</span>
                </Link>
        
                <Link
                  to="/RMUTI/Register"
                  className="btn btn-md bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-md hover:shadow-lg flex items-center gap-2 transition-all duration-200 px-4"
                >
                  <img className="w-5 h-5" src={register} alt="register-icon" />
                  <span className="text-base font-semibold">สมัครใช้งาน</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </nav>
      <ContactAdminModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
    </section>

  )
}

export default Header