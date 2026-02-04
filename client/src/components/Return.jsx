import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import CameraCapture from '../components/CameraCapture';
import ImageUpload from '../components/ImageUpload';
import { toast } from 'react-toastify';
import bg2 from '../assets/bg2.png';

function Return() {
  const { user, fetchBorrowItems } = useAuth();
  const navigate = useNavigate();
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [images, setImages] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const tableContainerRef = useRef(null);
  const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

  // Dynamic calculation for perfect full-screen fit
  useEffect(() => {
    const calculateItemsPerPage = () => {
      const height = window.innerHeight;
      const width = window.innerWidth;
      const isMobile = width < 768;

      // Exact pixel measurements for overheads
      // Header: ~70px
      // Padding Top/Bottom: 16px + 16px = 32px
      // Card Padding: 24px + 24px = 48px
      // Title Area + Line: ~50px
      // Table Header: ~50px
      // Pagination Area: ~60px
      // Footer: ~80px
      // Total Overhead: ~390-420px

      const overhead = isMobile ? 320 : 380;
      const itemHeight = isMobile ? 400 : 72; // Desktop row height ~72px

      const availableHeight = height - overhead;
      const count = Math.max(1, Math.floor(availableHeight / itemHeight));

      setItemsPerPage(count);
    };

    calculateItemsPerPage();
    // Add small delay to account for initial render layout shifts
    const timer = setTimeout(calculateItemsPerPage, 100);

    window.addEventListener('resize', calculateItemsPerPage);
    return () => {
      window.removeEventListener('resize', calculateItemsPerPage);
      clearTimeout(timer);
    };
  }, []);

  // Fetch borrowed items with pagination
  const fetchBorrowedItems = async (page = 1, limit = itemsPerPage) => {
    if (!user?.user_id) return;

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: 'Borrowed' // Only fetch non-returned items
      });

      const response = await axios.get(
        `${apiUrl}/api/borrow/all/${user.user_id}?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { data } = response.data;
      const borrowedItems = (data.borrow_items || []).filter(
        (item) => item.status !== 'Returned'
      );

      setBorrowedBooks(borrowedItems);

      // For client-side pagination (งานเดิม), ไม่มี pagination จาก server
      // ถ้าต้องการ implement server-side pagination ต้องแก้ backend getBorrowsByUserId
      setTotalPages(Math.ceil(borrowedItems.length / limit));
    } catch (error) {
      console.error('Error fetching borrow items:', error.message);
      setBorrowedBooks([]);
    }
  };

  useEffect(() => {
    fetchBorrowedItems(currentPage, itemsPerPage);
  }, [user, currentPage, itemsPerPage]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = borrowedBooks.slice(indexOfFirstItem, indexOfLastItem);

  const handleCaptureImage = (capturedImage, itemId) => {
    setImages((prevCapturedImages) => ({
      ...prevCapturedImages,
      [itemId]: capturedImage,
    }));
  };

  const handleUploadImage = (file, itemId) => {
    setImages((prevImages) => ({
      ...prevImages,
      [itemId]: file,
    }));
  };

  const handleReturned = async (itemId, status) => {
    const formData = new FormData();
    formData.append('status', status);
    if (images[itemId]) {
      formData.append('image_return', images[itemId]);
    }

    try {
      let token = localStorage.getItem('token');
      await axios.put(`${apiUrl}/api/borrow/update/${itemId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      });
      toast.success('คืนอุปกรณ์สำเร็จเรียบร้อย');
      await fetchBorrowItems(); // Update AuthContext
      await fetchBorrowedItems(currentPage, itemsPerPage); // Refresh local data
    } catch (error) {
      console.error('Error returned equipment:', error);
      toast.warn('เกิดข้อผิดพลาดในการคืนอุปกรณ์');
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-4 px-2 sm:px-4 pb-2 relative w-full h-full"
      style={{ backgroundImage: `url(${bg2})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>

      {/* Glassmorphic Overlay for better text readability if needed, though bg-white/95 does the job */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full relative z-10 flex-1 flex flex-col">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 flex flex-col overflow-hidden transition-all duration-300">

          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-purple-50/50">
            <div>
              <h2 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                </span>
                คืนอุปกรณ์
              </h2>
            </div>
            <div className="text-right hidden sm:block">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                รอยืนยัน {borrowedBooks.length} รายการ
              </span>
            </div>
          </div>

          {/* Main Content Area - Auto sizing */}
          <div className="p-4 flex-1 flex flex-col" ref={tableContainerRef}>

            {/* Desktop Table View */}
            <div className="hidden md:block flex-1 rounded-xl border border-gray-200 overflow-hidden bg-white shadow-inner">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/80 sticky top-0 z-10">
                  <tr>
                    {['รหัส', 'รูปภาพ', 'ชื่ออุปกรณ์', 'จำนวน', 'วันที่ยืม', 'หลักฐานการคืน', 'ดำเนินการ'].map((header) => (
                      <th key={header} className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider bg-gray-50/80 backdrop-blur-sm">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentItems.length > 0 ? (
                    currentItems.map((item, index) => (
                      <tr key={item.item_id}
                        className={`hover:bg-blue-50/40 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                        <td className="px-4 py-3 text-sm font-mono text-gray-500 text-center">{item.item_id}</td>
                        <td className="px-4 py-2">
                          <div className="relative h-12 w-12 mx-auto group">
                            <img
                              src={`${apiUrl}/uploads/${item.image}`}
                              alt="อุปกรณ์"
                              className="h-12 w-12 rounded-lg object-cover border border-gray-200 shadow-sm group-hover:scale-150 transition-transform duration-200 absolute top-0 left-0 z-0 group-hover:z-10 bg-white"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-700">{item.equipment_name}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className="px-2 py-1 rounded bg-gray-100 font-medium text-gray-600">{item.quantity}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap text-center">{item.borrow_date}</td>
                        <td className="px-4 py-2">
                          <div className="flex justify-center gap-2 items-center scale-90 origin-center">
                            <CameraCapture onCapture={handleCaptureImage} recordId={item.item_id} />
                            <ImageUpload onImageUpload={handleUploadImage} recordId={item.item_id} />
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          {images[item.item_id] ? (
                            <button
                              onClick={() => handleReturned(item.item_id, 'Returned')}
                              className="inline-flex items-center px-4 py-1.5 border border-transparent rounded-full shadow-md text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none transform hover:-translate-y-0.5 transition-all duration-200"
                            >
                              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              ยืนยัน
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">แนบรูปก่อนคืน</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-gray-400 bg-gray-50/30">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                          <p>ไม่มีรายการที่ต้องคืนในขณะนี้</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 overflow-y-auto pb-2 -mx-2 px-2 scrollbar-none">
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <div key={item.item_id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full -mr-4 -mt-4 z-0"></div>

                    <div className="flex gap-4 relative z-10">
                      <div className="flex-shrink-0">
                        <img
                          src={`${apiUrl}/uploads/${item.image}`}
                          alt="อุปกรณ์"
                          className="h-24 w-24 rounded-lg object-cover shadow-sm border border-gray-100"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-lg truncate">{item.equipment_name}</h3>
                        <div className="text-xs text-gray-500 mb-2">ID: {item.item_id}</div>

                        <div className="flex gap-3 text-sm mb-1">
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 text-xs">จำนวน: {item.quantity}</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">ยืมเมื่อ: {item.borrow_date}</p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 items-end">
                      <div className="col-span-1 flex gap-1 justify-start">
                        <CameraCapture onCapture={handleCaptureImage} recordId={item.item_id} />
                        <ImageUpload onImageUpload={handleUploadImage} recordId={item.item_id} />
                      </div>
                      <div className="col-span-1">
                        {images[item.item_id] ? (
                          <button
                            onClick={() => handleReturned(item.item_id, 'Returned')}
                            className="w-full flex justify-center items-center py-2 px-3 border border-transparent rounded-lg shadow-sm text-xs font-bold text-white bg-green-600 hover:bg-green-700 transition-all active:scale-95"
                          >
                            ยืนยันการคืน
                          </button>
                        ) : (
                          <div className="text-center text-xs text-orange-400 font-medium animate-pulse">
                            * ถ่ายรูปเพื่อคืน
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-400">
                  ไม่พบรายการ
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            <div className="mt-auto pt-4 border-t border-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={() => navigate('/RMUTI')}
                className="px-4 py-2 bg-white text-gray-600 font-medium rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm flex items-center gap-2 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>กลับหน้าหลักยืมอุปกรณ์</span>
              </button>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    className={`p-2 rounded-lg transition-all duration-200 ${currentPage === 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100 hover:text-blue-600 shadow-sm border border-gray-200"
                      }`}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                  </button>

                  <div className="flex items-center gap-1 mx-2 bg-gray-100 rounded-lg p-1">
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        className={`w-8 h-8 rounded-md text-xs font-bold transition-all duration-200 flex items-center justify-center ${currentPage === idx + 1
                          ? "bg-white text-blue-600 shadow-sm scale-110"
                          : "text-gray-500 hover:text-gray-800"
                          }`}
                        onClick={() => setCurrentPage(idx + 1)}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    className={`p-2 rounded-lg transition-all duration-200 ${currentPage === totalPages
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:bg-gray-100 hover:text-blue-600 shadow-sm border border-gray-200"
                      }`}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </button>
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
