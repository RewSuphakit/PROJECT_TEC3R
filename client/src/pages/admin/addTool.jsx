import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function AddTool() {
  const [showModal, setShowModal] = useState(false);
  const [equipmentName, setEquipmentName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("equipment_name", equipmentName);
    formData.append("description", description);
    formData.append("quantity", quantity);
    formData.append("image", image);

    try {
      await axios.post("http://localhost:5000/api/equipment/equipment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("เพิ่มอุปกรณ์สำเร็จ!");
      setShowModal(false);
      // Reset the form only after a successful submission
      setEquipmentName("");
      setDescription("");
      setQuantity("");
      setImage(null);
      setPreviewImage(null);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มอุปกรณ์");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  return (
    <div>
      {/* ปุ่มเปิด Modal */}
      <button
        className="inline-flex items-center gap-2 text-white px-6 py-2.5 rounded-xl transition duration-200 shadow-sm hover:shadow group"
        style={{ backgroundColor: "#0F4C75" }}
        onClick={() => setShowModal(true)}
      >
        <i className="fas fa-plus transition-transform group-hover:rotate-90" />
        <span>เพิ่มอุปกรณ์ใหม่</span>
      </button>

      {/* Modal */}
      {showModal && (
        <dialog id="my_modal_3" className="modal" open>
          <div className="modal-box">
            <form onSubmit={handleSubmit}>
              {/* ปุ่มปิด Modal */}
              <button
  type="button"
  className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
  onClick={() => {
    setShowModal(false);
    // Reset the form fields when the modal is closed
    setEquipmentName("");
    setDescription("");
    setQuantity("");
    setImage(null);
    setPreviewImage(null);
  }}
>
  <i className="fas fa-times" />
</button>

              <h3 className="font-bold text-lg">เพิ่มชุดอุปกรณ์</h3>

              <label className="input input-bordered flex items-center gap-2 mt-4">
                <i className="fas fa-tools" />
                <input
                  type="text"
                  placeholder="ชื่ออุปกรณ์"
                  className="p-2 text-sm w-full"
                  required
                  value={equipmentName}
                  onChange={(e) => setEquipmentName(e.target.value)}
                />
              </label>

              <label className="input input-bordered flex items-center gap-2 mt-4">
                <i className="fas fa-align-left" />
                <input
                  type="text"
                  placeholder="รายละเอียด"
                  className="p-2 text-sm w-full"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>

              <label className="input input-bordered flex items-center   gap-2 mt-4">
                <i className="fas fa-sort-numeric-up" />
                <input
                  type="number"
                  placeholder="จำนวน"
                  className="p-2 text-sm w-full"
                  required
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </label>

              <div className="fle justify-between gap-2 mt-4">
                <label className="form-control flex flex-col gap-2 mt-4">
                  <span className="label-text font-medium">อัปโหลดรูปภาพ (JPG, PNG, สูงสุด 10MB)</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="file-input file-input-bordered w-full"
                      required
                      onChange={handleImageChange}
                    />
                  </div>
                  {previewImage && (
                    <img src={previewImage} alt="Preview" className="w-1/2 h-1/2 rounded-lg object-cover mt-2" />
                  )}
                </label>

                <div className="flex justify-end mt-4">
                  <button type="submit" className="btn bg-blue-600 text-white px-4 py-2 rounded-lg">
                    ตกลง
                  </button>
                </div>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
}

export default AddTool;
