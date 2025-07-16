import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

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
      await axios.delete(`http://localhost:5000/api/users/users/${userId}`, {
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

  const updateUser = async (userId, userData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/users/users/${userId}`,
        userData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      // อัปเดตข้อมูลใน state หากต้องการให้ข้อมูลบนหน้าจอเปลี่ยนแปลงทันที
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
        } else {
          toast.error(`เกิดข้อผิดพลาด: ${error.response.data.error}`);
        }
      } else {
        toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์");
      }
    }
  };

  // ฟังก์ชันสำหรับจัดการ submit ของแบบฟอร์มแก้ไข
  const handleEditSubmit = (e) => {
    e.preventDefault();
    const updatedUser = {
      student_id: e.target.student_id.value,
      year_of_study: e.target.year_of_study.value,
      student_name: e.target.student_name.value,
      student_email: e.target.student_email.value,
      password: e.target.password.value,
      phone: e.target.phone.value,
      role: e.target.role.value
    };
    updateUser(userToEdit.user_id, updatedUser);
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
    <div className="">
      <div className="lg:pl-72">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                ⚙️ จัดการผู้ใช้
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                คุณสามารถดูและจัดการผู้ใช้ทั้งหมดในระบบได้ที่นี่
              </p>
            </div>
          </div>
          {/* ตารางข้อมูล */}
          <div className="overflow-auto shadow-lg rounded-lg bg-white p-4">
            <table className="table w-full">
              <thead>
                <tr className="text-sm font-semibold text-gray-700 text-center">
                  <th>รหัสนักศึกษา</th>
                  <th>ชื่อนักศึกษา</th>
                  <th>ระดับชั้น</th>
                  <th>อีเมลนักศึกษา</th>
                  <th>รหัส</th>
                  <th>เบอร์</th>
                  <th>ระดับผู้ใช้</th>
                  <th>แก้ไข</th>
                  <th>ลบ</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length ? (
                  currentUsers.map((user) => (
                    <tr
                      key={user.user_id}
                      className="hover:bg-gray-100 transition-colors duration-300"
                    >
                      <td className="py-4 px-2 text-center">
                        {user.student_id}
                      </td>
                      <td className="py-4 px-2">{user.student_name}</td>
                      <td className="py-4 px-2 text-center">
                        {user.year_of_study}
                      </td>
                      <td className="py-4 px-2 text-center">
                        {user.student_email}
                      </td>
                      <td className="py-4 px-2 text-center">{user.password}</td>
                      <td className="py-4 px-2 text-center">{user.phone}</td>
                      <td className="py-4 px-2 text-center">
                        <div
                          className={`badge ${
                            user.role === "admin"
                              ? "badge-error "
                              : "badge-info "
                          }`}
                        >
                          {user.role === "admin" ? "admin " : "user"}
                        </div>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <button
                          onClick={() => openEditModal(user)}
                          className="btn btn-sm btn-info rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300"
                        >
                          แก้ไข
                        </button>
                      </td>
                      <td className="py-4 px-2 text-center">
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="btn btn-sm btn-error rounded-lg shadow-md hover:bg-red-600 transition-colors duration-300"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="text-center py-4 text-lg text-gray-500"
                    >
                      ไม่มีข้อมูลผู้ใช้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="btn btn-sm btn-outline px-4 mx-1"
            >
              «
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`btn btn-sm ${
                  currentPage === i + 1 ? "btn-primary" : "btn-outline"
                } px-4 mx-1`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="btn btn-sm btn-outline px-4 mx-1"
            >
              »
            </button>
          </div>

          {/* Delete Confirmation Modal */}
          {deleteModalOpen && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
                <h2 className="text-xl font-semibold mb-4">ยืนยันการลบ</h2>
                <p>
                  คุณต้องการลบผู้ใช้ {userToDelete?.student_name} ใช่หรือไม่?
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={closeDeleteModal}
                    className="btn btn-outline btn-sm mr-2"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={() => deleteUser(userToDelete?.user_id)}
                    className="btn btn-error btn-sm"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {editModalOpen && userToEdit && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
                <h2 className="text-xl font-semibold mb-4">แก้ไขผู้ใช้</h2>
                <form
                  onSubmit={handleEditSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {/* รหัสนักศึกษา */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold">
                      รหัสนักศึกษา
                    </label>
                    <input
                      type="text"
                      name="student_id"
                      defaultValue={userToEdit?.student_id}
                      className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                    />
                  </div>

                  {/* ชื่อนักศึกษา */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold">
                      ชื่อนักศึกษา
                    </label>
                    <input
                      type="text"
                      name="student_name"
                      defaultValue={userToEdit?.student_name}
                      className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                    />
                  </div>

                  {/* ระดับชั้น */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold">
                      ระดับชั้น
                    </label>
                    <input
                      type="text"
                      name="year_of_study"
                      defaultValue={userToEdit?.year_of_study}
                      className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                    />
                  </div>

                  {/* อีเมลนักศึกษา */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold">
                      อีเมลนักศึกษา
                    </label>
                    <input
                      type="email"
                      name="student_email"
                      defaultValue={userToEdit?.student_email}
                      className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                    />
                  </div>

                  {/* รหัสผ่าน */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold">
                      รหัสผ่าน
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      defaultValue={userToEdit?.password}
                      className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                    />
                    <div className="mt-1">
                      <input
                        type="checkbox"
                        className="mr-2 cursor-pointer rounded-md checkbox w-4 h-4"
                        onChange={togglePasswordVisibility}
                      />
                      <label className="text-sm text-gray-400">
                        Show Password
                      </label>
                    </div>
                  </div>

                  {/* เบอร์ติดต่อ */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold">
                      เบอร์ติดต่อ
                    </label>
                    <input
                      type="text"
                      name="phone"
                      defaultValue={userToEdit?.phone}
                      className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                    />
                  </div>

                  {/* ระดับผู้ใช้ */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold">
                      ระดับผู้ใช้
                    </label>
                    <select
                      name="role"
                      defaultValue={userToEdit?.role}
                      className="select select-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                    >
                      <option value="user">นักศึกษา</option>
                      <option value="admin">ดูแลระบบ</option>
                    </select>
                  </div>

                  {/* ปุ่ม */}
                  <div className="flex justify-end col-span-full mt-2">
                    <button
                      onClick={closeEditModal}
                      type="button"
                      className="btn btn-outline btn-sm mr-2"
                    >
                      ยกเลิก
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
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
