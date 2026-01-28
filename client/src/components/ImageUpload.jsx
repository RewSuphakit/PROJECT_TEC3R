import React, { useState } from 'react';

const ImageUpload = ({ onImageUpload, recordId }) => {
  const [previewImage, setPreviewImage] = useState(null);

  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        onImageUpload(file, recordId); 
      };
      reader.readAsDataURL(file);
    }
  };

  return ( 
  <div className="flex justify-center space-x-3 ">
    <div className="relative group hidden md:block">
    {/* Tooltip */}
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
      opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className="bg-gray-800 text-white text-xs py-1.5 px-3 rounded-md whitespace-nowrap">
        อัพโหลดรูปภาพ
        {/* ลูกศรชี้ลง */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
          <div className="border-x-8 border-t-8 border-x-transparent border-t-gray-800"></div>
        </div>
      </div>
    </div>

    {/* ปุ่มอัพโหลดรูปภาพ - คลิกได้ทั้งก่อนและหลังอัพโหลด */}
    <label htmlFor={`file-upload-${recordId}`} className="cursor-pointer">
      { previewImage ? (
        <div className="relative group">
          <img src={previewImage} alt="Preview" className="w-20 h-20 rounded-lg object-cover border-2 border-blue-300 shadow-md group-hover:opacity-75 transition-opacity duration-150" />
          {/* Overlay แสดง icon เมื่อ hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-all duration-150 group">
          <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors duration-150" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
      )}
      <input type="file" accept="image/*" id={`file-upload-${recordId}`} onChange={handleUploadImage} className="hidden" />
    </label>
  </div>
  </div>
);
};
export default ImageUpload;
