import React, { useState, useEffect } from 'react';
import  useAuth  from '../hooks/useAuth';
import axios from 'axios';
import CameraCapture from '../components/CameraCapture';
import ImageUpload from '../components/ImageUpload';
import { toast } from 'react-toastify';
import bg2 from '../assets/bg2.png';

function Return() {
  const { borrowedBooks, fetchBorrowRecords } = useAuth();
  const [images, setImages] = useState({});
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

  const handleCaptureImage = (capturedImage, recordId) => {
    setImages((prevCapturedImages) => ({
      ...prevCapturedImages,
      [recordId]: capturedImage,
    }));
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
      
      let token = localStorage.getItem('token');
      await axios.put(`${apiUrl}/api/borrowRecords/update/${recordId}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });
  
      toast.success('อุปกรณ์ถูกคืนแล้ว');
  
      // เรียก fetchBorrowRecords เพื่อดึงข้อมูลใหม่มาจากฐานข้อมูล
      await fetchBorrowRecords();
    } catch (error) {
      console.error('Error returned equipment:', error);
      toast.warn('ไม่สามารถคืนอุปกรณ์ได้');
    }
  };

  return (
     <div className="flex-1 flex flex-col items-center justify-start pt-10 p-4 relative"
               style={{ backgroundImage: `url(${bg2})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
               >
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">รายการอุปกรณ์ที่ต้องคืนหลังจากการยืม</p>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
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
            src={`${apiUrl}/uploads/${item.image}`}
            alt="อุปกรณ์"
            className="h-16 w-16 rounded-lg mx-auto object-cover"
          />
        </td>
        <td className="px-6 py-4">{item.equipment_name}</td>
        <td className="px-6 py-4">{item.quantity_borrow}</td>
        <td className="px-6 py-4">{item.borrow_date}</td>
        <td className="px-6 py-4">
          <div className="flex flex-col gap-2 items-center">
            <CameraCapture onCapture={handleCaptureImage} recordId={item.record_id} />
            <ImageUpload onImageUpload={handleUploadImage} recordId={item.record_id} />
          </div>
        </td>
        <td className="px-6 py-4 text-center">
          {images[item.record_id] && (
            <button
              onClick={() => handleReturned(item.record_id, 'Returned')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-150"
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
      <td className="px-6 py-4" colSpan="7">ไม่มีรายการอุปกรณ์ที่ต้องคืน</td>
    </tr>
  )}
</tbody>
              
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {borrowedBooks.length > 0 ? (
              borrowedBooks.map((item) => (
                <div key={item.record_id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex flex-col gap-4">
                  
                  {/* Header: Image & Name */}
                  <div className="flex items-center gap-4 border-b pb-4">
                    <img
                      src={`${apiUrl}/uploads/${item.image}`}
                      alt="อุปกรณ์"
                      className="h-20 w-20 rounded-lg object-cover bg-gray-100"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{item.equipment_name}</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block mt-1">ID: {item.record_id}</span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                    <div className="font-medium">จำนวนที่ยืม:</div>
                    <div className="text-gray-900 text-right">{item.quantity_borrow}</div>
                    
                    <div className="font-medium">วันที่ยืม:</div>
                    <div className="text-gray-900 text-right">{item.borrow_date}</div>
                  </div>

                  {/* Actions */}
                  <div className="bg-gray-50 p-4 rounded-lg flex flex-col gap-3">
                    <p className="text-xs text-gray-500 font-medium text-center mb-1">ถ่ายภาพ/อัพโหลดเพื่อคืนอุปกรณ์</p>
                    <div className="flex justify-center gap-2">
                       <CameraCapture onCapture={handleCaptureImage} recordId={item.record_id} />
                       <ImageUpload onImageUpload={handleUploadImage} recordId={item.record_id} />
                    </div>

                    {images[item.record_id] && (
                       <button
                       onClick={() => handleReturned(item.record_id, 'Returned')}
                       className="w-full mt-2 inline-flex justify-center items-center px-4 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-all active:scale-95"
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
                       ยืนยันการคืนอุปกรณ์
                     </button>
                    )}
                  </div>

                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                ไม่มีรายการอุปกรณ์ที่ต้องคืน
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

export default Return;
