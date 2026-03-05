import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import bg2 from '../../assets/bg2.webp';
import jsPDF from 'jspdf';
import { formatThaiDate } from '../../utils/formatDate';
import Pagination from '../../components/Pagination';

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

// ชื่อเดือนภาษาไทย
const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

// สร้างรายการปี (10 ปีย้อนหลัง ถึงปีปัจจุบัน)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);



import './AdminStyles.css';


function Report() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [tempMonth, setTempMonth] = useState(null);
  const [tempYear, setTempYear] = useState(currentYear);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString()
      });
      
      // เพิ่ม month/year ถ้ามีการ filter
      if (selectedMonth !== null) {
        params.append('month', selectedMonth.toString());
        params.append('year', selectedYear.toString());
      }
      
      const response = await axios.get(`${apiUrl}/api/borrow/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data.borrow_transactions)) {
        // แปลงข้อมูลจาก borrow_transactions เป็นรูปแบบที่ใช้แสดงผล
        const allRecords = [];
        response.data.borrow_transactions.forEach(transaction => {
          transaction.borrow_items.forEach(item => {
            allRecords.push({
              item_id: item.item_id,
              transaction_id: transaction.transaction_id,
              student_name: transaction.student_name,
              student_id: transaction.student_id || '',
              equipment_name: item.equipment_name,
              quantity: item.quantity,
              borrow_date: transaction.borrow_date,
              borrow_date_iso: transaction.borrow_date,
              returned_at: item.returned_at,
              status: item.status,
              image_return: item.image_return
            });
          });
        });
        
        setReports(allRecords);
        
        const pagination = response.data.pagination || { totalPages: 1, totalCount: 0 };
        setTotalPages(pagination.totalPages || 1);
        setTotalCount(pagination.totalCount || 0);
      }
    } catch (err) {
      console.error("Error fetching report results:", err);
      setError("ไม่สามารถโหลดข้อมูลรายงานได้ กรุณาลองใหม่อีกครั้ง");
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage, selectedMonth, selectedYear]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedMonth, selectedYear]);

  // ใช้ reports โดยตรง (ไม่ต้อง filter ที่ client)
  const filteredReports = reports;

  // Pagination Logic - ไม่ต้อง slice ที่ client
  const currentItems = reports;

  const openModal = () => {
    setTempMonth(selectedMonth);
    setTempYear(selectedYear);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const applyFilter = () => {
    setSelectedMonth(tempMonth);
    setSelectedYear(tempYear);
    setIsModalOpen(false);
  };

  const resetFilter = () => {
    setSelectedMonth(null);
    setSelectedYear(currentYear);
    setTempMonth(null);
    setTempYear(currentYear);
    setIsModalOpen(false);
  };

  const getFontBase64 = async (path) => {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result.split(',')[1]; 
          resolve(base64data);
        };
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.error("Error loading font:", e);
      return null;
    }
  };

  const handleExportPDF = async () => {
    try {
      // ดึงข้อมูลทั้งหมดสำหรับ export
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        exportAll: 'true'
      });
      
      // เพิ่ม month/year ถ้ามีการ filter
      if (selectedMonth !== null) {
        params.append('month', selectedMonth.toString());
        params.append('year', selectedYear.toString());
      }
      
      const response = await axios.get(`${apiUrl}/api/borrow/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data || !response.data.borrow_transactions || response.data.borrow_transactions.length === 0) {
        toast.warning("ไม่มีข้อมูลสำหรับออกรายงาน");
        return;
      }
      
      // แปลงข้อมูลสำหรับ PDF
      const allRecordsForPDF = [];
      response.data.borrow_transactions.forEach(transaction => {
        transaction.borrow_items.forEach(item => {
          allRecordsForPDF.push({
            item_id: item.item_id,
            transaction_id: transaction.transaction_id,
            student_name: transaction.student_name,
            student_id: transaction.student_id || '',
            equipment_name: item.equipment_name,
            quantity: item.quantity,
            borrow_date: transaction.borrow_date,
            borrow_date_iso: transaction.borrow_date,
            returned_at: item.returned_at,
            status: item.status,
            image_return: item.image_return
          });
        });
      });

      const doc = new jsPDF();
      
      // Load Font
      const fontBase64 = await getFontBase64('/RMUTI/fonts/THSarabunNew.ttf');
      if (!fontBase64) {
        toast.error("ไม่สามารถโหลดฟอนต์ภาษาไทยได้");
        return;
      }

      doc.addFileToVFS('THSarabunNew.ttf', fontBase64);
      doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal');
      doc.setFont('THSarabunNew');

      let yPosition = 20;

      // Header
      doc.setFontSize(20);
      doc.text('รายงานประวัติการยืม-คืนอุปกรณ์', 105, yPosition, { align: 'center' });
      yPosition += 10;
      
      doc.setFontSize(16);
      doc.text(`ข้อมูลประจำ: ${getSelectedLabel()}`, 105, yPosition, { align: 'center' });
      yPosition += 15;

      // Table Header
      doc.setFontSize(10);
      const headers = ['ลำดับ', 'ชื่อผู้ยืม', 'รหัสนักศึกษา', 'อุปกรณ์', 'จำนวน', 'วันที่ยืม', 'เวลาคืน'];
      const xPositions = [12, 25, 60, 95, 125, 140, 170];
      
      doc.setFillColor(220, 220, 220);
      doc.rect(10, yPosition - 5, 190, 8, 'F');
      
      headers.forEach((h, i) => {
        doc.text(h, xPositions[i], yPosition);
      });
      yPosition += 8;

      // Data Rows
      doc.setFontSize(9);
      allRecordsForPDF.forEach((item, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
          // Re-draw header on new page
          doc.setFontSize(10);
          doc.setFillColor(220, 220, 220);
          doc.rect(10, yPosition - 5, 190, 8, 'F');
          headers.forEach((h, i) => {
            doc.text(h, xPositions[i], yPosition);
          });
          yPosition += 8;
          doc.setFontSize(9);
        }

        doc.text((index + 1).toString(), xPositions[0], yPosition);
        doc.text(item.student_name || '-', xPositions[1], yPosition);
        doc.text(item.student_id || '-', xPositions[2], yPosition);
        
        // ชื่ออุปกรณ์ (ใช้ splitTextToSize)
        const equipmentName = item.equipment_name || '-';
        const splitEquipmentName = doc.splitTextToSize(equipmentName, 28);
        doc.text(splitEquipmentName, xPositions[3], yPosition);
        
        doc.text(item.quantity ? item.quantity.toString() : '0', xPositions[4], yPosition);
        
        // วันที่ยืม (ย่อ)
        const borrowDateStr = item.borrow_date 
          ? new Date(item.borrow_date).toLocaleString('th-TH', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '-';
        doc.text(borrowDateStr, xPositions[5], yPosition);
        
        // เวลาคืน (ย่อ)
        const returnDateStr = item.returned_at
          ? new Date(item.returned_at).toLocaleString('th-TH', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '-';
        doc.text(returnDateStr, xPositions[6], yPosition);

        yPosition += 7;
        
        // Solid line separator
        doc.setDrawColor(230, 230, 230);
        doc.line(10, yPosition - 3, 200, yPosition - 3);
      });

      // Footer stats
      yPosition += 5;
      doc.setFontSize(12);
      doc.text(`รวมทั้งหมด ${allRecordsForPDF.length} รายการ`, 105, yPosition, { align: 'center' });

      doc.save(`report_${selectedMonth || 'all'}_${selectedYear}.pdf`);
      toast.success("บันทึกไฟล์ PDF สำเร็จ");

    } catch (err) {
      console.error("Export Error:", err);
      toast.error("เกิดข้อผิดพลาดในการออกรายงาน");
    }
  };

  const getSelectedLabel = () => {
    if (selectedMonth !== null) {
      return `${thaiMonths[selectedMonth]} ${selectedYear + 543}`;
    }
    return 'ทั้งหมด';
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundImage: `url(${bg2})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-xl font-medium text-gray-700">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundImage: `url(${bg2})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>

      <div style={{ 
        minHeight: '100vh', 
        backgroundImage: `url(${bg2})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="lg:pl-72">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Header Section */}
            <div className="filter-card rounded-2xl p-6 mb-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                      รายงานประวัติการยืม-คืนอุปกรณ์
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">ติดตามและจัดการประวัติการยืมอุปกรณ์</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* Export PDF Button */}
                  <button
                    onClick={handleExportPDF}
                    disabled={filteredReports.length === 0}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF
                  </button>

                  {/* Filter Button */}
                  <button
                    onClick={openModal}
                    className="gradient-btn text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    เลือกเดือน/ปี
                  </button>
                  
                  {/* Selected Filter Display */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 px-4 py-2 rounded-xl">
                    <span className="text-sm text-gray-500">กำลังดู:</span>
                    <span className="ml-2 font-semibold text-blue-600">{getSelectedLabel()}</span>
                  </div>

                  {/* Reset Button */}
                  {selectedMonth !== null && (
                    <button
                      onClick={resetFilter}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 px-4 py-2 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      รีเซ็ต
                    </button>
                  )}
                </div>
              </div>
              
              {/* Stats */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg shadow-sm border border-blue-100">
                  <span className="text-sm opacity-90">รายการทั้งหมด</span>
                  <span className="ml-2 font-bold text-lg">{totalCount}</span>
                </div>
                <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg shadow-sm border border-orange-100">
                  <span className="text-sm opacity-90">กำลังแสดงหน้า</span>
                  <span className="ml-2 font-bold text-lg">{currentPage}/{totalPages}</span>
                </div>
              </div>
            </div>

            {/* Table Section */}
            {filteredReports.length === 0 ? (
              <div className="filter-card rounded-2xl p-12 text-center shadow-xl">
                <div className="text-8xl mb-4">📭</div>
                <p className="text-xl text-gray-600">ไม่พบข้อมูลรายงาน</p>
                <p className="text-gray-400 mt-2">ลองเปลี่ยนช่วงเวลาที่ต้องการดู</p>
              </div>
            ) : (
              <div className="overflow-hidden shadow-2xl rounded-2xl">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 uppercase text-sm leading-normal">
                        <th className="py-4 px-6 text-left font-semibold">ชื่อผู้ยืม</th>
                        <th className="py-4 px-6 text-left font-semibold">รหัสนักศึกษา</th>
                        <th className="py-4 px-6 text-left font-semibold">อุปกรณ์</th>
                        <th className="py-4 px-6 text-center font-semibold">จำนวน</th>
                        <th className="py-4 px-6 text-center font-semibold">วันที่ยืม</th>
                        <th className="py-4 px-6 text-center font-semibold">เวลาคืน</th>
                        <th className="py-4 px-6 text-center font-semibold">รายละเอียด</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.map((report, index) => (
                        <tr 
                          key={report.item_id} 
                          className={`table-row border-b ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'} hover:bg-blue-50/30 transition-colors`}
                        >
                          <td className="py-4 px-6 font-medium text-gray-800">{report.student_name}</td>
                          <td className="py-4 px-6 text-gray-600">{report.student_id || '-'}</td>
                          <td className="py-4 px-6">
                            <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-lg text-sm">
                              {report.equipment_name}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                              {report.quantity}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center text-gray-600">{formatThaiDate(report.borrow_date)}</td>
                          <td className="py-4 px-6 text-center text-gray-600">
                            {report.returned_at ? (
                              <span className="text-green-600 font-medium">{formatThaiDate(report.returned_at)}</span>
                            ) : (
                              <span className="text-red-500 font-medium">ยังไม่คืน</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <Link
                              to={`/RMUTI/ReportDetails/${report.transaction_id}`}
                              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              ดูรายละเอียด
                            </Link>
                          </td>
                        </tr>
                      ))} 
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Pagination */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </div>
      </div>

      {/* Month/Year Picker Modal */}
      {isModalOpen && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-content bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">เลือกเดือนและปี</h2>
                    <p className="text-white/80 text-sm">กรองข้อมูลตามช่วงเวลา</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Year Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  เลือกปี
                </h3>
                <div className="flex flex-wrap gap-2">
                  {years.map(year => (
                    <button
                      key={year}
                      onClick={() => setTempYear(year)}
                      className={`year-btn px-4 py-2 rounded-xl font-medium ${
                        tempYear === year
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {year + 543}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                  </svg>
                  เลือกเดือน
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {thaiMonths.map((month, index) => (
                    <button
                      key={index}
                      onClick={() => setTempMonth(index)}
                      className={`month-btn py-3 px-4 rounded-xl font-medium text-center ${
                        tempMonth === index
                          ? 'selected bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      {month}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Preview */}
              {tempMonth !== null && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
                  <p className="text-center text-gray-600">
                    คุณเลือก: <span className="font-bold text-blue-600">{thaiMonths[tempMonth]} {tempYear + 543}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-gray-50 border-t flex flex-wrap gap-3 justify-end">
              <button
                onClick={resetFilter}
                className="px-6 py-3 rounded-xl font-medium text-white  bg-purple-500 hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                รีเซ็ต
              </button>
              <button
                onClick={closeModal}
                className="px-6 py-3 rounded-xl font-medium text-white  bg-red-500 hover:bg-red-600"
              >
                ยกเลิก
              </button>
              <button
                onClick={applyFilter}
                disabled={tempMonth === null}
                className="gradient-btn px-8 py-3 rounded-xl font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Report;
