import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function Herderadmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isReportsDropdownOpen, setIsReportsDropdownOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // ใช้ useNavigate ที่นี่

  const handleLogout = () => {
    logout(); // ออกจากระบบ
    navigate('/RMUTI/'); // หลังจาก logout ให้เปลี่ยนเส้นทางไปที่หน้า /RMUTI/
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleReportsDropdown = () => {
    setIsReportsDropdownOpen(!isReportsDropdownOpen);
  }
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="bg-gray-50 font-[Kanit]">
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-72 bg-white shadow-xl fixed h-full transition-all duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 z-10`}>
        <div className="p-6 border-b ">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className="fas fa-boxes text-lg" style={{ color: '#0F4C75' }} />
            </div>
            <span className="text-xl font-semibold text-gray-800">จัดการหลังบ้าน</span>
          </div>
        </div>
        <nav className="p-4 space-y-1.5">
          <div className="pb-2">
            <p className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">เมนูหลัก</p>
          </div>

          <Link to="/RMUTI/Dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
            <i className="fas fa-home w-5 transition-transform group-hover:scale-110" />
            <span className="font-medium">แดชบอร์ด</span>
          </Link>

          <Link to="/RMUTI/ManageTools" className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
            <i className="fas fa-box w-5 transition-transform group-hover:scale-110" />
            <span>จัดการอุปกรณ์</span>
          </Link>

          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
                <i className="fas fa-exchange-alt w-5 transition-transform group-hover:scale-110" />
                <span>รายการยืม-คืน</span>
              </div>
              <i className={`fas fa-chevron-down transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`${isDropdownOpen ? 'block' : 'hidden'} pl-11 mt-1 space-y-1`}>
              <Link to="/RMUTI/ListBorrow" className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200">
                <i className="fas fa-users w-5" />
                <span>รายชื่อคนยืมอุปกรณ์</span>
              </Link>
              <Link to="/RMUTI/ListReturn" className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200">
                <i className="fas fa-undo w-5" />
                <span>รายชื่อคนคืนอุปกรณ์</span>
              </Link>
            </div>
          </div>

          <Link to="/RMUTI/ManageUsers" className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
            <i className="fas fa-users w-5 transition-transform group-hover:scale-110" />
            <span>จัดการผู้ใช้</span>
          </Link>
 <div className="relative">
            <button
              onClick={toggleReportsDropdown}
              className="w-full flex items-center justify-between px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3">
               <i className="fas fa-chart-bar w-5 transition-transform group-hover:scale-110" />
                <span>รายงานการยืม-คืน</span>
              </div>
              <i className={`fas fa-chevron-down transform transition-transform duration-200 ${isReportsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`${isReportsDropdownOpen ? 'block' : 'hidden'} pl-11 mt-1 space-y-1`}>
              <Link to="/RMUTI/ReportBorrow" className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200">
                <i className="fas fa-file w-5" />
                <span>รายงานการยืมอุปกรณ์</span>
              </Link>
              <Link to="/RMUTI/ReportResults" className="flex items-center gap-2 px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200">
                <i className="fas fa-undo w-5" />
                <span>รายงานการคืนอุปกรณ์</span>
              </Link>
            </div>
          </div>
          {/* <Link to="/RMUTI/ReportResults" className="flex items-center gap-3 px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
            <i className="fas fa-chart-bar w-5 transition-transform group-hover:scale-110" />
            <span>รายงานการคืน</span>
          </Link> */}

          <div className="pt-4 pb-2">
            <p className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">บัญชี</p>
          </div>

          <a href="#" onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 group">
            <i className="fas fa-sign-out-alt w-5 transition-transform group-hover:scale-110" />
            <span>ออกจากระบบ</span>
          </a>
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
                >
                  <i className="fas fa-bars text-xl" />
                </button>
                <p className="text-gray-500">ใช้งานในสาขาครุศาสตร์อุตสาหกรรม คอมพิวเตอร์</p>
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
