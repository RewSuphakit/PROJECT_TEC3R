import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import bg2 from '../../assets/bg2.webp';
import { HiUserCircle, HiIdentification, HiUser, HiAcademicCap, HiPhone, HiPencilAlt } from 'react-icons/hi';
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
function EditProfile() {
  const { user, fetchUserProfile, logout } = useAuth();
  const navigate = useNavigate();
  const userId = user?.user_id;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [users, setUsers] = useState([]);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (user) {
      setUserToEdit(user);
    }
  }, [user]);

  // ป้องกันการ scroll เมื่อเปิด modal
  useEffect(() => {
    if (editModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [editModalOpen]);

  const openEditModal = () => {
    if (user) {
      setUserToEdit(user);
      setEditModalOpen(true);
    }
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setUserToEdit(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const phone = formData.get("phone");

    // Validate phone number - must be exactly 10 digits
    const phoneDigits = phone.replace(/\D/g, ""); // Remove non-digit characters
    if (phoneDigits.length !== 10) {
      setPhoneError("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
      toast.error("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
      return;
    }
    setPhoneError(""); // Clear error if valid

    const userData = {
      student_id: formData.get("student_id"),
      student_name: formData.get("student_name"),
      year_of_study: formData.get("year_of_study"),
      phone: phone,
    };

    await updateUser(userId, userData);
  };

  const updateUser = async (userId, userData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${apiUrl}/api/users/${userId}`, userData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.user_id === userId ? { ...u, ...userData } : u
        )
      );
      fetchUserProfile();
      toast.success("แก้ไขข้อมูลสำเร็จ");
      closeEditModal();
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("ไม่ได้รับอนุญาต: กรุณาเข้าสู่ระบบใหม่");
        } else if (error.response.status === 403) {
          toast.error("ไม่มีสิทธิ์ในการแก้ไขผู้ใช้นี้");
        } else {
          toast.error(`เกิดข้อผิดพลาด: ${error.response.data.error}`);
        }
      } else {
        toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
      }
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center p-2 relative w-full"
      style={{ backgroundImage: `url(${bg2})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Overlay */}
      {/* <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-0 "></div> */}
      {/* Profile Display Section */}
      <div className="bg-white rounded-xl p-5 z-10 max-w-3xl w-full">
        <div className="flex items-center gap-2 mb-2">
          <HiUserCircle className="w-16 h-16 text-blue-900" />
          <div>
            <h1 className="text-2xl font-bold text-blue-900">
              โปรไฟล์ของฉัน
            </h1>
          </div>
        </div>

        {user && (
          <div className="space-y-3">
            {/* รหัสนักศึกษา */}
            {user.role !== "teacher" && (
              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-100">
                <HiIdentification className="w-8 h-8 text-blue-700" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">รหัสนักศึกษา</p>
                  <p className="text-lg font-semibold text-gray-800">{user.student_id}</p>
                </div>
              </div>
            )}

            {/* ชื่อจริง (เปลี่ยนจาก ชื่อนักศึกษา เป็น ชื่อผู้ใช้งาน ถ้าเป็นอาจารย์) */}
            <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-100">
              <HiUser className="w-8 h-8 text-blue-700" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium">
                  {user.role === "teacher" ? "ชื่อผู้ใช้งาน" : "ชื่อนักศึกษา"}
                </p>
                <p className="text-lg font-semibold text-gray-800">{user.student_name}</p>
              </div>
            </div>

            {/* ระดับชั้น */}
            {user.role !== "teacher" && (
              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-100">
                <HiAcademicCap className="w-8 h-8 text-blue-700" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">ระดับชั้น</p>
                  <p className="text-lg font-semibold text-gray-800">{user.year_of_study}</p>
                </div>
              </div>
            )}

            {/* เบอร์ติดต่อ */}
            <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-100">
              <HiPhone className="w-8 h-8 text-blue-700" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium">เบอร์ติดต่อ</p>
                <p className="text-lg font-semibold text-gray-800">{user.phone}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={openEditModal}
          className="w-full mt-4 py-2 bg-gradient-to-r from-blue-900 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          แก้ไขข้อมูลส่วนตัว
        </button>

        {/* Back to Home Button */}
        <button
          onClick={() => navigate('/RMUTI')}
          className="w-full mt-3 py-2 bg-white text-gray-600 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          กลับหน้าหลักยืมอุปกรณ์
        </button>
      </div>

      {/* Edit Modal */}
      {editModalOpen && userToEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20   mb-3">
                <HiPencilAlt className="w-20 h-20 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">แก้ไขข้อมูลส่วนตัว</h2>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* รหัสนักศึกษา */}
                {userToEdit?.role !== "teacher" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      รหัสนักศึกษา
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiIdentification className="w-5 h-5 text-gray-300" />
                      </div>
                      <input
                        type="text"
                        name="student_id"
                        defaultValue={userToEdit?.student_id}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* ชื่อนักศึกษา */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {userToEdit?.role === "teacher" ? "ชื่อผู้ใช้งาน" : "ชื่อนักศึกษา"}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="student_name"
                      defaultValue={userToEdit?.student_name}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* ระดับชั้น */}
                {userToEdit?.role !== "teacher" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ระดับชั้น
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiAcademicCap className="w-5 h-5 text-gray-300" />
                      </div>
                      <input
                        type="text"
                        name="year_of_study"
                        defaultValue={userToEdit?.year_of_study}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* เบอร์ติดต่อ */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    เบอร์ติดต่อ
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={userToEdit?.phone}
                      pattern="[0-9]{10}"
                      maxLength={10}
                      placeholder="0XXXXXXXXX"
                      onChange={(e) => {
                        // Allow only digits
                        e.target.value = e.target.value.replace(/\D/g, "");
                        // Clear error when user starts typing
                        if (phoneError) setPhoneError("");
                      }}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 ${phoneError ? 'border-red-500 focus:border-red-500 focus:ring-red-100' : 'border-gray-200 focus:border-orange-500 focus:ring-orange-100'} focus:ring-4 transition-all outline-none`}
                      required
                    />
                  </div>
                  {phoneError && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {phoneError}
                    </p>
                  )}
                </div>
              </div>

              {/* ปุ่ม */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeEditModal}
                  type="button"
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-green-400 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Container */}
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
    </div>
  );
}

export default EditProfile;