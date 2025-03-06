// ManageTools.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DeleteModal from "./DeleteModal";
import EditModal from "./EditModal";

function ManageTools() {
  const [tools, setTools] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const toolsPerPage = 5;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState(null);
  const [toolToEdit, setToolToEdit] = useState(null);

  // ดึงข้อมูลอุปกรณ์
 
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

  // ลบอุปกรณ์
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

  // แก้ไขอุปกรณ์ (update equipment_name และ description)
  const updateTool = async (e) => {
    e.preventDefault();
  
    // Ensure we have a valid toolToEdit
    const currentTool = toolToEdit;
    if (!currentTool) {
      toast.error("ไม่พบข้อมูลอุปกรณ์ที่ต้องการอัพเดต");
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append("equipment_name", e.target.equipment_name.value);
      formData.append("description", e.target.description.value);
      formData.append("quantity", e.target.quantity.value);
  
      // Check if a new file was selected
      if (e.target.image.files[0]) {
        formData.append("image", e.target.image.files[0]);
      }
  
      const response = await axios.put(
        `http://localhost:5000/api/equipment/equipment/${currentTool.equipment_id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
  
      // Try to get the updated tool from the API response
      let updatedTool = response.data.updatedTool;
      // Fallback: if API does not return the updated tool properly, merge the new values with the current tool
      if (!updatedTool || !updatedTool.equipment_id) {
        updatedTool = {
          ...currentTool,
          equipment_name: e.target.equipment_name.value,
          description: e.target.description.value,
          quantity: e.target.quantity.value,
          // Optionally, update image if needed. If no new image selected, currentTool.image remains.
          image: e.target.image ? currentTool.image : currentTool.image,
        };
      }
      fetchTools();
      // Update the state safely by ensuring we only update defined objects
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
  
  
  // Toggle สถานะอุปกรณ์
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

  return (
    <div className="min-h-screen bg-gray-50 font-[Kanit]">
      <div className="lg:pl-72">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🧰 จัดการอุปกรณ์</h1>
            <p className="text-sm text-gray-500 mt-1">
              หมายเหตุ: คลิกที่สถานะเพื่อเปลี่ยนสถานะอุปกรณ์
            </p>
          </div>
        </div>
        {/* ตารางข้อมูล */}
        <div className="overflow-x-auto shadow-md rounded-lg bg-white">
          <table className="table w-full">
            <thead>
              <tr className="text-sm font-semibold text-gray-700 text-center">
                <th>รหัส</th>
                <th>ชื่อ</th>
                <th>รายละเอียด</th>
                <th>มีอยู่</th>
                <th>สถานะ</th>
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
                    <td className="py-4 px-2 text-center">{tool.description}</td>
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
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                    </td>
                    <td className="py-4 px-2 text-center">
                      <button
                        onClick={() => openEditModal(tool)}
                        className="btn btn-info btn-sm"
                      >
                        แก้ไข
                      </button>
                      <span className="mx-2"></span>
                      <button
                        onClick={() => openDeleteModal(tool)}
                        className="btn btn-error btn-sm"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-4 text-lg text-gray-500"
                  >
                    ไม่มีข้อมูลอุปกรณ์
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

        {/* Render DeleteModal if open */}
        {deleteModalOpen && toolToDelete && (
          <DeleteModal
            tool={toolToDelete}
            onConfirm={deleteTool}
            onCancel={closeDeleteModal}
          />
        )}

        {/* Render EditModal if open */}
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
