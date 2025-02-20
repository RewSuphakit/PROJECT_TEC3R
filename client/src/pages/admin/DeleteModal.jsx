// DeleteModal.js
import React from "react";

const DeleteModal = ({ tool, onConfirm, onCancel }) => {
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">ยืนยันการลบ</h3>
        <p>
          คุณต้องการลบอุปกรณ์{" "}
          <span className="font-semibold">{tool?.equipment_name}</span> ใช่หรือไม่?
        </p>
        <div className="modal-action">
          <button onClick={onCancel} className="btn btn-outline">
            ยกเลิก
          </button>
          <button onClick={() => onConfirm(tool?.equipment_id)} className="btn btn-error">
            ลบ
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
