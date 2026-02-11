import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DeleteModal from "./DeleteModal";
import EditModal from "./EditModal";
import bg2 from '../../assets/bg2.png';

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

import './AdminStyles.css';

function ManageTools() {
  const [tools, setTools] = useState([]);
  const [popupImage, setPopupImage] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const toolsPerPage = 10;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState(null);
  const [toolToEdit, setToolToEdit] = useState(null);

  const fetchTools = async (page = currentPage) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${apiUrl}/api/equipment/equipment/?page=${page}&limit=${toolsPerPage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTools(response.data.equipment);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
        setTotalCount(response.data.pagination.totalCount);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์");
    }
  }; 
  
  useEffect(() => {
    fetchTools(currentPage);
  }, [currentPage]);

  const deleteTool = async (equipmentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${apiUrl}/api/equipment/equipment/${equipmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTools((prevTools) =>
        prevTools.filter((tool) => tool.equipment_id !== equipmentId)
      );
      toast.success("ลบอุปกรณ์สำเร็จ");
      setDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการลบอุปกรณ์");
    }
  };

  const updateTool = async (e) => {
    e.preventDefault();
  
    const currentTool = toolToEdit;
    if (!currentTool) {
      toast.error("ไม่พบข้อมูลอุปกรณ์ที่ต้องการอัพเดต");
      return;
    }

    // ตรวจสอบประเภทไฟล์ก่อนส่ง
    const file = e.target.image.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("รองรับเฉพาะไฟล์รูปภาพประเภท .jpg, .jpeg, .png เท่านั้น");
        return;
      }
    }
  
    try {
      const formData = new FormData();
      formData.append("equipment_name", e.target.equipment_name.value);
      formData.append("total_quantity", e.target.total_quantity.value);
  
      if (file) {
        formData.append("image", file);
      }
  
      const token = localStorage.getItem('token');
      await axios.put(
        `${apiUrl}/api/equipment/equipment/${currentTool.equipment_id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } }
      );
  
      // ดึงข้อมูลใหม่จาก server เพื่อให้แน่ใจว่าได้ข้อมูลที่ถูกต้อง
      await fetchTools(currentPage);
      
      toast.success("อัพเดตอุปกรณ์สำเร็จ");
      setEditModalOpen(false);
      setToolToEdit(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "";
      if (errorMessage.includes("Only .jpg") || errorMessage.includes("allowed")) {
        toast.error("รองรับเฉพาะไฟล์รูปภาพประเภท .jpg, .jpeg, .png เท่านั้น");
      } else if (errorMessage.includes("ชื่ออุปกรณ์")) {
        toast.error(errorMessage, { toastId: 'duplicate-equipment' });
      } else {
        toast.error("เกิดข้อผิดพลาดในการอัพเดตอุปกรณ์");
      }
    }
  };
  
  const toggleToolStatus = async (tool) => {
    const newStatus = tool.status === "Available" ? "Unavailable" : "Available";
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${apiUrl}/api/equipment/equipment/${tool.equipment_id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTools((prevTools) =>
        prevTools.map((t) =>
          t.equipment_id === tool.equipment_id ? { ...t, status: newStatus } : t
        )
      );
      const thaiStatus = newStatus === "Available" ? "พร้อมใช้งาน" : "ไม่พร้อมใช้งาน";
      newStatus === "Available"
        ? toast.success(`เปลี่ยนสถานะเป็น ${thaiStatus}`)
        : toast.warn(`เปลี่ยนสถานะเป็น ${thaiStatus}`);
    } catch (error) {
      toast.error("ไม่สามารถเปลี่ยนสถานะได้");
    }
  };

  const openDeleteModal = (tool) => {
    setToolToDelete(tool);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setToolToDelete(null);
  };

  const openEditModal = (tool) => {
    setToolToEdit(tool);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setToolToEdit(null);
  };

  const handleImageMouseEnter = (e, imageUrl) => {
    const rect = e.target.getBoundingClientRect();
    setPopupImage(imageUrl);
    setPopupPosition({ x: rect.right + 10, y: rect.top });
  };
  
  const handleImageMouseLeave = () => {
    setPopupImage(null);
  };

  return (
    <>

      <div className="relative" style={{ 
            minHeight: '100vh', 
            backgroundImage: `url(${bg2})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}>
        <div className="lg:pl-72">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
            
            {/* Header Section */}
            <div className="filter-card rounded-2xl p-6 mb-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                      จัดการอุปกรณ์
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">เพิ่ม ลบ แก้ไข รายการอุปกรณ์ในระบบ</p>
                  </div>
                </div>
              </div>
            </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden shadow-2xl rounded-2xl bg-white">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-slate-100 text-slate-700 uppercase text-sm leading-normal">
                  <th className="py-4 px-6 text-center font-semibold">รหัส</th>
                  <th className="py-4 px-6 text-left font-semibold">ชื่ออุปกรณ์</th>
                  <th className="py-4 px-6 text-center font-semibold">จำนวน</th>
                  <th className="py-4 px-6 text-center font-semibold">สถานะ</th>
                  <th className="py-4 px-6 text-center font-semibold">รูปภาพ</th>
                  <th className="py-4 px-6 text-center font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {tools.length ? (
                  tools.map((tool) => (
                    <tr
                      key={tool.equipment_id}
                      className="table-row border-b hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="py-4 px-6 text-center">
                        <span className="bg-blue-100 text-[#0F4C75] px-3 py-1 rounded-full text-sm font-medium">
                          #{tool.equipment_id}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-800">{tool.equipment_name}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                          {tool.available_quantity} / {tool.total_quantity}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <span className={`text-xs font-semibold ${tool.status === "Available" ? "text-green-600" : "text-yellow-600"}`}>
                            {tool.status === "Available" ? "พร้อม" : "ไม่พร้อม"}
                          </span>
                          <input
                            type="checkbox"
                            className={`toggle toggle-sm ${
                              tool.status === "Available"
                              ? "toggle-success"
                              : "toggle-warning"
                            }`}
                            checked={tool.status === "Available"}
                            onChange={() => toggleToolStatus(tool)}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-6 flex justify-center">
                        <img
                          src={`${apiUrl}/uploads/${tool.image}`}
                          alt={tool.equipment_name}
                          className="w-12 h-12 rounded-lg object-cover border-2 border-gray-100 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                          onMouseEnter={(e) => handleImageMouseEnter(e, `${apiUrl}/uploads/${tool.image}`)}
                          onMouseLeave={handleImageMouseLeave}
                        />
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => openEditModal(tool)}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg shadow hover:shadow-lg transition-all hover:-translate-y-0.5 text-sm"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => openDeleteModal(tool)}
                            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1.5 rounded-lg shadow hover:shadow-lg transition-all hover:-translate-y-0.5 text-sm"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-4 text-lg text-gray-500"
                    >
                      ไม่มีข้อมูลอุปกรณ์
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {tools.length ? (
              tools.map((tool) => (
                <div
                  key={tool.equipment_id}
                  className="bg-white rounded-lg shadow-md p-4"
                >
                  <div className="flex gap-3">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={`${apiUrl}/uploads/${tool.image}`}
                        alt={tool.equipment_name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate text-wrap">
                            {tool.equipment_name}
                          </h3>
                          <p className="text-xs text-gray-500">รหัส: {tool.equipment_id}</p>
                        </div>
                        <input
                          type="checkbox"
                          className={`toggle toggle-sm ${
                            tool.status === "Available"
                              ? "toggle-success"
                              : "toggle-warning"
                            }`}
                          checked={tool.status === "Available"}
                          onChange={() => toggleToolStatus(tool)}
                        />
                      </div>

                      <div className="text-xs sm:text-sm text-gray-600 mb-2">
                        <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                          มีอยู่: {tool.available_quantity} / {tool.total_quantity} ชิ้น
                        </span>
                      </div>

                      <div className="text-xs mb-2">
                        <span
                          className={`inline-block px-2 py-1 rounded ${
                            tool.status === "Available"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {tool.status === "Available"
                            ? "พร้อมใช้งาน"
                            : "ไม่พร้อมใช้งาน"}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(tool)}
                          className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-white border-none flex-1"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => openDeleteModal(tool)}
                          className="btn btn-error btn-xs sm:btn-sm text-white flex-1"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">ไม่มีข้อมูลอุปกรณ์</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="filter-card rounded-xl p-4 shadow-lg flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => {
                  if (totalPages <= 5 || i === 0 || i === totalPages - 1 || Math.abs(currentPage - (i + 1)) <= 1) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all ${
                          currentPage === i + 1 
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-105" 
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  } else if (i === 1 && currentPage > 3) {
                    return <span key={i} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
                  } else if (i === totalPages - 2 && currentPage < totalPages - 2) {
                    return <span key={i} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  »
                </button>
              </div>
            </div>
          )}

          {/* Popup Image Preview - Desktop Only */}
          {popupImage && (
            <div
              className="hidden md:block"
              style={{
                position: "fixed",
                left: popupPosition.x,
                top: popupPosition.y,
                zIndex: 1000,
                background: "rgba(255,255,255,0.95)",
                border: "1px solid #ddd",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                padding: "8px"
              }}
              onMouseLeave={handleImageMouseLeave}
            >
              <img
                src={popupImage}
                alt="popup"
                style={{ width: "320px", height: "320px", objectFit: "contain", borderRadius: "8px" }}
              />
            </div>
          )}

          {/* Modals */}
          {deleteModalOpen && toolToDelete && (
            <DeleteModal
              tool={toolToDelete}
              onConfirm={deleteTool}
              onCancel={closeDeleteModal}
            />
          )}

          {editModalOpen && toolToEdit && (
            <EditModal
              tool={toolToEdit}
              onSubmit={updateTool}
              onCancel={closeEditModal}
            />
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default ManageTools;