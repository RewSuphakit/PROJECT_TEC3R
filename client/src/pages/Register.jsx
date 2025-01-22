import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate} from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [student_email, setEmail] = useState('');
  const [student_name, setStudentName] = useState('');
  const [year_of_study, setStudentYear] = useState('');
  const [student_id, setStudentId] = useState('');
  const [phone, setStudentPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [emailValid, setEmailValid] = useState(true); // New state for email validation

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!student_email || !student_name || !year_of_study || !student_id || !phone || !password) {
      toast.warn('กรุณากรอกข้อมูลให้ครบทุกช่อง', {
        position: "top-center",
      });
      return;
    }
    if (!student_email.endsWith('@rmuti.ac.th')) {
      setEmailValid(false);
      toast.warn('กรุณาใช้อีเมลที่ลงท้ายด้วย @rmuti.ac.th', {
        position: "top-center",
      });
      return;
    }

    setEmailValid(true); // Reset email validity if correct

    try {
      const response = await axios.post('http://localhost:5000/api/users/register', {
        student_email,
        password,
        student_name,
        year_of_study,
        student_id,
        phone,
      });
      setMessage(response.data.message);
      toast.success('สมัครสมาชิกสำเร็จ!',{
        position: "top-center",
      });
      navigate("/RMUTI/Login")

    } catch (error) {
      setMessage('การสมัครสมาชิกไม่สำเร็จ กรุณาลองอีกครั้ง');
      toast.error('การสมัครสมาชิกไม่สำเร็จ กรุณาลองอีกครั้ง',{
        position: "top-center",
      });
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="relative w-full max-w-lg mx-auto">
        <div className="w-full px-8 py-8 bg-white rounded-xl shadow-lg">
          <div className="flex flex-col justify-center items-center">
            <div className="flex flex-col items-center gap-3 mb-8">
              <p className="text-2xl font-semibold text-[#0F4C75]">ลงทะเบียนผู้ใช้งาน</p>
              <span className="text-sm text-center text-gray-500">
                กรุณาสมัครสมาชิกก่อนใช้เข้างาน
              </span>
            </div>
            
            <form className="w-full space-y-4" onSubmit={handleRegister}>
              {/* ชื่อจริง */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">ชื่อจริงผู้ใช้งาน</label>
                <div className="relative">
                  <img
                    src="https://img.icons8.com/?size=100&id=98957&format=png&color=CDCDCD"
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                    alt="name-icon"
                  />
                  <input
                    type="text"
                    value={student_name}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0F4C75] focus:outline-none"
                    placeholder="กรุณากรอกชื่อผู้ใช้งาน"
                    aria-label="ชื่อจริงผู้ใช้งาน"
                  />
                </div>
              </div>
              {/* ชั้นปี */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">ชั้นปี</label>
                <div className="relative">
                  <img
                    src="https://img.icons8.com/?size=100&id=79387&format=png&color=CDCDCD"
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                    alt="year-icon"
                  />
                  <input
                    type="text"
                    value={year_of_study}
                    onChange={(e) => setStudentYear(e.target.value)}
                    className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0F4C75] focus:outline-none"
                    placeholder="กรุณากรอกชั้นปี"
                    aria-label="ชั้นปี"
                  />
                </div>
              </div>
              {/* รหัสนักศึกษา */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">รหัสนักศึกษา</label>
                <div className="relative">
                  <img
                    src="https://img.icons8.com/?size=100&id=IU9d7JI9Ec9U&format=png&color=CDCDCD"
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                    alt="student-id-icon"
                  />
                  <input
                    type="text"
                    value={student_id}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0F4C75] focus:outline-none"
                    placeholder="กรุณากรอกรหัสนักศึกษา"
                    aria-label="รหัสนักศึกษา"
                  />
                </div>
              </div>
              {/* อีเมล */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">อีเมลนักศึกษา</label>
                <div className="relative">
                  <img
                    src="https://img.icons8.com/?size=100&id=qx71uoSIkCN3&format=png&color=CDCDCD"
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                    alt="email-icon"
                  />
                  <input
                    type="email"
                    value={student_email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full border rounded-lg pl-10 pr-4 py-2 text-sm bg-white focus:ring-2 
                      focus:ring-[#0F4C75] focus:outline-none ${
                      !emailValid ? 'border-red-500' : ''
                    }`}
                    placeholder="กรุณากรอกอีเมลนักศึกษา"
                    aria-label="อีเมลนักศึกษา"
                  />
                </div>
              </div>
              {/* รหัสผ่าน */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">รหัสผ่าน</label>
                <div className="relative">
                  <img
                    src="https://img.icons8.com/?size=100&id=59825&format=png&color=CDCDCD"
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                    alt="password-icon"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0F4C75] focus:outline-none"
                    placeholder="กรุณากรอกรหัสผ่าน"
                    aria-label="รหัสผ่าน"
                  />
                </div>
              </div>
              {/* เบอร์โทร */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">เบอร์โทร</label>
                <div className="relative">
                  <img
                    src="https://img.icons8.com/?size=100&id=78382&format=png&color=CDCDCD"
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                    alt="phone-icon"
                  />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full border rounded-lg pl-10 pr-4 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0F4C75] focus:outline-none"
                    placeholder="กรุณากรอกเบอร์โทร"
                    aria-label="เบอร์โทร"
                  />
                </div>
              </div>
              {/* ปุ่มสมัครสมาชิก */}
              <button
                type="submit"
                className="w-full py-3 mt-6 text-white bg-[#0F4C75] hover:bg-[#0D3A5F] rounded-lg text-base font-medium transition ease-in-out duration-200 shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-[#0F4C75] focus:outline-none"
              >
                สมัครสมาชิก
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
