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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let token = localStorage.getItem('token');
        const response = await axios.get("http://localhost:5000/api/users/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(Array.isArray(response.data.users) ? response.data.users : []);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้");
        setUsers([]); 
      }
    };
    fetchUsers();
  }, []);
  const deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(user => user.user_id !== userId));
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

  const currentUsers = (users ?? []).slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
  const totalPages = Math.ceil(users.length / usersPerPage);

  return (
    <div className="min-h-screen container mx-auto py-8">
      <div className="lg:pl-72">
        <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">⚙️ จัดการผู้ใช้</h1>
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
                currentUsers.map(user => (
                  <tr key={user.user_id} className="hover:bg-gray-100 transition-colors duration-300  ">
                    <td className="py-4 px-2 text-center">{user.student_id}</td>
                    <td className="py-4 px-2">{user.student_name}</td>
                    <td className="py-4 px-2 text-center">{user.year_of_study}</td>
                    <td className="py-4 px-2 text-center">{user.student_email}</td>
                    <td className="py-4 px-2 text-center">{user.password}</td>
                    <td className="py-4 px-2 text-center">{user.phone}</td>
                    <td className="py-4 px-2 text-center">{user.role}</td>
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
                  <td colSpan="9" className="text-center py-4 text-lg text-gray-500">
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
              <p>คุณต้องการลบผู้ใช้ {userToDelete?.student_name} ใช่หรือไม่?</p>
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
        {editModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-lg">
              <h2 className="text-xl font-semibold mb-4">แก้ไขผู้ใช้</h2>
              <form>
                <div className="mb-4">
                  <label className="block text-sm font-semibold">ชื่อนักศึกษา</label>
                  <input
                    type="text"
                    defaultValue={userToEdit?.student_name}
                    className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold">อีเมลนักศึกษา</label>
                  <input
                    type="email"
                    defaultValue={userToEdit?.student_email}
                    className="input input-bordered w-full py-2 px-3 rounded-lg border border-gray-300"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={closeEditModal}
                    type="button"
                    className="btn btn-outline btn-sm mr-2"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm"
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
  );
}

export default ManageUsers;
