import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import bg2 from '../../assets/bg2.png';

function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 7;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // ดึงข้อมูลแอดมินที่กำลัง login อยู่
  const getCurrentUser = () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/users/users",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUsers(Array.isArray(response.data.users) ? response.data.users : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้");
      setUsers([]);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter((user) => user.user_id !== userId));
      toast.success("ลบผู้ใช้สำเร็จ");
      setDeleteModalOpen(false);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("ไม่ได้รับอนุญาต: กรุณาเข้าสู่ระบบใหม่");
        } else if (error.response.status === 403) {
          toast.error("ไม่มีสิทธิ์ในการลบผู้ใช้นี้");
        } else {
          toast.error(`เกิดข้อผิดพลาด: ${error.response.data.error}`);
        }
      } else {
        toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
      }
    }
  };

  const updateUser = async (userId, userData, originalEmail) => {
    try {
      const token = localStorage.getItem("token");
      const currentUser = getCurrentUser();
      
      await axios.put(
        `http://localhost:5000/api/users/admin/${userId}`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // ตรวจสอบว่าแอดมินกำลังแก้ไขอีเมลของตัวเองหรือไม่
      if (currentUser && currentUser.user_id === userId && userData.student_email !== originalEmail) {
        toast.warning("คุณได้เปลี่ยนอีเมลของตัวเอง กรุณาเข้าสู่ระบบใหม่ด้วยอีเมลใหม่", { autoClose: 3000 });
        
        // รอ 3 วินาทีแล้ว logout
        setTimeout(() => {
          localStorage.removeItem("token");
          navigate("/RMUTI/login");
        }, 3000);
        return;
      }
      
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.user_id === userId ? { ...user, ...userData } : user
        )
      );
      fetchUsers();
      toast.success("แก้ไขผู้ใช้สำเร็จ");
      setEditModalOpen(false);
      setUserToEdit(null);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("ไม่ได้รับอนุญาต: กรุณาเข้าสู่ระบบใหม่");
        } else if (error.response.status === 403) {
          toast.error("ไม่มีสิทธิ์ในการแก้ไขผู้ใช้นี้");
        } else if (error.response.status === 409) {
          toast.error("อีเมลนี้มีผู้ใช้งานแล้ว กรุณาใช้อีเมลอื่น");
        } else {
          toast.error(`เกิดข้อผิดพลาด: ${error.response.data.error}`);
        }
      } else {
        toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
      }
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const passwordValue = e.target.password.value;
    const originalEmail = userToEdit?.student_email; // เก็บอีเมลเดิมไว้เพื่อเปรียบเทียบ
    const updatedUser = {
      student_id: e.target.student_id.value,
      year_of_study: e.target.year_of_study.value,
      student_name: e.target.student_name.value,
      student_email: e.target.student_email.value,
      phone: e.target.phone.value,
      role: e.target.role.value
    };
    // ส่ง password เฉพาะเมื่อมีการกรอกรหัสผ่านใหม่เท่านั้น
    if (passwordValue && passwordValue.trim() !== '') {
      updatedUser.password = passwordValue;
    }
    updateUser(userToEdit.user_id, updatedUser, originalEmail);
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  const openEditModal = (user) => {
    setUserToEdit(user);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setUserToEdit(null);
  };

  const currentUsers = (users ?? []).slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundImage: `url(${bg2})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="lg:pl-72">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">⚙️ จัดการผู้ใช้</h1>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-auto shadow-lg rounded-lg bg-white p-4">
            <table className="table w-full">
              <thead>
                <tr className="text-sm font-semibold text-gray-700 text-center">
                  <th className="px-4 py-3">รหัสนักศึกษา</th>
                  <th className="px-4 py-3">ชื่อนักศึกษา</th>
                  <th className="px-4 py-3">ระดับชั้น</th>
                  <th className="px-4 py-3">อีเมลนักศึกษา</th>
                  <th className="px-4 py-3">เบอร์</th>
                  <th className="px-4 py-3">ระดับผู้ใช้</th>
                  <th className="px-4 py-3">แก้ไข</th>
                  <th className="px-4 py-3">ลบ</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length ? (
                  currentUsers.map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50">
                      <td className="py-4 px-2 text-center">{user.student_id}</td>
                      <td className="py-4 px-2 text-center">{user.student_name}</td>
                      <td className="py-4 px-2 text-center">{user.year_of_study}</td>
                      <td className="py-4 px-2 text-center">{user.student_email}</td>
                      <td className="py-4 px-2 text-center">{user.phone}</td>
                      <td className="py-4 px-2 text-center">
                        <span className={`badge text-white ${
                          user.role === "admin" ? "bg-blue-800" : 
                          user.role === "teacher" ? "bg-blue-500" : "bg-blue-300"
                        }`}>
                          {user.role === "admin" ? "ผู้ดูแลระบบ" : 
                           user.role === "teacher" ? "อาจารย์" : "นักศึกษา"}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <button
                          onClick={() => openEditModal(user)}
                          className="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white border-none rounded-lg shadow-md"
                        >
                          แก้ไข
                        </button>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none rounded-lg shadow-md"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-base text-gray-500">
                      ไม่มีข้อมูลผู้ใช้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {currentUsers.length ? (
              currentUsers.map((user) => (
                <div key={user.user_id} className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-800">
                        👤 {user.student_name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        รหัส: {user.student_id}
                      </p>
                    </div>
                    <span className={`badge text-white badge-sm sm:badge-md ${
                      user.role === "admin" ? "bg-red-500" : 
                      user.role === "teacher" ? "bg-purple-500" : "bg-blue-500"
                    }`}>
                      {user.role === "admin" ? "ผู้ดูแลระบบ" : 
                       user.role === "teacher" ? "อาจารย์" : "นักศึกษา"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ระดับชั้น:</span>
                      <span className="font-medium text-gray-800">{user.year_of_study}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">อีเมล:</span>
                      <span className="font-medium text-gray-800 break-all">{user.student_email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">เบอร์:</span>
                      <span className="font-medium text-gray-800">{user.phone}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openEditModal(user)}
                      className="flex-1 btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white border-none"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => openDeleteModal(user)}
                      className="flex-1 btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
                <div className="text-gray-400 text-5xl sm:text-6xl mb-4">👥</div>
                <p className="text-base sm:text-lg text-gray-500">ไม่มีข้อมูลผู้ใช้</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white border-none px-3 sm:px-4 disabled:bg-gray-300"
                >
                  «
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`btn btn-sm ${
                      currentPage === i + 1 
                        ? "bg-blue-500 hover:bg-blue-600 text-white border-none" 
                        : "btn-outline"
                    } px-3 sm:px-4`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white border-none px-3 sm:px-4 disabled:bg-gray-300"
                >
                  »
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {deleteModalOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50 p-4">
              <div className="bg-white p-4 sm:p-6 rounded-lg max-w-md w-full shadow-lg">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">ยืนยันการลบ</h2>
                <p className="text-xs sm:text-sm md:text-base">
                  คุณต้องการลบผู้ใช้ {userToDelete?.student_name} ใช่หรือไม่?
                </p>
                <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                  <button
                    onClick={closeDeleteModal}
                    className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none w-full sm:w-auto"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={() => deleteUser(userToDelete?.user_id)}
                    className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none w-full sm:w-auto"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {editModalOpen && userToEdit && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50 p-4">
              <div className="bg-white p-4 sm:p-6 rounded-lg max-w-2xl w-full shadow-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">แก้ไขผู้ใช้</h2>
                <form onSubmit={handleEditSubmit} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* รหัสนักศึกษา */}
                    <div className="flex flex-col">
                      <label className="block text-xs sm:text-sm font-semibold mb-1">รหัสนักศึกษา</label>
                      <input
                        type="text"
                        name="student_id"
                        defaultValue={userToEdit?.student_id}
                        className="input input-bordered input-sm sm:input-md w-full"
                      />
                    </div>

                    {/* ชื่อนักศึกษา */}
                    <div className="flex flex-col">
                      <label className="block text-xs sm:text-sm font-semibold mb-1">ชื่อนักศึกษา</label>
                      <input
                        type="text"
                        name="student_name"
                        defaultValue={userToEdit?.student_name}
                        className="input input-bordered input-sm sm:input-md w-full"
                      />
                    </div>

                    {/* ระดับชั้น */}
                    <div className="flex flex-col">
                      <label className="block text-xs sm:text-sm font-semibold mb-1">ระดับชั้น</label>
                      <input
                        type="text"
                        name="year_of_study"
                        defaultValue={userToEdit?.year_of_study}
                        className="input input-bordered input-sm sm:input-md w-full"
                      />
                    </div>

                    {/* อีเมลนักศึกษา */}
                    <div className="flex flex-col">
                      <label className="block text-xs sm:text-sm font-semibold mb-1">อีเมลนักศึกษา</label>
                      <input
                        type="email"
                        name="student_email"
                        defaultValue={userToEdit?.student_email}
                        className="input input-bordered input-sm sm:input-md w-full"
                      />
                    </div>

                    {/* รหัสผ่าน */}
                    <div className="flex flex-col">
                      <label className="block text-xs sm:text-sm font-semibold mb-1">รหัสผ่านใหม่</label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน"
                        className="input input-bordered input-sm sm:input-md w-full"
                      />
                      <div className="mt-2 flex items-center">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-xs sm:checkbox-sm mr-2"
                          onChange={togglePasswordVisibility}
                        />
                        <label className="text-xs sm:text-sm text-gray-600">แสดงรหัสผ่าน</label>
                      </div>

                    </div>

                    {/* เบอร์ติดต่อ */}
                    <div className="flex flex-col">
                      <label className="block text-xs sm:text-sm font-semibold mb-1">เบอร์ติดต่อ</label>
                      <input
                        type="text"
                        name="phone"
                        defaultValue={userToEdit?.phone}
                        className="input input-bordered input-sm sm:input-md w-full"
                      />
                    </div>

                    {/* ระดับผู้ใช้ */}
                    <div className="flex flex-col sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-semibold mb-1">ระดับผู้ใช้</label>
                      <select
                        name="role"
                        defaultValue={userToEdit?.role}
                        className="select select-bordered select-sm sm:select-md w-full"
                      >
                        <option value="user">นักศึกษา</option>
                        <option value="admin">ผู้ดูแลระบบ</option>
                        <option value="teacher">อาจารย์</option>
                      </select>
                    </div>
                  </div>

                  {/* ปุ่ม */}
                  <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 sm:mt-6">
                    <button
                      onClick={closeEditModal}
                      type="button"
                      className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none w-full sm:w-auto"
                    >
                      ยกเลิก
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none w-full sm:w-auto"
                    >
                      บันทึก
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageUsers;