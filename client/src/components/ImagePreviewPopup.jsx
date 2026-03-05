import React, { useState } from 'react';

/**
 * Custom hook สำหรับจัดการ Image Preview Popup
 * @returns {{ popupImage, popupPosition, handleImageMouseEnter, handleImageMouseLeave }}
 */
export const useImagePreview = () => {
  const [popupImage, setPopupImage] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const handleImageMouseEnter = (e, imageUrl) => {
    const rect = e.target.getBoundingClientRect();
    setPopupImage(imageUrl);
    setPopupPosition({ x: rect.right + 10, y: rect.top });
  };

  const handleImageMouseLeave = () => {
    setPopupImage(null);
  };

  return { popupImage, popupPosition, handleImageMouseEnter, handleImageMouseLeave };
};

/**
 * Component แสดง Popup รูปภาพ (Desktop Only)
 */
const ImagePreviewPopup = ({ popupImage, popupPosition, onMouseLeave }) => {
  if (!popupImage) return null;

  return (
    <div
      className="hidden lg:block"
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
      onMouseLeave={onMouseLeave}
    >
      <img
        src={popupImage}
        alt="popup"
        style={{ width: "320px", height: "320px", objectFit: "contain", borderRadius: "8px" }}
      />
    </div>
  );
};

export default ImagePreviewPopup;
