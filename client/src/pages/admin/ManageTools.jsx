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

  // ดึงข้อมูลอุปกรณ์
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/equipment/equipment/");
        setTools(response.data.equipment);
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์");
      }
    };
    fetchTools();
  }, []);

  // ลบอุปกรณ์
  const deleteTool = async (equipmentId) => {
    try {
      // ส่งคำขอ DELETE ไปที่ backend เพื่อลบอุปกรณ์ที่มี equipmentId ที่ระบุ
      await axios.delete(`http://localhost:5000/api/equipment/equipment/${equipmentId}`);
  
      // อัปเดต state โดยลบอุปกรณ์ที่ถูกลบออกจากรายการ
      setTools((prevTools) => prevTools.filter(tool => tool.equipment_id !== equipmentId));
  
      // แจ้งเตือนว่าลบอุปกรณ์สำเร็จ
      toast.success("ลบอุปกรณ์สำเร็จ");
  
      // ปิด modal การยืนยันการลบ
      setDeleteModalOpen(false);
    } catch (error) {
      // ถ้ามีข้อผิดพลาด แสดงข้อความแจ้งเตือน
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการลบอุปกรณ์");
    }
  };
  

  // แก้ไขอุปกรณ์ (update equipment_name และ description)
  const updateTool = async (e) => {
    e.preventDefault();
    try {
      const updatedData = {
        equipment_name: e.target.equipment_name.value,
        description: e.target.description.value,
      };

      await axios.put(
        `http://localhost:5000/api/equipment/equipment/${toolToEdit.equipment_id}`,
        updatedData
      );
      // รวมข้อมูลเดิมกับข้อมูลที่แก้ไข
      const updatedTool = { ...toolToEdit, ...updatedData };
      setTools((prevTools) =>
        prevTools.map((tool) =>
          tool.equipment_id === toolToEdit.equipment_id ? updatedTool : tool
        )
      );
      toast.success("อัพเดตอุปกรณ์สำเร็จ");
      setEditModalOpen(false);
      setToolToEdit(null);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอัพเดตอุปกรณ์");
    }
  };

  // Toggle สถานะอุปกรณ์ โดยเรียก endpoint updateEquipmentStatus
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
      // แปลงข้อความแจ้งเตือนเป็นภาษาไทย
      const thaiStatus = newStatus === "Available" ? "พร้อมใช้งาน" : "ไม่พร้อมใช้งาน";
      if (newStatus === "Available") {
        toast.success(`เปลี่ยนสถานะเป็น ${thaiStatus}`);
      } else {
        toast.warn(`เปลี่ยนสถานะเป็น ${thaiStatus}`);
      }
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

  const currentTools = tools.slice((currentPage - 1) * toolsPerPage, currentPage * toolsPerPage);
  const totalPages = Math.ceil(tools.length / toolsPerPage);

  return (
    <div className="min-h-screen container mx-auto py-8">
      <div className="lg:pl-72">
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
                <th>แก้ไข</th>
                <th>ลบ</th>
              </tr>
            </thead>
            <tbody>
              {currentTools.length ? (
                currentTools.map((tool) => (
                  <tr key={tool.equipment_id} className="hover:bg-gray-100 transition-colors duration-300">
                    <td className="py-4 px-2 text-center">{tool.equipment_id}</td>
                    <td className="py-4 px-2 text-center">{tool.equipment_name}</td>
                    <td className="py-4 px-2 text-center">{tool.description}</td>
                    <td className="py-4 px-2 text-center">{tool.quantity}</td>
                    <td className="py-4 px-2 text-center">
                    <div
  className={`tooltip  ${tool.status === "Available" ? "tooltip-success" : "tooltip-warning"}`}
  data-tip={tool.status === "Available" ? "พร้อมใช้งาน" : "ไม่พร้อมใช้งาน"}
>
  <input
    type="checkbox"
    className={`toggle ${tool.status === "Available" ? "toggle-success" : "toggle-warning"}`}
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
                      <button onClick={() => openEditModal(tool)} className="btn btn-info btn-sm">
                        แก้ไข
                      </button>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <button onClick={() => openDeleteModal(tool)} className="btn btn-error btn-sm">
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
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
              className={`btn btn-sm ${currentPage === i + 1 ? "btn-primary" : "btn-outline"} px-4 mx-1`}
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
