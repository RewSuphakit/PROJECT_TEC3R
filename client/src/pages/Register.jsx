import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import bg2 from '../assets/bg2.png';

const Register = () => {
  const navigate = useNavigate();
  const [student_email, setEmail] = useState("");
  const [student_name, setStudentName] = useState("");
  const [year_of_study, setStudentYear] = useState("");
  const [student_id, setStudentId] = useState("");
  const [phone, setStudentPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const [emailValid, setEmailValid] = useState(true);
  const [emailDuplicate, setEmailDuplicate] = useState(false);
  const [phoneValid, setPhoneValid] = useState(true);
  const [studentIdValid, setStudentIdValid] = useState(true);
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
  
  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !student_email ||
      !student_name ||
      !year_of_study ||
      !student_id ||
      !phone ||
      !password ||
      !role
    ) {
      toast.warn("กรุณากรอกข้อมูลให้ครบทุกช่อง", {
        position: "top-right"
      });
      return;
    }
    if (!student_email.endsWith("@rmuti.ac.th")) {
      setEmailValid(false);
      toast.warn("กรุณาใช้อีเมลที่ลงท้ายด้วย @rmuti.ac.th", {
        position: "top-center"
      });
      return;
    }

    // ตรวจสอบรหัสนักศึกษา 13 หลัก (รูปแบบ: 1xxxxxxxxxx-x)
    const studentIdPattern = /^\d{11}-\d{1}$/;
    if (!studentIdPattern.test(student_id)) {
      setStudentIdValid(false);
      toast.warn("กรุณากรอกรหัสนักศึกษาให้ถูกต้อง (รูปแบบ: 12345678901-2)", {
        position: "top-center"
      });
      return;
    }

    // ตรวจสอบเบอร์โทรให้ครบ 10 หลัก
    if (phone.length !== 10) {
      setPhoneValid(false);
      toast.warn("กรุณากรอกเบอร์โทรให้ครบ 10 หลัก", {
        position: "top-center"
      });
      return;
    }

    setEmailValid(true);
    setEmailDuplicate(false);
    setPhoneValid(true);
    setStudentIdValid(true);

    try {
      const response = await axios.post(`${apiUrl}/api/users/register`, {
        student_email,
        password,
        student_name,
        year_of_study,
        student_id,
        phone,
        role
      });
      setMessage(response.data.message);
      toast.success("สมัครสมาชิกสำเร็จ!", {
        position: "top-right"
      });
      navigate("/RMUTI/Login");
    } catch (error) {
      if (error.response?.data?.message === 'User with this email already exists') {
        setEmailDuplicate(true);
        toast.error("อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น", {
          position: "top-right"
        });
      } else {
        setMessage("การสมัครสมาชิกไม่สำเร็จ กรุณาลองอีกครั้ง");
        toast.error("การสมัครสมาชิกไม่สำเร็จ กรุณาลองอีกครั้ง", {
          position: "top-right"
        });
      }
    }
  };

  return (
    <div 
      className="flex-1 flex items-center justify-center bg-gray-100 py-4" 
      style={{ 
        backgroundImage: `url(${bg2})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="relative w-full max-w-lg mx-auto">
        <div className="w-full px-8 py-8 bg-white rounded-xl shadow-lg mb-10">
          <div className="flex flex-col justify-center items-center">
            <div className="flex flex-col items-center gap-3 mb-8">
              <p className="text-2xl font-semibold text-[#0F4C75] text-center">
                ลงทะเบียนผู้ใช้งาน
              </p>
            </div>
            <form
              className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={handleRegister}
            >
              {/* ชื่อจริง */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  ชื่อจริงผู้ใช้งาน
                </label>
                <div className="relative">
                  <img
                    src="https://img.icons8.com/?size=100&id=98957&format=png&color=CDCDCD"
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                    alt="name-icon"
                  />
                  <input
                    type="text"
                    id="student_name"
                    name="student_name"
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
                <label className="text-sm font-medium text-gray-600">
                  ชั้นปี
                </label>
                <div className="relative">
                  <img
                    src="https://img.icons8.com/?size=100&id=79387&format=png&color=CDCDCD"
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                    alt="year-icon"
                  />
                  <input
                    type="text"
                    id="year_of_study"
                    name="year_of_study"
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
                <label className="text-sm font-medium text-gray-600">
                  รหัสนักศึกษา
                </label>
                <div className="relative">
                  <img
                    src="https://img.icons8.com/?size=100&id=IU9d7JI9Ec9U&format=png&color=CDCDCD"
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                    alt="student-id-icon"
                  />
                  <input
                    type="text"
                    id="student_id"
                    name="student_id"
                    value={student_id}
                    maxLength={13}
                    onChange={(e) => {
                      // อนุญาตให้กรอกตัวเลขและ - เท่านั้น
                      const value = e.target.value.replace(/[^\d-]/g, '');
                      setStudentId(value);
                      setStudentIdValid(true);
                    }}
                    className={`w-full border rounded-lg pl-10 pr-4 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0F4C75] focus:outline-none ${
                      !studentIdValid ? "border-red-500 bg-red-50" : ""
                    }`}
                    placeholder="เช่น 12345678901-2"
                    aria-label="รหัสนักศึกษา"
                  />
                </div>
                {!studentIdValid && (
                  <p className="text-red-500 text-xs mt-1">รหัสนักศึกษาต้องเป็น 13 หลัก (รูปแบบ: 12345678901-2)</p>
                )}
              </div>

              {/* อีเมล */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  อีเมลนักศึกษา
                </label>
                <div className="relative">
                  <img
                    src="https://img.icons8.com/?size=100&id=qx71uoSIkCN3&format=png&color=CDCDCD"
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                    alt="email-icon"
                  />
                  <input
                    type="email"
                    id="student_email"
                    name="student_email"
                    value={student_email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailDuplicate(false);
                    }}
                    className={`w-full border rounded-lg pl-10 pr-4 py-2 text-sm bg-white focus:ring-2 
          focus:ring-[#0F4C75] focus:outline-none ${
            !emailValid || emailDuplicate ? "border-red-500 bg-red-50" : ""
          }`}
                    placeholder="กรุณากรอกอีเมลนักศึกษา"
                    aria-label="อีเมลนักศึกษา"
                  />
                </div>
                {emailDuplicate && (
                  <p className="text-red-500 text-xs mt-1">อีเมลนี้ถูกใช้งานแล้ว</p>
                )}
              </div>

              {/* รหัสผ่าน */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <img
                    src="https://img.icons8.com/?size=100&id=59825&format=png&color=CDCDCD"
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                    alt="password-icon"
                  />
                  <input
                    type="password"
                    id="password"
                    name="password"
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
                <label className="text-sm font-medium text-gray-600">
                  เบอร์โทร
                </label>
                <div className="relative">
                  <img
                    src="https://img.icons8.com/?size=100&id=78382&format=png&color=CDCDCD"
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                    alt="phone-icon"
                  />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phone}
                    maxLength={10}
                    onChange={(e) => {
                      // กรองให้กรอกได้เฉพาะตัวเลข
                      const value = e.target.value.replace(/\D/g, '');
                      setStudentPhone(value);
                      setPhoneValid(true);
                    }}
                    className={`w-full border rounded-lg pl-10 pr-4 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0F4C75] focus:outline-none ${
                      !phoneValid ? "border-red-500 bg-red-50" : ""
                    }`}
                    placeholder="กรุณากรอกเบอร์โทร"
                    aria-label="เบอร์โทร"
                  />
                </div>
                {!phoneValid && (
                  <p className="text-red-500 text-xs mt-1">กรุณากรอกเบอร์โทรให้ครบ 10 หลัก</p>
                )}
              </div>

              {/* บทบาท */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">ผู้ใช้งาน</label>
                <div className="relative">
                  <img
                    src="https://img.icons8.com/?size=100&id=23265&format=png&color=CDCDCD"
                    className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
                    alt="role-icon"
                  />
                  <select
                    name="role"
                    id="role"
                    value={role}
                    required
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-700 bg-white shadow-sm focus:ring-2 focus:ring-[#0F4C75] focus:border-[#0F4C75] focus:outline-none appearance-none"
                  >
                    <option className="text-gray-400" value="user">
                      นักศึกษา
                    </option>
                    <option className="text-gray-600" value="teacher">
                      อาจารย์
                    </option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* ปุ่มสมัครสมาชิก */}
              <div className="col-span-full">
                <button
                  type="submit"
                  className="w-full py-3 mt-2 text-white bg-[#0F4C75] hover:bg-[#0D3A5F] rounded-lg text-base font-medium transition ease-in-out duration-200 shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-[#0F4C75] focus:outline-none"
                >
                  สมัครสมาชิก
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;