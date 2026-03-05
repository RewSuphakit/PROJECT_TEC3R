import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import bg2 from '../../assets/bg2.webp';
import { formatThaiDate } from '../../utils/formatDate';
import { toggleGroup } from '../../utils/groupToggle';
import { useSortable } from '../../hooks/useSortable';
import SortIcon from '../../components/SortIcon';
import Pagination from '../../components/Pagination';
import ImagePreviewPopup, { useImagePreview } from '../../components/ImagePreviewPopup';

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

import './AdminStyles.css';

function ListReturn() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const groupsPerPage = 5;
  const [openGroups, setOpenGroups] = useState([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { sortField, sortOrder, handleSort } = useSortable('returned_at', 'desc', setCurrentPage);
  const { popupImage, popupPosition, handleImageMouseEnter, handleImageMouseLeave } = useImagePreview();



  // Fetch returned items with server-side pagination
  const fetchReturnedItems = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: groupsPerPage.toString()
      });
      const response = await axios.get(`${apiUrl}/api/borrow/returned?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.returned_items) {
        // แปลงข้อมูลจาก API ให้ตรงกับ format ที่ใช้แสดงผล
        const flattenedRecords = [];
        response.data.returned_items.forEach((transaction) => {
          transaction.items.forEach((item, index) => {
            flattenedRecords.push({
              groupId: transaction.transaction_id,
              item_id: `${transaction.transaction_id}-${index}`,
              student_name: transaction.student_name,
              equipment_name: item.equipment_name,
              quantity: item.quantity,
              status: item.status,
              image_return: item.image_return,
              returned_at: item.returned_at,
            });
          });
        });
        setTools(flattenedRecords);

        const pagination = response.data.pagination || { totalPages: 1 };
        setTotalPages(pagination.totalPages || 1);
      } else {
        setTools([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching returned records:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      setTools([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnedItems(currentPage);
  }, [currentPage]);

  // จัดกลุ่มข้อมูลตาม transaction_id
  const groupedRecords = useMemo(() => {
    return tools.reduce((acc, record) => {
      if (!acc[record.groupId]) {
        acc[record.groupId] = [];
      }
      acc[record.groupId].push(record);
      return acc;
    }, {});
  }, [tools]);

  const groupKeys = useMemo(() => {
    return Object.keys(groupedRecords).sort((a, b) => {
      const aItem = groupedRecords[a][0];
      const bItem = groupedRecords[b][0];

      let comparison = 0;

      switch (sortField) {
        case 'student_name':
          comparison = (aItem.student_name || '').localeCompare(bItem.student_name || '', 'th');
          break;
        case 'equipment_name':
          comparison = (aItem.equipment_name || '').localeCompare(bItem.equipment_name || '', 'th');
          break;
        case 'quantity':
          comparison = (aItem.quantity || 0) - (bItem.quantity || 0);
          break;
        case 'returned_at':
        default:
          comparison = new Date(bItem.returned_at) - new Date(aItem.returned_at);
          break;
      }

      if (sortField === 'returned_at') {
        return sortOrder === 'desc' ? comparison : -comparison;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [groupedRecords, sortField, sortOrder]);

  // ฟังก์ชันสำหรับ Image Modal (Mobile)
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  // ใช้ groupKeys โดยตรง (ไม่ต้อง slice ที่ client)
  const currentGroupKeys = groupKeys;

  return (
    <>

      <div className="relative" style={{
        minHeight: '100vh',
        backgroundImage: `url(${bg2})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="lg:pl-72">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
            {/* Header Section */}
            <div className="filter-card rounded-2xl p-6 mb-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                      รายการคืนอุปกรณ์
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">ประวัติรายการอุปกรณ์ที่คืนแล้ว</p>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
                <p className="text-base sm:text-lg text-gray-600">กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-hidden shadow-2xl rounded-2xl bg-white">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 uppercase text-sm leading-normal">
                        <th
                          className="py-4 px-6 text-left font-semibold cursor-pointer hover:bg-slate-200 transition-colors select-none"
                          onClick={() => handleSort('student_name')}
                        >
                          <span className="flex items-center">
                            ชื่อผู้ยืม
                            <SortIcon field="student_name" sortField={sortField} sortOrder={sortOrder} />
                          </span>
                        </th>
                        <th
                          className="py-4 px-6 text-left font-semibold cursor-pointer hover:bg-slate-200 transition-colors select-none"
                          onClick={() => handleSort('equipment_name')}
                        >
                          <span className="flex items-center">
                            ชื่ออุปกรณ์
                            <SortIcon field="equipment_name" sortField={sortField} sortOrder={sortOrder} />
                          </span>
                        </th>
                        <th
                          className="py-4 px-6 text-center font-semibold cursor-pointer hover:bg-slate-200 transition-colors select-none"
                          onClick={() => handleSort('quantity')}
                        >
                          <span className="flex items-center justify-center">
                            จำนวนที่คืน
                            <SortIcon field="quantity" sortField={sortField} sortOrder={sortOrder} />
                          </span>
                        </th>
                        <th className="py-4 px-6 text-center font-semibold">สถานะ</th>
                        <th className="py-4 px-6 text-center font-semibold">รูปที่คืน</th>
                        <th
                          className="py-4 px-6 text-center font-semibold cursor-pointer hover:bg-slate-200 transition-colors select-none"
                          onClick={() => handleSort('returned_at')}
                        >
                          <span className="flex items-center justify-center">
                            วันที่คืน
                            <SortIcon field="returned_at" sortField={sortField} sortOrder={sortOrder} />
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentGroupKeys.length ? (
                        currentGroupKeys.map((groupId, index) => {
                          const groupItems = groupedRecords[groupId];
                          if (groupItems.length === 1) {
                            const item = groupItems[0];
                            return (
                              <tr key={item.record_id} className="table-row border-b hover:bg-gray-50">
                                <td className="py-4 px-6 font-medium text-gray-800">{item.student_name}</td>
                                <td className="py-4 px-6 text-gray-600">{item.equipment_name}</td>
                                <td className="py-4 px-6 text-center">
                                  <span className="bg-blue-100 text-[#0F4C75] px-3 py-1 rounded-full font-bold">
                                    {item.quantity}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                    ● คืนแล้ว
                                  </span>
                                </td>
                                <td className="py-4 px-6 flex items-center justify-center">
                                  <img
                                    src={`${apiUrl}/image_return/${item.image_return}`}
                                    alt="Returned"
                                    className="w-12 h-12 rounded-lg object-cover border-2 border-gray-100 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                                    onMouseEnter={(e) => handleImageMouseEnter(e, `${apiUrl}/image_return/${item.image_return}`)}
                                    onMouseLeave={handleImageMouseLeave}
                                  />
                                </td>
                                <td className="py-4 px-6 text-center text-gray-600">{formatThaiDate(item.returned_at)}</td>
                              </tr>
                            );
                          } else {
                            const firstItem = groupItems[0];
                            const hiddenItems = groupItems.slice(1);
                            return (
                              <React.Fragment key={groupId}>
                                <tr
                                  onClick={() => toggleGroup(setOpenGroups, groupId)}
                                  className={`table-row border-b ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'} hover:bg-blue-50/30 transition-colors`}
                                >
                                  <td className="py-4 px-6 font-medium text-gray-800 flex items-center gap-2">
                                    <span className={`transition-transform duration-200 ${openGroups.includes(groupId) ? 'rotate-90' : ''}`}>
                                      ▶
                                    </span>
                                    {firstItem.student_name}
                                    <span className="text-xs text-gray-500 ml-2">({groupItems.length} รายการ)</span>
                                  </td>
                                  <td className="py-4 px-6 text-gray-600">{firstItem.equipment_name}</td>
                                  <td className="py-4 px-6 text-center">
                                    <span className="bg-blue-100 text-[#0F4C75] px-3 py-1 rounded-full font-bold">
                                      {firstItem.quantity}
                                    </span>
                                  </td>
                                  <td className="py-4 px-6 text-center">
                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                      ● คืนแล้ว
                                    </span>
                                  </td>
                                  <td className="py-4 px-6 flex items-center justify-center">
                                    <img
                                      src={`${apiUrl}/image_return/${firstItem.image_return}`}
                                      alt="Returned"
                                      className="w-12 h-12 rounded-lg object-cover border-2 border-gray-100 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                                      onMouseEnter={(e) => handleImageMouseEnter(e, `${apiUrl}/image_return/${firstItem.image_return}`)}
                                      onMouseLeave={handleImageMouseLeave}
                                    />
                                  </td>
                                  <td className="py-4 px-6 text-center text-gray-600">{formatThaiDate(firstItem.returned_at)}</td>
                                </tr>
                                {openGroups.includes(groupId) &&
                                  hiddenItems.map((item) => (
                                    <tr key={item.record_id} className="bg-white border-b">
                                      <td className="py-4 px-6"></td>
                                      <td className="py-4 px-6 text-gray-600 pl-10">↳ {item.equipment_name}</td>
                                      <td className="py-4 px-6 text-center">
                                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold text-sm">
                                          {item.quantity}
                                        </span>
                                      </td>
                                      <td className="py-4 px-6 text-center">
                                        <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
                                          ● คืนแล้ว
                                        </span>
                                      </td>
                                      <td className="py-4 px-6 flex items-center justify-center">
                                        <img
                                          src={`${apiUrl}/image_return/${item.image_return}`}
                                          alt="Returned"
                                          className="w-10 h-10 rounded-lg object-cover border border-gray-100 shadow-sm cursor-pointer hover:scale-150 transition-transform"
                                          onMouseEnter={(e) => handleImageMouseEnter(e, `${apiUrl}/image_return/${item.image_return}`)}
                                          onMouseLeave={handleImageMouseLeave}
                                        />
                                      </td>
                                      <td className="py-4 px-6 text-center text-gray-500 text-sm">{formatThaiDate(item.returned_at)}</td>
                                    </tr>
                                  ))}
                              </React.Fragment>
                            );
                          }
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-8 text-base text-gray-500">
                            ไม่มีข้อมูลอุปกรณ์ที่คืน
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {currentGroupKeys.length ? (
                    currentGroupKeys.map((groupId) => {
                      const groupItems = groupedRecords[groupId];

                      return (
                        <div key={groupId} className="bg-white rounded-lg shadow-md overflow-hidden">
                          {/* Main Card */}
                          <div
                            className={`p-4 ${groupItems.length > 1 ? 'cursor-pointer bg-gray-50' : ''}`}
                            onClick={(e) => {
                              // ป้องกันไม่ให้คลิกรูปทำให้ toggle group
                              if (!e.target.classList.contains('image-clickable')) {
                                toggleGroup(setOpenGroups, groupId);
                              }
                            }}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-base sm:text-lg text-gray-800 flex items-center gap-2">
                                  👤 {groupItems[0].student_name}
                                  {groupItems.length > 1 && (
                                    <span className="text-green-500 text-xl">
                                      {openGroups.includes(groupId) ? "▾" : "▸"}
                                    </span>
                                  )}
                                </h3>
                                {groupItems.length > 1 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    คืนทั้งหมด {groupItems.length} รายการ
                                  </p>
                                )}
                              </div>
                              <span className="badge badge-success text-white badge-sm sm:badge-md px-4">
                                คืนแล้ว
                              </span>
                            </div>

                            {/* First Item Details */}
                            <div className="space-y-2 bg-white p-3 rounded-lg border border-gray-200">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">อุปกรณ์:</span>
                                <span className="font-medium text-gray-800">{groupItems[0].equipment_name}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">จำนวน:</span>
                                <span className="font-medium text-green-600">{groupItems[0].quantity} ชิ้น</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">รูปที่คืน:</span>
                                <img
                                  src={`${apiUrl}/image_return/${groupItems[0].image_return}`}
                                  alt="Returned"
                                  className="w-16 h-16 rounded-lg object-cover border cursor-pointer hover:opacity-80 transition-opacity image-clickable"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openImageModal(`${apiUrl}/image_return/${groupItems[0].image_return}`);
                                  }}
                                />
                              </div>
                              <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm">
                                <span className="text-gray-600">วันที่คืน:</span>
                                <span className="font-medium text-gray-700 mt-1 sm:mt-0">
                                  {formatThaiDate(groupItems[0].returned_at)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Expanded Items */}
                          {openGroups.includes(groupId) && groupItems.length > 1 && (
                            <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
                              {groupItems.slice(1).map((item, idx) => (
                                <div key={item.record_id} className="bg-white p-3 rounded-lg border border-gray-200">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs text-gray-500">รายการที่ {idx + 2}</span>
                                    <span className="badge badge-success text-white badge-sm px-3">คืนแล้ว</span>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">อุปกรณ์:</span>
                                      <span className="font-medium text-gray-800">{item.equipment_name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">จำนวน:</span>
                                      <span className="font-medium text-green-600">{item.quantity} ชิ้น</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-600">รูปที่คืน:</span>
                                      <img
                                        src={`${apiUrl}/image_return/${item.image_return}`}
                                        alt="Returned"
                                        className="w-16 h-16 rounded-lg object-cover border cursor-pointer hover:opacity-80 transition-opacity image-clickable"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openImageModal(`${apiUrl}/image_return/${item.image_return}`);
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
                      <div className="text-gray-400 text-5xl sm:text-6xl mb-4">📦</div>
                      <p className="text-base sm:text-lg text-gray-500">ไม่มีข้อมูลอุปกรณ์ที่คืน</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Popup Image Preview - Desktop Only */}
            <ImagePreviewPopup popupImage={popupImage} popupPosition={popupPosition} onMouseLeave={handleImageMouseLeave} />

            {/* Image Modal for Mobile */}
            {imageModalOpen && selectedImage && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
                onClick={closeImageModal}
              >
                <div className="relative max-w-full max-h-full">
                  <button
                    onClick={closeImageModal}
                    className="absolute top-2 right-2 btn btn-circle btn-sm bg-white text-black hover:bg-gray-200 z-10"
                  >
                    ✕
                  </button>
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {/* Pagination */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>
    </>
  );
}

export default ListReturn;