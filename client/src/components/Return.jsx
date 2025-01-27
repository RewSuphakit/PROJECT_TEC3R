import React, { useState, useEffect } from 'react';
import ex11 from '../assets/ex11.png';
import axios from 'axios';
import useAuth from "../hooks/useAuth";

function Return() {
    const { borrowedBooks } = useAuth();
    const [images, setImages] = useState({}); // เก็บภาพตาม record_id
    const [previewImage, setPreviewImage] = useState(null); // เก็บภาพที่ถูกเลือก
  
    // ฟังก์ชันอัพโหลดภาพ
    const handleUploadImage = (e, recordId) => {
      const file = e.target.files[0]; // ตรวจสอบว่ามีไฟล์ที่เลือกไหม
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages((prevImages) => ({
            ...prevImages,
            [recordId]: reader.result, // เก็บ URL ของภาพตาม record_id
          }));
          setPreviewImage(reader.result); // เก็บภาพที่เลือกสำหรับแสดง
        };
        reader.readAsDataURL(file); // แปลงไฟล์เป็น Base64 URL
      }
    };
    return (
        <>
        
      
            <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header Section */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <div className="flex items-center justify-between mb-6">
                          
                               
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    รายการอุปกรณ์ที่ต้องคืนหลังจากการยืม
                                </p>
                          
                            {/* Search Bar */}
                            <div className="relative w-96">
                                <input
                                    type="search"
                                    className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white outline-none"
                                    placeholder="ค้นหาอุปกรณ์..."
                                />
                                <svg
                                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 ">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            รหัสอุปกรณ์
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            รูปภาพ
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ชื่ออุปกรณ์
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            วันที่ยืม
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            จัดการรูปภาพ
                                        </th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            การดำเนินการ
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700">
                                {borrowedBooks.length > 0 ? (
                                         borrowedBooks.map((item) => (
                                    <tr className="hover:bg-gray-50  transition-colors duration-150">
                                        {/* รหัสอุปกรณ์ */}
                                       
                                            <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-sm font-semibold text-gray-900 ">
                                                   {item.equipment_id}
                                                </span>
                                            </div>
                                        </td>
                                        {/* รูปภาพอุปกรณ์ */}
                                        <td className="px-6 py-4 whitespace-nowrap">
    <div className="flex-shrink-0">
        <img
            src={images[item.record_id] || (item.image ? `http://localhost:5000/uploads/${item.image.replace(/\\/g, "/")}` : null)}
            className="h-16 w-16 rounded-lg object-cover shadow-sm hover:shadow-md transition-shadow duration-200"
            alt="อุปกรณ์"
        />
    </div>
</td>

                                        {/* ชื่ออุปกรณ์ */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900 ">
                                                    {item.equipment_name}
                                                </span>
                                                <span className="text-xs text-gray-500 ">
                                                    {item.description}
                                                </span>
                                            </div>
                                        </td>

                                        {/* วันที่ยืม */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <svg
                                                    className="w-4 h-4 text-gray-400 mr-2"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <span className="text-sm text-gray-500 ">
                                                    {item.borrow_date }
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap ">
                                         <div className="flex justify-center space-x-3 ">
        {/* ปุ่มอัพโหลดรูป */}
        <div className="relative group hidden md:block">
      {/* Tooltip ด้านบน */}
      <div
        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
        opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
      >
        <div className="bg-gray-800 text-white text-xs py-1.5 px-3 rounded-md whitespace-nowrap">
          อัพโหลดรูปภาพ
          {/* ลูกศรชี้ลง */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="border-x-8 border-t-8 border-x-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>

      {/* ปุ่มอัพโหลด */}
      {previewImage ? (
        <img src={item.record_id ? previewImage :'' } alt="Preview" className="w-32 h-32 object-cover" />
      ) : (
        <label  htmlFor={`file-upload-${item.record_id}`} className="cursor-pointer">
          <div
            className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 
            hover:bg-blue-50 hover:border-blue-200 
            dark:border-gray-700 
            dark:hover:bg-gray-700 
            transition-all duration-150 group"
          >
            <svg
              className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors duration-150"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <input
                                type="file"
                                className="hidden"
                                id={`file-upload-${item.record_id}`}
                                name="image"
                                accept="image/*"
                                onChange={(e) => handleUploadImage(e, item.record_id)} // ส่ง record_id ไป
                              />
          </div>
        </label>
      )}
    </div>


        {/* ปุ่มถ่ายภาพ */}
        <div className="relative group block md:hidden">
            {/* Tooltip ด้านบน */}
            <div
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
            >
                <div className="bg-gray-800 text-white text-xs py-1.5 px-3 rounded-md whitespace-nowrap">
                    ถ่ายภาพ
                    {/* ลูกศรชี้ลง */}
                    <div
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full"
                    >
                        <div
                            className="border-x-8 border-t-8 border-x-transparent border-t-gray-800"
                        ></div>
                    </div>
                </div>
            </div>

            <button
                className="p-2.5 rounded-lg bg-gray-50 border border-gray-200 
                    hover:bg-green-50 hover:border-green-200 
                    dark:border-gray-700 
                    dark:hover:bg-gray-700 
                    transition-all duration-150 group"
            >
                <svg
                    className="w-5 h-5 text-gray-500 group-hover:text-green-500 transition-colors duration-150"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>
            </button>
        </div>
    </div>
</td>

                                        {/* ปุ่มคืนอุปกรณ์ */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm 
                                                    text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 
                                                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 
                                                    transition-all duration-150"
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
                                                <span>คืนอุปกรณ์</span>
                                            </button>
                                        </td>
                                   
                                        
                                    </tr>
                                        
                                    ))
                                ) : (
                                  <div className="col-span-full text-center text-gray-500">ไม่พบข้อมูลอุปกรณ์ที่ตรงกับการค้นหา</div>
                                )}
                                   

                                  
                               

                                </tbody>
                            </table>
                            {/* Pagination */}
                            <div className="px-6 py-3 flex items-center justify-between border-t">
                                <span className="text-sm text-gray-500">แสดง 1-12 จาก 12 รายการ</span>
                                <nav className="flex gap-2">
                                    <button
                                        className="px-3 py-1 text-sm rounded hover:bg-gray-100 text-gray-500 disabled:opacity-50"
                                        disabled
                                    >
                                        <i className="fas fa-chevron-left mr-1"></i>
                                        ก่อนหน้า
                                    </button>
                                    <button
                                        className="px-3 py-1 text-sm rounded hover:bg-gray-100 text-gray-500 disabled:opacity-50"
                                        disabled
                                    >
                                        ถัดไป
                                        <i className="fas fa-chevron-right ml-1"></i>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

    
        
        </>
    );
}

export default Return;