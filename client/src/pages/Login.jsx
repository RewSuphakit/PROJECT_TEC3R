import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from "../hooks/useAuth";

const Login = () => {
  const { setUser } = useAuth();
  const [student_email, setStudentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!student_email || !password) {
      toast.warn('กรุณากรอกข้อมูลให้ครบทุกช่อง', { position: 'top-center' });
      return;
    }
  
    if (!validateEmail(student_email)) {
      toast.warn('รูปแบบอีเมลไม่ถูกต้อง', { position: 'top-center' });
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', {
        student_email,
        password,
      });
  
      if (response.status === 200 || response.status === 201) {
        const { token, payload } = response.data;
  
        // ตรวจสอบว่า payload มี student_name หรือไม่
        if (!payload || !payload.student_name) {
          throw new Error("ข้อมูลที่ส่งกลับไม่ถูกต้อง");
        }
  
        // เก็บ token และข้อมูลผู้ใช้
        localStorage.setItem('token', token);
        setUser(payload);
  
        // แสดงข้อความต้อนรับ
        toast.success(`ยินดีต้อนรับ, ${payload.student_name}! เข้าสู่ระบบสำเร็จ`, {
          position: 'top-right',
        });
  
        navigate('/RMUTI/');
      } else {
        throw new Error('Failed to log in. Please try again.');
      }
    } catch (error) {
      toast.error('ชื่อหรือรหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง', { position: 'top-center' });
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold text-[#0F4C75]">เข้าสู่ระบบ</h1>
              <p className="text-sm text-gray-500 mt-2">กรุณาเข้าสู่ระบบก่อนใช้งาน &gt;</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-400 text-sm">อีเมล</label>
              <div className="relative">
                <img
                  src="https://img.icons8.com/?size=100&id=59835&format=png&color=CDCDCD"
                  alt="email icon"
                  className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5"
                />
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
                <img
                  src="https://img.icons8.com/?size=100&id=59825&format=png&color=CDCDCD"
                  alt="password icon"
                  className="absolute top-1/2 left-3 -translate-y-1/2 w-5 h-5"
                />
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
                    <label className="text-sm  text-gray-400">Show Password</label>
                    </div>
                    </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#0F4C75] text-white rounded-lg hover:bg-[#0D3A5F] transition duration-200"
            >
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
