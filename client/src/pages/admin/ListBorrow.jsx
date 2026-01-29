import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import bg2 from '../../assets/bg2.png';

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

import './AdminStyles.css';

function ListBorrow() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const groupsPerPage = 5;
  const [openGroups, setOpenGroups] = useState([]);

  // ฟังก์ชันจัดรูปแบบวันที่เป็นแบบไทย
  const formatThaiDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // ดึงข้อมูลบันทึกการยืมทั้งหมดจาก API
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/api/borrow/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (
          response.data &&
          Array.isArray(response.data.borrow_transactions)
        ) {
          const filteredTransactions = response.data.borrow_transactions.filter(
            (transaction) =>
              transaction.borrow_items.some(
                (item) => item.status.toLowerCase() === "borrowed"
              )
          );

          const flattenedRecords = [];
          filteredTransactions.forEach((transaction) => {
            transaction.borrow_items.forEach((item, index) => {
              if (item.status.toLowerCase() === "borrowed") {
                flattenedRecords.push({
                  groupId: transaction.transaction_id,
                  item_id: `${transaction.transaction_id}-${index}`,
                  student_name: transaction.student_name,
                  equipment_name: item.equipment_name,
                  quantity: item.quantity,
                  status: item.status,
                  borrow_date: transaction.borrow_date,
                });
              }
            });
          });

          setTools(flattenedRecords);
        } else {
          toast.error("ข้อมูลที่ได้รับไม่ถูกต้อง");
        }
      } catch (error) {
        console.error("Error fetching borrow records:", error);
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

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

  // เรียงลำดับกลุ่มตามวันที่ยืม
  const groupKeys = useMemo(() => {
    return Object.keys(groupedRecords).sort(
      (a, b) =>
        new Date(groupedRecords[b][0].borrow_date) -
        new Date(groupedRecords[a][0].borrow_date)
    );
  }, [groupedRecords]);

  // Pagination สำหรับกลุ่ม
  const totalPages = Math.ceil(groupKeys.length / groupsPerPage);
  const currentGroupKeys = groupKeys.slice(
    (currentPage - 1) * groupsPerPage,
    currentPage * groupsPerPage
  );

  // ฟังก์ชันเปิด/ปิด dropdown สำหรับกลุ่ม
  const toggleGroup = (groupId) => {
    setOpenGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                      รายการยืมอุปกรณ์
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">ติดตามรายการอุปกรณ์ที่กำลังถูกยืม</p>
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
                      <th className="py-4 px-6 text-left font-semibold">ชื่อผู้ยืม</th>
                      <th className="py-4 px-6 text-left font-semibold">ชื่ออุปกรณ์</th>
                      <th className="py-4 px-6 text-center font-semibold">จำนวน</th>
                      <th className="py-4 px-6 text-center font-semibold">สถานะ</th>
                      <th className="py-4 px-6 text-center font-semibold">วันที่ยืม</th>
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
                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                                  ● ยังไม่คืน
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center text-gray-600">{formatThaiDate(item.borrow_date)}</td>
                            </tr>
                          );
                        } else {
                          const firstItem = groupItems[0];
                          const hiddenItems = groupItems.slice(1);
                          return (
                            <React.Fragment key={groupId}>
                              <tr
                                onClick={() => toggleGroup(groupId)}
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
                                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                                    ● ยังไม่คืน
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-center text-gray-600">{formatThaiDate(firstItem.borrow_date)}</td>
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
                                      <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-medium">
                                        ● ยังไม่คืน
                                      </span>
                                    </td>
                                    <td className="py-4 px-6 text-center text-gray-500 text-sm">{formatThaiDate(item.borrow_date)}</td>
                                  </tr>
                                ))}
                            </React.Fragment>
                          );
                        }
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-8 text-base text-gray-500">
                          ไม่มีข้อมูลอุปกรณ์ที่ยังค้างอยู่
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
                          onClick={() => groupItems.length > 1 && toggleGroup(groupId)}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-base sm:text-lg text-gray-800 flex items-center gap-2">
                                👤 {groupItems[0].student_name}
                                {groupItems.length > 1 && (
                                  <span className="text-orange-500 text-xl">
                                    {openGroups.includes(groupId) ? "▾" : "▸"}
                                  </span>
                                )}
                              </h3>
                              {groupItems.length > 1 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  ยืมทั้งหมด {groupItems.length} รายการ
                                </p>
                              )}
                            </div>
                            <span className="badge badge-error text-white badge-sm sm:badge-md">
                              ยังไม่คืน
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
                              <span className="font-medium text-orange-600">{groupItems[0].quantity} ชิ้น</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">วันที่ยืม:</span>
                              <span className="font-medium text-gray-700 mt-1 sm:mt-0">
                                {formatThaiDate(groupItems[0].borrow_date)}
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
                                  <span className="badge badge-error text-white badge-sm">ยังไม่คืน</span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">อุปกรณ์:</span>
                                    <span className="font-medium text-gray-800">{item.equipment_name}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">จำนวน:</span>
                                    <span className="font-medium text-orange-600">{item.quantity} ชิ้น</span>
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
                    <p className="text-base sm:text-lg text-gray-500">ไม่มีข้อมูลอุปกรณ์ที่ยังค้างอยู่</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="filter-card rounded-xl p-4 shadow-lg flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  «
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => {
                  if (totalPages <= 5 || i === 0 || i === totalPages - 1 || Math.abs(currentPage - (i + 1)) <= 1) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-10 h-10 rounded-lg font-bold transition-all ${
                          currentPage === i + 1 
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-105" 
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  } else if (i === 1 && currentPage > 3) {
                    return <span key={i} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
                  } else if (i === totalPages - 2 && currentPage < totalPages - 2) {
                    return <span key={i} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default ListBorrow;