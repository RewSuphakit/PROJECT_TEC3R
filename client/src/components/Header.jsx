import logoTec from '../assets/LOGGG.png'
import register from '../assets/register.png'
import ContactAdminModal from './ContactAdminModal';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import { HiUser, HiMail, HiRefresh, HiClock, HiPhone, HiLogout } from 'react-icons/hi';

function Header() {
  const navigate = useNavigate();
  const { user, logout,borrowedCount} = useAuth();
  const handleLogout = () => {
    logout();
    navigate('/RMUTI/');
  }
  const [showContactModal, setShowContactModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const guestMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (guestMenuRef.current && !guestMenuRef.current.contains(e.target)) {
        setGuestMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const closeMenu = () => setMenuOpen(false);

  
  const userMenu = user?.user_id && (
    <>
    <li className="hover:border-l-4 hover:border-blue-500 py-2 px-2 transition-all duration-150">
      <Link to="/RMUTI/EditProfile" onClick={closeMenu} className="flex items-center gap-3">
        <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <HiUser className="w-4 h-4 text-blue-600" />
        </div>
        <p className='text-wrap text-sm'>ชื่อผู้ใช้: {user?.student_name}</p>
      </Link>
    </li>
    <li className="hover:border-l-4 hover:border-blue-500 py-2 px-2 transition-all duration-150">
      <Link to="/RMUTI/EditEmail" onClick={closeMenu} className="flex items-center gap-3">
        <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
          <HiMail className="w-4 h-4 text-indigo-600" />
        </div>
        <p className='text-wrap text-sm'>อีเมล: {user?.student_email}</p>
      </Link>
    </li>
    <li className="hover:border-l-4 hover:border-orange-500 py-2 px-2 transition-all duration-150">
      <Link to="/RMUTI/Return" onClick={closeMenu} className="flex items-center gap-3">
        <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
          <HiRefresh className="w-4 h-4 text-orange-600" />
        </div>
        <span className="text-sm">คืนอุปกรณ์</span>
        {borrowedCount > 0 && (
          <div className="badge badge-error badge-sm">{borrowedCount}</div>
        )}
      </Link>
    </li>
    <li className="hover:border-l-4 hover:border-blue-500 py-2 px-2 transition-all duration-150">
      <Link to="/RMUTI/History" onClick={closeMenu} className="flex items-center gap-3">
        <div className="w-7 h-7 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
          <HiClock className="w-4 h-4 text-cyan-600" />
        </div>
        <span className="text-sm">ประวัติการยืม/คืน</span>
      </Link>
    </li>
    <li className="hover:border-l-4 hover:border-green-500 py-2 px-2 transition-all duration-150">
      <button className="flex items-center gap-3 w-full text-left" onClick={() => { setShowContactModal(true); closeMenu(); }}>
        <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <HiPhone className="w-4 h-4 text-green-600" />
        </div>
        <span className="text-sm">ติดต่อผู้ดูแลระบบ</span>
      </button>
    </li>
    <li className="hover:border-l-4 hover:border-red-500 py-2 px-2 transition-all duration-150">
      <button onClick={() => { handleLogout(); closeMenu(); }} className="flex items-center gap-3">
        <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
          <HiLogout className="w-4 h-4 text-red-500" />
        </div>
        <span className="text-sm text-red-500">ออกจากระบบ</span>
      </button>
    </li>
    </>
  );

  return (
    <section className="w-full text-gray-700 sticky top-0 z-50">
      {/* Gradient Background for Header */}
      <nav className="navbar shadow-lg  border-gray-200/50 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-50 via-white to-slate-50 font-[Kanit]">
        
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
        <div className="relative">
          {user?.user_id && (
            <div ref={menuRef} className="relative">
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
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
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
                  </button>
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

              {menuOpen && (
                <ul className="menu menu-sm absolute right-0 mt-3 p-3 shadow-2xl bg-white/95 backdrop-blur-lg rounded-2xl w-72 z-10 border border-gray-100">
                  {userMenu}
                </ul>
              )}
            </div>
          )}
          
          {!user?.user_id && (
            <>
              {/* Mobile Menu - Modern Design */}
              <div ref={guestMenuRef} className="relative sm:hidden">
                <button
                  onClick={() => setGuestMenuOpen(!guestMenuOpen)}
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
                </button>
                
                {guestMenuOpen && (
                <div className="absolute right-0 mt-3 p-4 shadow-2xl bg-white/95 backdrop-blur-lg rounded-3xl w-64 z-10 border border-orange-100">
                  {/* Header */}
                  <div className="text-center mb-4 pb-3 border-b border-orange-100">
                    <p className="text-sm font-bold text-gray-800">ยินดีต้อนรับ</p>
                    <p className="text-xs text-gray-500">เลือกเพื่อเริ่มต้นใช้งาน</p>
                  </div>
                  
                  {/* Login Card */}
                  <Link 
                    to="/RMUTI/Login" 
                    onClick={() => setGuestMenuOpen(false)}
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
                    onClick={() => setGuestMenuOpen(false)}
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
                )}
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