import React, { useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPlus, FaTimes, FaTools, FaSortNumericUp } from 'react-icons/fa';
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

function AddTool({ onAddSuccess }) {
  const [showModal, setShowModal] = useState(false);
  const [equipmentName, setEquipmentName] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("equipment_name", equipmentName);
    formData.append("total_quantity", totalQuantity);
    formData.append("image", image);

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${apiUrl}/api/equipment/equipment`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        },
      });

      toast.success("เพิ่มอุปกรณ์สำเร็จ!");
      if (onAddSuccess) {
        onAddSuccess();
      } else {
        window.location.reload();
      }
      closeModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "";
      if (errorMessage.includes("Only .jpg") || errorMessage.includes("allowed")) {
        toast.error("รองรับเฉพาะไฟล์รูปภาพประเภท .jpg, .jpeg, .png เท่านั้น");
      } else if (errorMessage.includes("ชื่ออุปกรณ์")) {
        toast.error(errorMessage, { toastId: 'duplicate-equipment' });
      } else {
        toast.error("เกิดข้อผิดพลาดในการเพิ่มอุปกรณ์");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // ตรวจสอบประเภทไฟล์
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('รองรับเฉพาะไฟล์รูปภาพประเภท .jpg, .jpeg, .png เท่านั้น');
        e.target.value = ''; // ล้างค่าไฟล์ที่เลือก
        setImage(null);
        setPreviewImage(null);
        return;
      }
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEquipmentName("");
    setTotalQuantity("");
    setImage(null);
    setPreviewImage(null);
  };

  return (
    <div>
      {/* Button to open Modal */}
      <button
        className="inline-flex items-center gap-2 text-white px-6 py-2.5 rounded-xl transition duration-200 shadow-sm hover:shadow group"
        style={{ backgroundColor: "#0F4C75" }}
        onClick={() => setShowModal(true)}
      >
        <FaPlus className="transition-transform group-hover:rotate-90" />
        <span>เพิ่มอุปกรณ์ใหม่</span>
      </button>

      {/* Modal rendered via Portal - inline to prevent re-render issues */}
      {showModal && ReactDOM.createPortal(
        <div className="fixed inset-0" style={{ zIndex: 99999 }}>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={closeModal}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit} className="p-6">
                {/* Close Button */}
                <button
                  type="button"
                  className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
                  onClick={closeModal}
                >
                  <FaTimes />
                </button>

                <h3 className="font-bold text-lg mb-4">เพิ่มชุดอุปกรณ์</h3>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-medium">ชื่ออุปกรณ์</span>
                  </label>
                  <div className="input input-bordered flex items-center gap-2">
                    <FaTools className="text-gray-400" />
                    <input
                      type="text"
                      placeholder="ชื่ออุปกรณ์"
                      className="grow bg-transparent outline-none"
                      required
                      value={equipmentName}
                      onChange={(e) => setEquipmentName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-medium">จำนวน</span>
                  </label>
                  <div className="input input-bordered flex items-center gap-2">
                    <FaSortNumericUp className="text-gray-400" />
                    <input
                      type="number"
                      placeholder="จำนวน"
                      className="grow bg-transparent outline-none"
                      required
                      min="1"
                      value={totalQuantity}
                      onChange={(e) => setTotalQuantity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-medium">อัปโหลดรูปภาพ <span className="text-red-500 text-xs">(รองรับเฉพาะ .jpg, .jpeg, .png)</span></span>
                  </label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="file-input file-input-bordered w-full"
                    required
                    onChange={handleImageChange}
                  />
                  {previewImage && (
                    <img src={previewImage} alt="Preview" className="w-1/2 h-auto rounded-lg object-cover mt-2" />
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={closeModal}
                  >
                    ยกเลิก
                  </button>
                  <button 
                    type="submit" 
                    className={`btn text-white flex items-center gap-2 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        กำลังบันทึก...
                      </>
                    ) : (
                      'ตกลง'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default AddTool;
