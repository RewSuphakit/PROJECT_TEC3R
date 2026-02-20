import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { FaBoxes, FaHome, FaBox, FaExchangeAlt, FaChevronDown, FaUsers, FaUndo, FaChartBar, FaFile, FaSignOutAlt, FaBars } from 'react-icons/fa';

function Herderadmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/RMUTI/');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleReportsDropdown = () => {
    setIsReportsDropdownOpen(!isReportsDropdownOpen);
  }
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsSidebarOpen(false);
      }
    };
    if (isSidebarOpen) {
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <div className="bg-gray-50 font-[Kanit]">
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={closeSidebar}
          onTouchEnd={closeSidebar}
          style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
        />
      )}

      {/* Sidebar */}
      <aside ref={sidebarRef} className={`w-72 bg-white shadow-xl fixed h-full transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 z-10`}>
        <div className="p-6 border-b ">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FaBoxes className="text-lg" style={{ color: '#0F4C75' }} />
            </div>
            <span className="text-xl font-semibold text-gray-800">จัดการหลังบ้าน</span>
          </div>
        </div>
        <nav className="p-4 space-y-1.5">
          <div className="pb-2">
            <p className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">เมนูหลัก</p>
          </div>

          <Link to="/RMUTI/Dashboard" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
            <FaHome className="w-5 transition-transform group-hover:scale-110" />
            <span className="font-medium">แดชบอร์ด</span>
          </Link>

          <Link to="/RMUTI/ManageTools" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
            <FaBox className="w-5 transition-transform group-hover:scale-110" />
            <span>จัดการอุปกรณ์</span>
          </Link>

          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center gap-3">
                <FaExchangeAlt className="w-5 transition-transform group-hover:scale-110" />
                <span>รายการยืม-คืน</span>
              </div>
              <FaChevronDown className={`transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`${isDropdownOpen ? 'block' : 'hidden'} pl-11 mt-1 space-y-1`}>
              <Link to="/RMUTI/ListBorrow" onClick={closeSidebar} className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200">
                <FaUsers className="w-5" />
                <span>รายการยืมอุปกรณ์</span>
              </Link>
              <Link to="/RMUTI/ListReturn" onClick={closeSidebar} className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200">
                <FaUndo className="w-5" />
                <span>รายการคืนอุปกรณ์</span>
              </Link>
            </div>
          </div>

          <Link to="/RMUTI/ManageUsers" onClick={closeSidebar} className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
            <FaUsers className="w-5 transition-transform group-hover:scale-110" />
            <span>จัดการผู้ใช้</span>
          </Link>
 <div className="relative">
            <button
              onClick={toggleReportsDropdown}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex items-center gap-3">
               <FaChartBar className="w-5 transition-transform group-hover:scale-110" />
                <span>รายงานการยืม-คืน</span>
              </div>
              <FaChevronDown className={`transform transition-transform duration-200 ${isReportsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`${isReportsDropdownOpen ? 'block' : 'hidden'} pl-11 mt-1 space-y-1`}>
              <Link to="/RMUTI/Report" onClick={closeSidebar} className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200">
                <FaFile className="w-5" />
                <span>รายงานการยืม-คืน</span>
              </Link>
            </div>
          </div>
    

          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">บัญชี</p>
          </div>

          <button onClick={() => { handleLogout(); closeSidebar(); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 group" style={{ WebkitTapHighlightColor: 'transparent' }}>
            <FaSignOutAlt className="w-5 transition-transform group-hover:scale-110" />
            <span>ออกจากระบบ</span>
          </button>
        </nav>
      </aside>

      {/* Navbar */}
      <div className="lg:pl-72">
        <nav className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16  ">
              <div className="flex items-center gap-6">
                <button
                  onClick={toggleSidebar}
                  className="text-gray-500 hover:text-gray-600 lg:hidden focus:outline-none"
                  style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
                >
                  <FaBars className="text-xl" />
                </button>
                <p className="text-gray-500">ระบบการยืม-คืนอุปกรณ์ชุดฝึกการเรียนการสอน</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <span className="text-cyan-700 font-semibold">A</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{user?.student_email}</p>
                    <p className="text-xs text-gray-500">ผู้ดูแลระบบ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Herderadmin;

