import React, { useState, useEffect } from 'react';
import  useAuth  from '../hooks/useAuth';
import axios from 'axios';
import CameraCapture from '../components/CameraCapture';
import ImageUpload from '../components/ImageUpload';

function Return() {
  const { borrowedBooks, fetchBorrowRecords } = useAuth();
  const [images, setImages] = useState({});
  const [capturedImage, setCapturedImage] = useState({});
  const [captureMode, setCaptureMode] = useState(false);

  const handleCaptureImage = (capturedImage, recordId) => {
    setImages((prevCapturedImages) => ({
      ...prevCapturedImages,
      [recordId]: capturedImage,
    }));
    setCaptureMode(false);
  };

  const handleUploadImage = (file, recordId) => {
    setImages((prevImages) => ({
      ...prevImages,
      [recordId]: file,
    }));
  };

  const handleReturned = async (recordId, status) => {
    const formData = new FormData();
    formData.append('status', status);
    if (images[recordId]) {
      formData.append('image_return', images[recordId]);
    }
  
    try {
      // ส่งข้อมูลกลับไปอัปเดตในฐานข้อมูล
      let token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/borrowRecords/update/${recordId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
      });
  
      alert('อุปกรณ์ถูกคืนแล้ว');
  
      // เรียก fetchBorrowRecords เพื่อดึงข้อมูลใหม่มาจากฐานข้อมูล
      await fetchBorrowRecords();
    } catch (error) {
      console.error('Error returned equipment:', error);
      alert('ไม่สามารถคืนอุปกรณ์ได้');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">รายการอุปกรณ์ที่ต้องคืนหลังจากการยืม</p>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 ">
              <thead className="bg-gray-50 ">
                <tr>
                  <th className="px-6 py-3 text-center  text-xs font-medium text-gray-500 uppercase tracking-wider">รหัสอุปกรณ์</th>
                  <th className="px-6 py-3 text-center  text-xs font-medium text-gray-500 uppercase tracking-wider">รูปภาพ</th>
                  <th className="px-6 py-3 text-center  text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่ออุปกรณ์</th>
                  <th className="px-6 py-3 text-center  text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนการยืม</th>
                  <th className="px-6 py-3 text-center  text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ยืม</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการรูปภาพ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700 text-center">
  {borrowedBooks.length > 0 ? (
    borrowedBooks.map((item) => (
      <tr key={item.record_id}>
        <td className="px-6 py-4">{item.record_id}</td>
        <td className="px-6 py-4">
          <img
            src={`http://localhost:5000/uploads/${item.image}`}
            alt="อุปกรณ์"
            className="h-16 w-16 rounded-lg"
          />
        </td>
        <td className="px-6 py-4">{item.equipment_name}</td>
        <td className="px-6 py-4">{item.quantity_borrow}</td>
        <td className="px-6 py-4">{item.borrow_date}</td>
        <td className="px-6 py-4">
          <CameraCapture onCapture={handleCaptureImage} recordId={item.record_id} />
          <ImageUpload onImageUpload={handleUploadImage} recordId={item.record_id} />
        </td>
        <td className="px-6 py-4 text-center">
          {(images[item.record_id] || capturedImage[item.record_id]) && (
            <button
              onClick={() => handleReturned(item.record_id, 'Returned')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-150"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              คืนอุปกรณ์
            </button>
          )}
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td className="px-6 py-4" colSpan="6">ไม่มีรายการอุปกรณ์ที่ต้องคืน</td>
    </tr>
  )}
</tbody>
              
            </table>
          </div>
        </div>
      </div>
    </div>
    
  );
}

export default Return;
