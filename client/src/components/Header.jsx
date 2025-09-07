import logofix from '../assets/logofix.png'
import register from '../assets/register.png'
import icon from '../assets/rmutikkc.png'
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
function Header() {
  const navigate = useNavigate();
  const { user, logout,borrowedCount} = useAuth();
  const handleLogout = () => {
    logout();
    navigate('/RMUTI/');
  }

  
  const userMenu = user?.user_id && (
    <>
     <li className="hover:border-l-4 hover:border-blue-500 py-2 px-2 ">
    <Link to="/RMUTI/EditProfile" className="flex items-center gap-3 truncate">
      <img
        className="w-6 h-6"
        src="https://img.icons8.com/?size=100&id=98957&format=png&color=374151"
        alt="user icon"
      />
      ชื่อผู้ใช้: {user?.student_name}
    </Link>
  </li>
  <li className="hover:border-l-4 hover:border-blue-500 py-2 px-2">
    <Link to ="#" className="flex items-center gap-3">
      <img
        className="w-6 h-6"
        src="https://img.icons8.com/?size=100&id=59835&format=png&color=374151"
        alt="email icon"
      />
      อีเมลผู้ใช้งาน: {user?.student_email}
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
    <a href="https://www.facebook.com/ci.r.sakdi.phimph.kha.hil" className="flex items-center gap-3">
      <img
        className="w-6 h-6"
        src="https://img.icons8.com/?size=100&id=2817&format=png&color=374151"
        alt="contact admin icon"
      />
      ติดต่อแอดมิน
    </a>
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

  
    <section className="w-full  text-gray-700 sticky top-0 z-50" style={{backgroundColor: '#e3eeff'}}>
  <nav className="navbar e shadow-md  border-b border-gray-200 ">
    <div className="container mx-auto flex flex-wrap items-center justify-around">
      {/* Logo Section */}
      <div className="flex items-center">
        <a href="/RMUTI/" className="flex items-center">
        <div className="flex flex-col ">
        <div>
          <div className="text-5xl font-bold text-orange-500">RMUTI</div>
          {/* <div><img className="rounded-md w-16 h-16" src={icon} alt="logo" /></div> */}
        </div>
      
        
          <div className="flex items-center space-x-2">   
            <p className="text-sm text-black-100 font-bold">ระบบการยืม-คืนอุปกรณ์ชุดฝึกการเรียนการสอน</p>
            </div>
         <div className="flex items-center space-x-2">
          <p className="text-sm text-black-100 font-bold">ใช้งานในสาขาครุศาสตร์อุตสาหกรรมคอมพิวเตอร์</p>
          </div>
         </div>
          {/* <img className="rounded-md " src={logofix} alt="logo" /> */}
        </a>
      </div>
      
      
      <div className="dropdown dropdown-end">
            {user?.user_id && (
              <>
              <div className="flex items-center space-x-4">
  <p className="text-gray-700 text-sm font-medium">ผู้ใช้งาน : นักศึกษา</p>

  <div className="relative">
    <label
      tabIndex={0}
      className="btn btn-outline btn-sm pr-3 cursor-pointer"
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
          d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        />
      </svg>
      เมนู
    </label>
    {borrowedCount <= 0  ? null : (
      <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-500"></span>
    )}
  </div>
</div>

                <ul className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-white rounded-box w-52 z-10">
                   {userMenu}
                </ul>
              
              </>
            )}
            {!user?.user_id && (
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
            )}
            </div>
       
    </div>
  </nav>
</section>

  )
}

export default Header
