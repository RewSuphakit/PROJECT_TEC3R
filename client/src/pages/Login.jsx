import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from "../hooks/useAuth";
import bg2 from '../assets/bg2.webp';
import { HiMail, HiLockClosed } from 'react-icons/hi';
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;


const Login = () => {
  const { setUser } = useAuth();
  const [student_email, setStudentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

 
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@rmuti\.ac\.th$/;
    return emailRegex.test(email);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!student_email || !password) {
      toast.warn('กรุณากรอกข้อมูลให้ครบทุกช่อง', { position: 'top-right' });
      return;
    }
  
    if (!validateEmail(student_email)) {
      toast.warn('กรุณาใช้อีเมล @rmuti.ac.th เท่านั้น', { position: 'top-right' });
      return;
    }

    setIsLoading(true); 
  
    try {
      const response = await axios.post(`${apiUrl}/api/users/login`, {
        student_email,
        password,
      });
  
      if (response.status === 200 || response.status === 201) {
        const { token, payload } = response.data;
  
    
        if (!payload || !payload.student_name) {
          throw new Error("ข้อมูลที่ส่งกลับไม่ถูกต้อง");
        }
  
        localStorage.setItem("token", token);
        setUser(payload);

        toast(
  <div>
    <div>ยินดีต้อนรับ,</div>
    <div className="font-bold">{payload.student_name}</div>
    <div>เข้าสู่ระบบสำเร็จ</div>
  </div>,
  {
    position: "top-right",
    autoClose: 3000,
    type: "success",
  }
);
  
        navigate('/RMUTI/');
      } else {
        throw new Error('Failed to log in. Please try again.');
      }
    } catch (error) {
      // ดักจับ Error ตาม status code
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.msg || 
                             error.response.data?.message || 
                             error.response.data?.error;

        if (status === 400) {
          // Error 400: Bad Request - ข้อมูลไม่ถูกต้อง (เช่น อีเมลหรือรหัสผ่านผิด)
          toast.error(errorMessage || 'ชื่อหรือรหัสผ่านไม่ถูกต้อง', { position: 'top-right' });
        } else if (status === 401) {
          // Error 401: Unauthorized
          toast.error('ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบใหม่', { position: 'top-right' });
        } else if (status === 500) {
          // Error 500: Server Error
          toast.error('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง', { position: 'top-right' });
        } else {
          // Other errors
          toast.error(errorMessage || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', { position: 'top-right' });
        }
      } else if (error.request) {
        // ไม่ได้รับ response จาก server (เช่น network error)
        toast.error('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต', { position: 'top-right' });
      } else {
        // Error อื่นๆ
        toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', { position: 'top-right' });
      }
    } finally {
      setIsLoading(false); // หยุด Loading
    }
  };

  return (
    <div 
      className="flex-1 flex items-center justify-center py-4" 
      style={{ 
        backgroundImage: `url(${bg2})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="w-full max-w-md px-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-[#0F4C75]">เข้าสู่ระบบ</h1>
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-400 text-sm">อีเมล</label>
              <div className="relative">
                <HiMail className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  id="email"
                  type="email"
                  value={student_email}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full border rounded-lg pl-10 pr-3 py-2 text-sm outline-none"
                  placeholder="กรุณากรอกอีเมลนักศึกษา"
                  aria-label="อีเมล"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-400 text-sm">รหัสผ่าน</label>
              <div className="relative">
                <HiLockClosed className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-lg pl-10 pr-3 py-2 text-sm outline-none"
                  placeholder="กรุณากรอกรหัสผ่าน"
                  aria-label="รหัสผ่าน"
                />
              </div>
              <div className="flex justify-between mt-2">
                <div>
                  <input
                    type="checkbox"
                    className="mr-2 cursor-pointer rounded-md checkbox w-4 h-4" 
                    onChange={togglePasswordVisibility}
                  />
                  <label className="text-sm text-gray-400">Show Password</label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 text-white rounded-lg transition duration-200 flex items-center justify-center gap-2 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#0F4C75] hover:bg-[#0D3A5F]'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;