import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import bg2 from '../../assets/bg2.png';
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
function EditEmail() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const userId = user?.user_id;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    student_email: user?.student_email || "",
    password: "",
    confirm_password: "",
  });

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const openEditModal = () => setEditModalOpen(true);
  const closeEditModal = () => {
    setEditModalOpen(false);
    setShowPassword(false);
    setFormData((prev) => ({ ...prev, password: "", confirm_password: "" }));
  };

  const openConfirmModal = () => setConfirmModalOpen(true);
  const closeConfirmModal = () => setConfirmModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirm_password) {
      toast.error("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }
    openConfirmModal();
  };

  const handleConfirm = async () => {
    closeConfirmModal();
    try {
      const token = localStorage.getItem("token");
      const payload = { student_email: formData.student_email };
      if (formData.password) payload.password = formData.password;

      await axios.put(
        `${apiUrl}/api/users/email/${userId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      closeEditModal();
      toast.success("แก้ไขสำเร็จ! ระบบจะออกจากระบบอัตโนมัติ", { autoClose: 2500 });

      setTimeout(() => {
        logout();
        navigate("/RMUTI/login", { replace: true });
      }, 2600);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) toast.error("กรุณาเข้าสู่ระบบใหม่");
        else if (error.response.status === 403) toast.error("ไม่มีสิทธิ์ในการแก้ไข");
        else toast.error(`เกิดข้อผิดพลาด: ${error.response.data.error}`);
      } else {
        toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
      }
    }
  };

  return (
     <div className=" flex flex-col items-center justify-center p-4 relative overflow-hidden"
           style={{ backgroundImage: `url(${bg2})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
           >

     
    <div 
      className=" flex items-center justify-center p-6  min-h-screen ">
      <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all hover:shadow-3xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejo  in="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>  
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            แก้ไขข้อมูลส่วนตัว
          </h1>
        </div>

        {user && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium">อีเมล</p>
                <p className="text-lg font-semibold text-gray-800">{user.student_email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>หลังจากแก้ไข ระบบจะออกจากระบบอัตโนมัติ</span>
            </div>
          </div>
        )}

        <button 
          onClick={openEditModal} 
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          แก้ไขข้อมูล
        </button>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fadeIn">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl transform animate-slideUp">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mb-3">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                แก้ไขข้อมูล
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  อีเมลใหม่
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    name="student_email"
                    value={formData.student_email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    placeholder="example@rmuti.ac.th"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  รหัสผ่านใหม่
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ยืนยันรหัสผ่าน
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    placeholder="กรุณายืนยันรหัสผ่าน"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={showPassword}
                  onChange={togglePasswordVisibility}
                />
                <span className="text-sm text-gray-600">แสดงรหัสผ่าน</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl transform animate-bounceIn">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ยืนยันการแก้ไข
              </h3>
              <p className="text-gray-600">
                คุณแน่ใจหรือไม่ที่ต้องการแก้ไขข้อมูล?<br/>
                <span className="text-red-600 font-semibold">ระบบจะออกจากระบบอัตโนมัติ</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={closeConfirmModal}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:scale-105 transition-all"
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounceIn {
          0% { 
            opacity: 0;
            transform: scale(0.3);
          }
          50% { transform: scale(1.05); }
          100% { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out forwards;
        }
        .animate-bounceIn {
          animation: bounceIn 0.35s ease-out forwards;
        }
      `}</style>
    </div>
    </div>
  );
}

export default EditEmail;
