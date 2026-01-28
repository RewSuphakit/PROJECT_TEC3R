// EditModal.js
import React, { useState, useEffect } from "react";
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
const EditModal = ({ tool, onSubmit, onCancel }) => {
  const [preview, setPreview] = useState("");
  // เมื่อ component ถูกโหลดหรือค่า tool เปลี่ยน ให้ตั้งค่า preview จากรูปเดิมของ tool
  useEffect(() => {
    if (tool && tool.image) {
      setPreview(`${apiUrl}/uploads/${tool.image}`);
    }
  }, [tool]);
  // เมื่อมีการเลือกไฟล์ใหม่ให้เปลี่ยน preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else if (tool && tool.image) {
      setPreview(`${apiUrl}/uploads/${tool.image}`);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">แก้ไขอุปกรณ์</h3>
        <form onSubmit={onSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-semibold">ชื่ออุปกรณ์</span>
            </label>
            <input
              type="text"
              name="equipment_name"
              defaultValue={tool?.equipment_name}
              className="input input-bordered w-full"
            />
          </div>
         
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text font-semibold">จำนวน</span>  
            </label>
            <input
              type="number"
              name="total_quantity"
              defaultValue={tool?.total_quantity}
              className="input input-bordered w-full"
              min="1"
            />
          </div>
         
          <div className="form-control mb-4">
            <label className="form-control flex flex-col gap-2 mt-4">
                  <span className="label-text font-medium">อัปโหลดรูปภาพ (JPG, PNG, สูงสุด 10MB)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="file-input file-input-bordered w-full"
                      name="image"
                      onChange={handleFileChange}
                    />
                  </div>
                  {preview && (
                    <img src={preview} alt="Preview" className="w-1/2 h-1/2 rounded-lg object-cover mt-2" />
                  )}
                </label>

          </div>
          <div className="modal-action">
            <button onClick={onCancel} type="button" className="btn btn-outline">
              ยกเลิก
            </button>
            <button type="submit" className="btn bg-blue-600 hover:bg-blue-700 text-white border-none">
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
