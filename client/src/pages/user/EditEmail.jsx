import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
        `http://localhost:5000/api/users/email/${userId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      closeEditModal();
      toast.success("แก้ไขสำเร็จ! ระบบจะออกจากระบบอัตโนมัติ", { autoClose: 2500 });

      // รอให้ toast แสดงครบก่อน logout และ redirect
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
    <div className="p-6  flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-indigo-600">
          แก้ไขอีเมลและรหัสผ่าน
        </h1>

        {user && (
          <div className="mb-4 text-center">
            <span className="font-semibold">อีเมลปัจจุบัน: </span>
            {user.student_email}
            <p className="text-sm text-red-500 mt-2">
              *หลังจากแก้ไข ระบบจะออกจากระบบอัตโนมัติ
            </p>
          </div>
        )}

        <button onClick={openEditModal} className="btn btn-primary w-full">
          แก้ไข
        </button>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-center text-indigo-600">
              แก้ไขอีเมลและรหัสผ่าน
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">อีเมลใหม่</label>
                <input
                  type="email"
                  name="student_email"
                  value={formData.student_email}
                  onChange={handleInputChange}
                  className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">
                  รหัสผ่านใหม่ (เว้นว่างหากไม่ต้องการเปลี่ยน)
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="เว้นว่างหากไม่ต้องการเปลี่ยน"
                  className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-semibold mb-1">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="กรุณายืนยันรหัสผ่าน"
                  className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                />
                <label className="flex items-center mt-2 cursor-pointer text-gray-600 text-sm">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={showPassword}
                    onChange={togglePasswordVisibility}
                  />
                  แสดงรหัสผ่าน
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEditModal}
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

      {/* Confirm Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center text-yellow-300">
              ยืนยันการแก้ไข
            </h3>
            <p className="text-center mb-6">
              คุณแน่ใจหรือไม่ว่าต้องการแก้ไขอีเมล/รหัสผ่าน? หลังจากยืนยัน ระบบจะออกจากระบบ
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={closeConfirmModal}
                className="btn btn-outline btn-warning w-24"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirm}
                className="btn btn-outline btn-success w-24"
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
    </div>
  );
}

export default EditEmail;
