import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DeleteModal from "./DeleteModal";
import EditModal from "./EditModal";
import bg2 from '../../assets/bg2.png';

function ManageTools() {
  const [tools, setTools] = useState([]);
  const [popupImage, setPopupImage] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const toolsPerPage = 5;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState(null);
  const [toolToEdit, setToolToEdit] = useState(null);

  const fetchTools = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/equipment/equipment/"
      );
      setTools(response.data.equipment);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์");
    }
  }; 
  
  useEffect(() => {
    fetchTools();
  }, []);

  const deleteTool = async (equipmentId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/equipment/equipment/${equipmentId}`
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
  
    try {
      const formData = new FormData();
      formData.append("equipment_name", e.target.equipment_name.value);
      formData.append("quantity", e.target.quantity.value);
  
      if (e.target.image.files[0]) {
        formData.append("image", e.target.image.files[0]);
      }
  
      const response = await axios.put(
        `http://localhost:5000/api/equipment/equipment/${currentTool.equipment_id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      let updatedTool = response.data.updatedTool;
      if (!updatedTool || !updatedTool.equipment_id) {
        updatedTool = {
          ...currentTool,
          equipment_name: e.target.equipment_name.value,
          quantity: e.target.quantity.value,
          image: e.target.image ? currentTool.image : currentTool.image,
        };
      }
      fetchTools();
      
      setTools((prevTools) =>
        prevTools.map((tool) =>
          tool && tool.equipment_id === currentTool.equipment_id ? updatedTool : tool
        )
      );
      toast.success("อัพเดตอุปกรณ์สำเร็จ");
      setEditModalOpen(false);
      setToolToEdit(null);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัพเดตอุปกรณ์");
    }
  };
  
  const toggleToolStatus = async (tool) => {
    const newStatus = tool.status === "Available" ? "Unavailable" : "Available";
    try {
      await axios.put(
        `http://localhost:5000/api/equipment/equipment/${tool.equipment_id}/status`,
        { status: newStatus }
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

  const currentTools = tools.slice(
    (currentPage - 1) * toolsPerPage,
    currentPage * toolsPerPage
  );
  const totalPages = Math.ceil(tools.length / toolsPerPage);

  const handleImageMouseEnter = (e, imageUrl) => {
    const rect = e.target.getBoundingClientRect();
    setPopupImage(imageUrl);
    setPopupPosition({ x: rect.right + 10, y: rect.top });
  };
  
  const handleImageMouseLeave = () => {
    setPopupImage(null);
  };

  return (
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">🧰 จัดการอุปกรณ์</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                หมายเหตุ: คลิกที่สถานะเพื่อเปลี่ยนสถานะอุปกรณ์
              </p>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto shadow-md rounded-lg bg-white">
            <table className="table w-full">
              <thead>
                <tr className="text-sm font-semibold text-gray-700 text-center">
                  <th>รหัส</th>
                  <th>ชื่อ</th>
                  <th>มีอยู่</th>
                  <th>สถานะ ไม่พร้อมใช้งาน-พร้อมใช้งาน</th>
                  <th>รูป</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {currentTools.length ? (
                  currentTools.map((tool) => (
                    <tr
                      key={tool.equipment_id}
                      className="hover:bg-gray-100 transition-colors duration-300"
                    >
                      <td className="py-4 px-2 text-center">{tool.equipment_id}</td>
                      <td className="py-4 px-2 text-center">{tool.equipment_name}</td>
                      <td className="py-4 px-2 text-center">{tool.quantity}</td>
                      <td className="py-4 px-2 text-center">
                        <div
                          className={`tooltip ${
                            tool.status === "Available"
                              ? "tooltip-success"
                              : "tooltip-warning"
                          }`}
                          data-tip={
                            tool.status === "Available"
                              ? "พร้อมใช้งาน"
                              : "ไม่พร้อมใช้งาน"
                          }
                        >
                          <input
                            type="checkbox"
                            className={`toggle ${
                              tool.status === "Available"
                                ? "toggle-success"
                                : "toggle-warning"
                            }`}
                            checked={tool.status === "Available"}
                            onChange={() => toggleToolStatus(tool)}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-2 flex justify-center">
                        <img
                          src={`http://localhost:5000/uploads/${tool.image}`}
                          alt={tool.equipment_name}
                          className="w-16 h-16 rounded-lg object-cover border cursor-pointer"
                          onMouseEnter={(e) => handleImageMouseEnter(e, `http://localhost:5000/uploads/${tool.image}`)}
                          onMouseLeave={handleImageMouseLeave}
                        />
                      </td>
                      <td className="py-4 px-2 text-center">
                        <button
                          onClick={() => openEditModal(tool)}
                          className="btn btn-warning btn-sm"
                        >
                          แก้ไข
                        </button>
                        <span className="mx-2"></span>
                        <button
                          onClick={() => openDeleteModal(tool)}
                          className="btn btn-error btn-sm text-white"
                        >
                          ลบ
                        </button>
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
            {currentTools.length ? (
              currentTools.map((tool) => (
                <div
                  key={tool.equipment_id}
                  className="bg-white rounded-lg shadow-md p-4"
                >
                  <div className="flex gap-3">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={`http://localhost:5000/uploads/${tool.image}`}
                        alt={tool.equipment_name}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
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
                          มีอยู่: {tool.quantity} ชิ้น
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
                          className="btn btn-warning btn-xs sm:btn-sm flex-1"
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
            <div className="mt-4 sm:mt-6 flex justify-center flex-wrap gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="btn btn-xs sm:btn-sm btn-primary px-2 sm:px-4"
              >
                «
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`btn btn-xs sm:btn-sm ${
                    currentPage === i + 1 ? "btn-accent" : "btn-primary"
                  } px-2 sm:px-4`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="btn btn-xs sm:btn-sm btn-primary px-2 sm:px-4"
              >
                »
              </button>
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
  );
}

export default ManageTools;