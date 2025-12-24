import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import bg2 from '../../assets/bg2.png';

function ListReturn() {
  const [tools, setTools] = useState([]);
  const [popupImage, setPopupImage] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const groupsPerPage = 5;
  const [openGroups, setOpenGroups] = useState([]);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // ฟังก์ชัน mouse events สำหรับ popup รูป (Desktop)
  const handleImageMouseEnter = (e, imageUrl) => {
    const rect = e.target.getBoundingClientRect();
    setPopupImage(imageUrl);
    setPopupPosition({ x: rect.right + 10, y: rect.top });
  };

  const handleImageMouseLeave = () => {
    setPopupImage(null);
  };

  // ฟังก์ชันสำหรับ Image Modal (Mobile)
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  // ฟังก์ชันจัดรูปแบบวันที่ให้เป็นแบบไทย
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

  useEffect(() => {
    const fetchReturnRecords = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/borrowRecords/all");
        if (response.data && Array.isArray(response.data.borrow_transactions)) {
          const filteredTransactions = response.data.borrow_transactions.filter(
            (transaction) =>
              transaction.borrow_records.every(
                (record) => record.status.toLowerCase() === "returned"
              )
          );

          const flattenedRecords = [];
          filteredTransactions.forEach((transaction) => {
            transaction.borrow_records.forEach((record, index) => {
              flattenedRecords.push({
                groupId: transaction.transaction_id,
                record_id: `${transaction.transaction_id}-${index}`,
                student_name: transaction.student_name,
                equipment_name: record.equipment_name,
                quantity: record.quantity_borrow,
                status: record.status,
                image_return: record.image_return,
                return_date: transaction.return_date,
              });
            });
          });

          setTools(flattenedRecords);
        } else {
          toast.error("ข้อมูลที่ได้รับไม่ถูกต้อง");
        }
      } catch (error) {
        console.error("Error fetching returned records:", error);
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchReturnRecords();
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

  // เรียงลำดับกลุ่มตามวันที่คืน
  const groupKeys = useMemo(() => {
    return Object.keys(groupedRecords).sort(
      (a, b) =>
        new Date(groupedRecords[b][0].return_date) -
        new Date(groupedRecords[a][0].return_date)
    );
  }, [groupedRecords]);

  // Pagination สำหรับกลุ่ม
  const totalPages = Math.ceil(groupKeys.length / groupsPerPage);
  const currentGroupKeys = groupKeys.slice(
    (currentPage - 1) * groupsPerPage,
    currentPage * groupsPerPage
  );

  // ฟังก์ชันเปิด/ปิด dropdown ของกลุ่ม
  const toggleGroup = (groupId) => {
    setOpenGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundImage: `url(${bg2})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="lg:pl-72">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">📦 รายการคืนอุปกรณ์</h1>
          
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
              <p className="text-base sm:text-lg text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-auto shadow-lg rounded-lg bg-white p-4">
                <table className="table w-full">
                  <thead>
                    <tr className="text-sm font-semibold text-gray-700 text-center">
                      <th className="px-4 py-3">ชื่อผู้ยืม</th>
                      <th className="px-4 py-3">ชื่ออุปกรณ์</th>
                      <th className="px-4 py-3">จำนวนที่คืน</th>
                      <th className="px-4 py-3">สถานะ</th>
                      <th className="px-4 py-3">รูปที่คืน</th>
                      <th className="px-4 py-3">วันที่คืน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGroupKeys.length ? (
                      currentGroupKeys.map((groupId) => {
                        const groupItems = groupedRecords[groupId];
                        if (groupItems.length === 1) {
                          const item = groupItems[0];
                          return (
                            <tr key={item.record_id} className="hover:bg-gray-50">
                              <td className="py-4 px-4 text-center">{item.student_name}</td>
                              <td className="py-4 px-4 text-center">{item.equipment_name}</td>
                              <td className="py-4 px-4 text-center">{item.quantity}</td>
                              <td className="py-4 px-4 text-center">
                                <span className="badge badge-success text-white">คืนแล้ว</span>
                              </td>
                              <td className="py-4 px-4 flex items-center justify-center">
                                <img
                                  src={`http://localhost:5000/image_return/${item.image_return}`}
                                  alt="Returned"
                                  className="w-16 h-16 rounded-lg object-cover border cursor-pointer"
                                  onMouseEnter={(e) => handleImageMouseEnter(e, `http://localhost:5000/image_return/${item.image_return}`)}
                                  onMouseLeave={handleImageMouseLeave}
                                />
                              </td>
                              <td className="py-4 px-4 text-center text-sm">{formatThaiDate(item.return_date)}</td>
                            </tr>
                          );
                        } else {
                          const firstItem = groupItems[0];
                          const hiddenItems = groupItems.slice(1);
                          return (
                            <React.Fragment key={groupId}>
                              <tr
                                onClick={() => toggleGroup(groupId)}
                                className="cursor-pointer bg-gray-100 hover:bg-gray-200"
                              >
                                <td className="py-4 px-4 text-center font-semibold">
                                  {firstItem.student_name}
                                  <span className="ml-2 text-green-500">
                                    {openGroups.includes(groupId) ? "▾" : "▸"}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-center">{firstItem.equipment_name}</td>
                                <td className="py-4 px-4 text-center">{firstItem.quantity}</td>
                                <td className="py-4 px-4 text-center">
                                  <span className="badge badge-success text-white">คืนแล้ว</span>
                                </td>
                                <td className="py-4 px-4 flex items-center justify-center">
                                  <img
                                    src={`http://localhost:5000/image_return/${firstItem.image_return}`}
                                    alt="Returned"
                                    className="w-16 h-16 rounded-lg object-cover border cursor-pointer"
                                    onMouseEnter={(e) => handleImageMouseEnter(e, `http://localhost:5000/image_return/${firstItem.image_return}`)}
                                    onMouseLeave={handleImageMouseLeave}
                                  />
                                </td>
                                <td className="py-4 px-4 text-center text-sm">{formatThaiDate(firstItem.return_date)}</td>
                              </tr>
                              {openGroups.includes(groupId) &&
                                hiddenItems.map((item) => (
                                  <tr key={item.record_id} className="bg-gray-50">
                                    <td className="py-4 px-4 text-center"></td>
                                    <td className="py-4 px-4 text-center">{item.equipment_name}</td>
                                    <td className="py-4 px-4 text-center">{item.quantity}</td>
                                    <td className="py-4 px-4 text-center">
                                      <span className="badge badge-success text-white">คืนแล้ว</span>
                                    </td>
                                    <td className="py-4 px-4 flex items-center justify-center">
                                      <img
                                        src={`http://localhost:5000/image_return/${item.image_return}`}
                                        alt="Returned"
                                        className="w-16 h-16 rounded-lg object-cover border cursor-pointer"
                                        onMouseEnter={(e) => handleImageMouseEnter(e, `http://localhost:5000/image_return/${item.image_return}`)}
                                        onMouseLeave={handleImageMouseLeave}
                                      />
                                    </td>
                                    <td className="py-4 px-4 text-center text-sm">{formatThaiDate(item.return_date)}</td>
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
                              groupItems.length > 1 && toggleGroup(groupId);
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
                                src={`http://localhost:5000/image_return/${groupItems[0].image_return}`}
                                alt="Returned"
                                className="w-16 h-16 rounded-lg object-cover border cursor-pointer hover:opacity-80 transition-opacity image-clickable"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openImageModal(`http://localhost:5000/image_return/${groupItems[0].image_return}`);
                                }}
                              />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm">
                              <span className="text-gray-600">วันที่คืน:</span>
                              <span className="font-medium text-gray-700 mt-1 sm:mt-0">
                                {formatThaiDate(groupItems[0].return_date)}
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
                                      src={`http://localhost:5000/image_return/${item.image_return}`}
                                      alt="Returned"
                                      className="w-16 h-16 rounded-lg object-cover border cursor-pointer hover:opacity-80 transition-opacity image-clickable"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openImageModal(`http://localhost:5000/image_return/${item.image_return}`);
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
          {popupImage && (
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
              onMouseLeave={handleImageMouseLeave}
            >
              <img
                src={popupImage}
                alt="popup"
                style={{ width: "320px", height: "320px", objectFit: "contain", borderRadius: "8px" }}
              />
            </div>
          )}

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
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none px-3 sm:px-4 disabled:bg-gray-300"
                >
                  «
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`btn btn-sm ${
                      currentPage === i + 1 
                        ? "bg-green-500 hover:bg-green-600 text-white border-none" 
                        : "btn-outline"
                    } px-3 sm:px-4`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none px-3 sm:px-4 disabled:bg-gray-300"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListReturn;