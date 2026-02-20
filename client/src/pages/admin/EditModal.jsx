// EditModal.js
import React, { useState, useEffect } from "react";
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
const EditModal = ({ tool, onSubmit, onCancel, isLoading }) => {
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
      // ตรวจสอบประเภทไฟล์
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('รองรับเฉพาะไฟล์รูปภาพประเภท .jpg, .jpeg, .png เท่านั้น');
        e.target.value = ''; // ล้างค่าไฟล์ที่เลือก
        return;
      }
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
                  <span className="label-text font-medium">อัปโหลดรูปภาพ <span className="text-red-500 text-xs">(รองรับเฉพาะ .jpg, .jpeg, .png)</span></span>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
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
            <button 
              type="submit" 
              className={`btn text-white border-none flex items-center gap-2 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
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
                'บันทึก'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
