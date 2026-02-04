import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import bg2 from '../../assets/bg2.png';



function ReportDetails() {
  const { transaction_id } = useParams();
  const [borrowItems, setBorrowItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/api/borrow/transaction/${transaction_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBorrowItems(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching report details:', err);
        setError('ไม่สามารถโหลดข้อมูลรายงานได้');
      } finally {
        setLoading(false);
      }
    };

    if (transaction_id) {
      fetchReportDetails();
    }
  }, [transaction_id]);

  // --- ฟังก์ชันช่วยแปลงไฟล์ฟอนต์เป็น Base64 ---
  const getFontBase64 = async (path) => {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // ตัดส่วนหัว data:...base64, ออกอัตโนมัติ
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

  // --- ฟังก์ชัน Export PDF ---
  const handleExportPDF = async () => {
    try {
      if (!borrowItems || borrowItems.length === 0) {
        alert("ไม่มีข้อมูลสำหรับออกรายงาน");
        return;
      }

      const doc = new jsPDF();

      // 1. โหลดฟอนต์จาก public
      const fontBase64 = await getFontBase64('/RMUTI/fonts/THSarabunNew.ttf');
      
      if (!fontBase64) {
        alert("ไม่พบไฟล์ฟอนต์! กรุณาตรวจสอบว่ามีไฟล์ public/fonts/THSarabunNew.ttf หรือไม่");
        return;
      }

      // 2. ตั้งค่าฟอนต์
      doc.addFileToVFS('THSarabunNew.ttf', fontBase64);
      doc.addFont('THSarabunNew.ttf', 'THSarabunNew', 'normal');
      doc.setFont('THSarabunNew');

      const borrower = borrowItems[0];
      let yPosition = 20;

      // หัวเรื่อง
      doc.setFontSize(20);
      doc.text(`รายงานการยืม #${transaction_id}`, 105, yPosition, { align: 'center' });
      yPosition += 15;

      // ข้อมูลผู้ยืม
      doc.setFontSize(14);
      doc.text('ข้อมูลผู้ยืม', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(12);
      doc.text(`ชื่อผู้ยืม: ${borrower.student_name || '-'}`, 20, yPosition);
      yPosition += 7;
      doc.text(`ชั้นปี: ${borrower.year_of_study || '-'}`, 20, yPosition);
      yPosition += 7;
      doc.text(`อีเมล: ${borrower.student_email || '-'}`, 20, yPosition);
      yPosition += 7;
      doc.text(`เบอร์โทร: ${borrower.phone || '-'}`, 20, yPosition);
      yPosition += 15;

      // หัวตาราง
      doc.setFontSize(14);
      doc.text('รายการอุปกรณ์ที่ยืม', 20, yPosition);
      yPosition += 10;

      // วาดตาราง
      doc.setFontSize(10);
      const tableHeaders = ['ลำดับ', 'ชื่ออุปกรณ์', 'จำนวน', 'สถานะ', 'วันที่ยืม', 'วันที่คืน'];
      const colWidths = [10, 50, 15, 20, 42, 42];
      let xPosition = 20;

      // พื้นหลังหัวตาราง
      doc.setFillColor(220, 220, 220);
      doc.rect(20, yPosition - 5, 180, 8, 'F');
      
      tableHeaders.forEach((header, index) => {
        doc.text(header, xPosition, yPosition);
        xPosition += colWidths[index];
      });
      yPosition += 8;

      // วาดข้อมูลในตาราง
      borrowItems.forEach((item, index) => {
        const startYPosition = yPosition;
        xPosition = 20;
        
        // แปลงวันที่ให้สั้นลง (ตัวเลขแทนชื่อเดือน)
        const borrowDate = item.borrow_date 
          ? new Date(item.borrow_date).toLocaleString('th-TH', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '-';

        const returnDate = item.returned_at
          ? new Date(item.returned_at).toLocaleString('th-TH', {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          : '-';

        const status = item.status === 'Returned' ? 'คืนแล้ว' : 'ยังไม่คืน';

        // ลำดับ
        doc.text((index + 1).toString(), xPosition, yPosition);
        xPosition += colWidths[0];
        
        // ชื่ออุปกรณ์ (ใช้ splitTextToSize สำหรับข้อความยาว)
        const equipmentName = item.equipment_name || '-';
        const splitEquipmentName = doc.splitTextToSize(equipmentName, colWidths[1] - 2);
        doc.text(splitEquipmentName, xPosition, yPosition);
        const equipmentNameHeight = splitEquipmentName.length * 4; // ความสูงของชื่ออุปกรณ์
        xPosition += colWidths[1];
        
        // จำนวน
        doc.text((item.quantity || 0).toString(), xPosition, yPosition);
        xPosition += colWidths[2];
        
        // สถานะ
        doc.text(status, xPosition, yPosition);
        xPosition += colWidths[3];
        
        // วันที่ยืม (ใช้ splitTextToSize)
        const splitBorrowDate = doc.splitTextToSize(borrowDate, colWidths[4] - 2);
        doc.text(splitBorrowDate, xPosition, yPosition);
        const borrowDateHeight = splitBorrowDate.length * 4;
        xPosition += colWidths[4];

        // วันที่คืน (ใช้ splitTextToSize)
        const splitReturnDate = doc.splitTextToSize(returnDate, colWidths[5] - 2);
        doc.text(splitReturnDate, xPosition, yPosition);
        const returnDateHeight = splitReturnDate.length * 4;
        
        // หาความสูงสูงสุดของแถวนี้
        const maxHeight = Math.max(equipmentNameHeight, borrowDateHeight, returnDateHeight, 4);
        yPosition += maxHeight + 2;

        // ขึ้นหน้าใหม่ถ้าเกินพื้นที่
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
      });

      // บันทึกไฟล์
      doc.save(`รายงาน_${transaction_id}.pdf`);

    } catch (err) {
      console.error("PDF Export Error:", err);
      alert(`เกิดข้อผิดพลาดในการ Export PDF: ${err.message}`);
    }
  };

  // --- Render Loading ---
  if (loading) {
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
              <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Error ---
  if (error) {
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Render No Data ---
  if (borrowItems.length === 0) {
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600">ไม่มีข้อมูลรายงาน</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const borrower = borrowItems[0];

  // --- Render Main Content ---
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
          
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 text-center mb-4 sm:mb-6">
              📋 รายงานหมายเลข {transaction_id}
            </h1>
            
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              {/* ข้อมูลผู้ยืม */}
              <div className="flex-1">
                <p className="text-base sm:text-lg font-bold border-b pb-2 mb-3">
                  ระบบยืมคืนอุปกรณ์ชุดฝึกการเรียนการสอน
                </p>
                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex flex-col sm:flex-row">
                    <span className="font-semibold sm:w-40">ชื่อผู้ยืม:</span>
                    <span className="text-gray-700">{borrower.student_name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="font-semibold sm:w-40">ชั้นปี:</span>
                    <span className="text-gray-700">{borrower.year_of_study}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="font-semibold sm:w-40">อีเมลนักศึกษา:</span>
                    <span className="text-gray-700 break-all">{borrower.student_email}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row">
                    <span className="font-semibold sm:w-40">เบอร์:</span>
                    <span className="text-gray-700">{borrower.phone}</span>
                  </div>
                </div>
              </div>

              {/* ปุ่ม Export */}
              <div className="flex items-start justify-center lg:justify-end">
                <button
                  onClick={handleExportPDF}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none shadow-md transition-colors text-sm sm:text-base font-medium"
                >
                  📄 Export as PDF
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block overflow-auto shadow-lg rounded-lg bg-white p-4">
            <table className="table w-full">
              <thead>
                <tr className="bg-gray-200 text-sm font-semibold text-gray-700">
                  <th className="py-3 px-4 border-b">ชื่ออุปกรณ์</th>
                  <th className="py-3 px-4 border-b">จำนวนที่ยืม</th>
                  <th className="py-3 px-4 border-b">สถานะ</th>
                  <th className="py-3 px-4 border-b">รูปภาพที่คืน</th>
                  <th className="py-3 px-4 border-b">วันที่ยืม</th>
                  <th className="py-3 px-4 border-b">เวลาที่คืน</th>
                </tr>
              </thead>
              <tbody>
                {borrowItems.map(item => (
                  <tr key={item.item_id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b text-center">{item.equipment_name}</td>
                    <td className="py-3 px-4 border-b text-center">{item.quantity}</td>
                    <td className="py-3 px-4 border-b text-center">
                      {item.status === 'Returned' ? (
                        <span className="badge badge-success text-white">คืนแล้ว</span>
                      ) : (
                        <span className="badge badge-warning text-white">ยังไม่คืน</span>
                      )}
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex justify-center">
                        {item.status === 'Returned' && item.image_return ? (
                          <img
                            src={`${apiUrl}/image_return/${item.image_return}`}
                            alt="Returned"
                            className="h-16 w-16 rounded-lg object-cover border"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">
                            {item.status === 'Borrowed' ? 'ยังไม่คืน' : '-'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b text-center text-sm">
                      {item.borrow_date ? (
                        new Date(item.borrow_date).toLocaleString('th-TH', {
                          timeZone: 'Asia/Bangkok',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 border-b text-center text-sm">
                      {item.status === 'Returned' && item.returned_at ? (
                        new Date(item.returned_at).toLocaleString('th-TH', {
                          timeZone: 'Asia/Bangkok',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      ) : (
                        <span className="text-gray-400 text-sm">
                          {item.status === 'Borrowed' ? 'ยังไม่คืน' : '-'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {borrowItems.map(item => (
              <div key={item.item_id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-base text-gray-800">
                    🔧 {item.equipment_name}
                  </h3>
                  <span className={`badge badge-sm ${
                    item.status === 'Returned' ? 'badge-success' : 'badge-warning'
                  } text-white`}>
                    {item.status === 'Returned' ? 'คืนแล้ว' : 'ยังไม่คืน'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">จำนวน:</span>
                    <span className="font-medium">{item.quantity} ชิ้น</span>
                  </div>
                  
                  {item.status === 'Returned' && item.image_return && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">รูปที่คืน:</span>
                      <img
                        src={`${apiUrl}/image_return/${item.image_return}`}
                        alt="Returned"
                        className="h-16 w-16 rounded-lg object-cover border"
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col pt-2 border-t">
                    <span className="text-gray-600">วันที่ยืม:</span>
                    <span className="font-medium text-gray-800 mt-1">
                      {item.borrow_date ? (
                        new Date(item.borrow_date).toLocaleString('th-TH', {
                          timeZone: 'Asia/Bangkok',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      ) : '-'}
                    </span>
                  </div>
                  
                  {item.status === 'Returned' && (
                    <div className="flex flex-col">
                      <span className="text-gray-600">วันที่คืน:</span>
                      <span className="font-medium text-green-600 mt-1">
                        {item.returned_at ? (
                          new Date(item.returned_at).toLocaleString('th-TH', {
                            timeZone: 'Asia/Bangkok',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        ) : '-'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Back Button */}
          <div className="mt-6 flex justify-center sm:justify-start">
            <Link
              to="/RMUTI/Report"
              className="w-full sm:w-auto px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none shadow-md transition-colors text-center"
            >
              ← กลับไปยังหน้ารายงาน
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportDetails;