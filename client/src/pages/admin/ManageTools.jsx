import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function ManageTools() {
  const [tools, setTools] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const toolsPerPage = 5;
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState(null);
  const [toolToEdit, setToolToEdit] = useState(null);

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/equipment/equipment/");
        setTools(response.data.equipment);
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์");
      }
    };
    fetchTool();
  }, []);

  const deleteTool = async (equipmentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/equipment/equipment/${equipmentId}`);
      setTools(tools.filter(tool => tool.equipment_id !== equipmentId));
      toast.success("ลบอุปกรณ์สำเร็จ");
      setDeleteModalOpen(false);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการลบอุปกรณ์");
    }
  };

  const updateTool = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        equipment_name: e.target.equipment_name.value,
        description: e.target.description.value,
      };
      const response = await axios.put(
        `http://localhost:5000/api/equipment/equipment/${toolToEdit.equipment_id}`,
        updatedData
      );
      setTools(tools.map(tool =>
        tool.equipment_id === toolToEdit.equipment_id ? response.data.equipment : tool
      ));
      toast.success("อัพเดตอุปกรณ์สำเร็จ");
      setEditModalOpen(false);
      setToolToEdit(null);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัพเดตอุปกรณ์");
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

  const currentTools = tools.slice((currentPage - 1) * toolsPerPage, currentPage * toolsPerPage);
  const totalPages = Math.ceil(tools.length / toolsPerPage);

  return (
    <div className="min-h-screen container mx-auto py-8">
      <div className="lg:pl-72">
      <h1 className="text-4xl font-bold mb-6 text-primary">📦 จัดการอุปกรณ์</h1>
      {/* ตารางข้อมูล */}
      <div className="overflow-x-auto shadow-md rounded-lg bg-white">
        <table className="table w-full">
          <thead>
            <tr className="text-sm font-semibold text-gray-700 text-center">
              <th>รหัส</th>
              <th>ชื่อ</th>
              <th>รายละเอียด</th>
              <th>คงเหลือ</th>
              <th>สถานะ</th>
              <th>รูป</th>
              <th>แก้ไข</th>
              <th>ลบ</th>
            </tr>
          </thead>
          <tbody>
            {currentTools.length ? currentTools.map(tool => (
              <tr key={tool.equipment_id} className="hover:bg-gray-100 transition-colors duration-300">
                <td className="py-4 px-2 text-center">{tool.equipment_id}</td>
                <td  className="py-4 px-2 text-center">{tool.equipment_name}</td>
                <td  className="py-4 px-2 text-center">{tool.description}</td>
                <td  className="py-4 px-2 text-center">{tool.quantity}</td>
                <td  className="py-4 px-2 text-center">
                  <span className={`badge ${tool.status === 'Available' ? 'badge-success' : 'badge-error'}`}>
                    {tool.status}
                  </span>
                </td>
                <td className="py-4 px-2 flex justify-center">
                  <img 
                    src={`http://localhost:5000/uploads/${tool.image}`} 
                    alt={tool.equipment_name} 
                    className="w-16 h-16 rounded-lg object-cover border " 
                  />
                </td>
                <td className="py-4 px-2 text-center">
                  <button 
                    onClick={() => openEditModal(tool)} 
                    className="btn btn-info btn-sm"
                  >
                    แก้ไข
                  </button>
                </td>
                <td className="py-4 px-2 text-center">
                  <button 
                    onClick={() => openDeleteModal(tool)} 
                    className="btn btn-error btn-sm"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-lg text-gray-500">
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

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">ยืนยันการลบ</h3>
            <p>
              คุณต้องการลบอุปกรณ์{" "}
              <span className="font-semibold">{toolToDelete?.equipment_name}</span>{" "}
              ใช่หรือไม่?
            </p>
            <div className="modal-action">
              <button onClick={closeDeleteModal} className="btn btn-outline">
                ยกเลิก
              </button>
              <button
                onClick={() => deleteTool(toolToDelete?.equipment_id)}
                className="btn btn-error"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">แก้ไขอุปกรณ์</h3>
            <form onSubmit={updateTool}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold">ชื่ออุปกรณ์</span>
                </label>
                <input
                  type="text"
                  name="equipment_name"
                  defaultValue={toolToEdit?.equipment_name}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text font-semibold">รายละเอียด</span>
                </label>
                <input
                  type="text"
                  name="description"
                  defaultValue={toolToEdit?.description}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div className="modal-action">
                <button onClick={closeEditModal} type="button" className="btn btn-outline">
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
    </div>
  
    </div>
  );
}

export default ManageTools;
