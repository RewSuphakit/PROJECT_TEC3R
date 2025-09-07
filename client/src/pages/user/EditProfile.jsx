import React from 'react'
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditProfile() {
  const { user,fetchUserProfile } = useAuth();
  const userId = user.user_id;
  
  // State variables
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState([]); // State to hold all users

  // Load current user data when component mounts
  useEffect(() => {
    if (user) {
      setUserToEdit(user);
    }
  }, [user]);



  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Function to open edit modal
  const openEditModal = () => {
    if (user) {
      setUserToEdit(user);
      setEditModalOpen(true);
    }
  };

  // Function to close edit modal
  const closeEditModal = () => {
    setEditModalOpen(false);
    setUserToEdit(null);
    setShowPassword(false);
  };

  // Function to handle form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const userData = {
      student_id: formData.get('student_id'),
      student_name: formData.get('student_name'),
      year_of_study: formData.get('year_of_study'),
      student_email: formData.get('student_email'),
      password: formData.get('password'),
      phone: formData.get('phone')
    };

    // Remove empty password field if not changed
    if (!userData.password) {
      delete userData.password;
    }

    await updateUser(userId, userData);
  };

  // Function to update user
  const updateUser = async (userId, userData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/users/${userId}`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update users state if it exists
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user_id === userId ? { ...user, ...userData } : user
        )
      );
      fetchUserProfile();
      toast.success("แก้ไขผู้ใช้สำเร็จ");
      setEditModalOpen(false);
      setUserToEdit(null);
      setShowPassword(false);
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
    <div className="p-6">
      {/* Profile Display Section */}
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto mb-6">
        <h1 className="text-2xl font-bold mb-4">โปรไฟล์ของฉัน</h1>
        {user && (
          <div className="space-y-3">
            <div>
              <span className="font-semibold">รหัสนักศึกษา: </span>
              {user.student_id}
            </div>
            <div>
              <span className="font-semibold">ชื่อนักศึกษา: </span>
              {user.student_name}
            </div>
            <div>
              <span className="font-semibold">ระดับชั้น: </span>
              {user.year_of_study}
            </div>
            <div>
              <span className="font-semibold">อีเมล: </span>
              {user.student_email}
            </div>
            <div>
              <span className="font-semibold">เบอร์ติดต่อ: </span>
              {user.phone}
            </div>
          </div>
        )}
        <button
          onClick={openEditModal}
          className="btn btn-primary mt-4"
        >
          แก้ไขโปรไฟล์
        </button>
      </div>

      {/* Edit Modal */}
      {editModalOpen && userToEdit && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">แก้ไขผู้ใช้</h2>
            <form 
              onSubmit={handleEditSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* รหัสนักศึกษา */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold mb-1">
                  รหัสนักศึกษา
                </label>
                <input
                  type="text"
                  name="student_id"
                  defaultValue={userToEdit?.student_id}
                  className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                  required
                />
              </div>

              {/* ชื่อนักศึกษา */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold mb-1">
                  ชื่อนักศึกษา
                </label>
                <input
                  type="text"
                  name="student_name"
                  defaultValue={userToEdit?.student_name}
                  className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                  required
                />
              </div>

              {/* ระดับชั้น */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold mb-1">
                  ระดับชั้น
                </label>
                <input
                  type="text"
                  name="year_of_study"
                  defaultValue={userToEdit?.year_of_study}
                  className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                  required
                />
              </div>

              {/* อีเมลนักศึกษา */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold mb-1">
                  อีเมลนักศึกษา
                </label>
                <input
                  type="email"
                  name="student_email"
                  defaultValue={userToEdit?.student_email}
                  className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                  required
                />
              </div>

              {/* รหัสผ่าน */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold mb-1">
                  รหัสผ่าน (เว้นว่างหากไม่ต้องการเปลี่ยน)
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
                  className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                />
                <div className="mt-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="mr-2 cursor-pointer"
                      checked={showPassword}
                      onChange={togglePasswordVisibility}
                    />
                    <span className="text-sm text-gray-600">
                      แสดงรหัสผ่าน
                    </span>
                  </label>
                </div>
              </div>

              {/* เบอร์ติดต่อ */}
              <div className="flex flex-col">
                <label className="block text-sm font-semibold mb-1">
                  เบอร์ติดต่อ
                </label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={userToEdit?.phone}
                  className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                  required
                />
              </div>

              {/* ปุ่ม */}
              <div className="flex justify-end col-span-full mt-4 gap-2">
                <button
                  onClick={closeEditModal}
                  type="button"
                  className="btn btn-outline"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="btn btn-primary">
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
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
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