import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from "../hooks/useAuth";
const Login = () => {
  const { setUser } = useAuth();
  const [student_email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    try {
      e.preventDefault();
    if (!student_email || !password) {
      toast.warn('กรุณากรอกข้อมูลให้ครบทุกช่อง', {
        position: 'top-center',
      });
      return;
      }
      const response = await axios.post('http://localhost:5000/api/users/login', { student_email, password });
      localStorage.setItem('token', response.data.token);
     
     
     

     
      const userEmail = student_email;
      toast.success(`ยินดีต้อนรับ, ${userEmail}! เข้าสู่ระบบสำเร็จ`, {
        position: 'top-center',
      });
      

      navigate('/RMUTI/');
    } catch (error) {
      toast.error('ชื่อหรือรหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง', {
        position: 'top-center', 
      });
    }
  };


  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="relative mx-auto p-4 w-full max-w-md md:max-w-lg lg:max-w-xl">
        <div className="w-full px-8 py-8 bg-white rounded-lg shadow-md">
          <form onSubmit={handleLogin} className="flex flex-col justify-center items-center">
            <div className="flex flex-col items-center gap-2 mb-8">
              <p className="text-[20px] md:text-[24px] font-semibold text-[#0F4C75]">เข้าสู่ระบบ</p>
              <span className="text-sm md:text-xs max-w-[100%] text-center text-[#8B8E98]">
                กรุณาเข้าสู่ระบบก่อนใช้งาน &gt;
              </span>
            </div>
  
            <div className="w-full flex flex-col gap-2">
              <label className="text-[14px] md:text-[16px] text-gray-400">อีเมล</label>
              <div className="relative">
                <img
                  src="https://img.icons8.com/?size=100&id=59835&format=png&color=CDCDCD"
                  className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                  alt="email-icon"
                />
                <input
                  name="email"
                  value={student_email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border rounded-lg pl-10 pr-3 py-2 text-sm w-full outline-none bg-white text-black"
                  placeholder="กรุณากรอกอีเมลนักศึกษา"
                />
              </div>
            </div>
  
            <div className="w-full flex flex-col gap-2 mt-4">
              <label className="text-[14px] md:text-[16px] text-gray-400">รหัสผ่าน</label>
              <div className="relative">
                <img
                  src="https://img.icons8.com/?size=100&id=59825&format=png&color=CDCDCD"
                  className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                  alt="password-icon"
                />
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border rounded-lg pl-10 pr-3 py-2 text-sm w-full outline-none bg-white text-black"
                  placeholder="กรุณากรอกรหัสผ่าน"
                />
              </div>
            </div>
  
            <div className="w-full mt-6">
              <button
                type="submit"
                className="py-2 px-8 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg bg-[#0F4C75] hover:bg-[#0D3A5F]"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
