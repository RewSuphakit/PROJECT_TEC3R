import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import bg2 from '../../assets/bg2.png';

// ฟอนต์ไทย THSarabunNew (Base64)
const thaiFont = 'AAEAAAASAQAABAAgR0RFRgBDAAQAAAEoAAAAKEdQT1MHYQAKAAABUAAAABxHU1VCABsAAgAAAWwAAAA+T1MvMnmTYF0AAAK8AAAAYGNtYXABOgFrAAADHAAAAERnYXNwAAAAEAAAA2AAAAAIZ2x5ZvSElT0AAANoAAAGGGhlYWQfxAeKAAAJgAAAADZoaGVhB+ID/AAACbgAAAAkaG10eDEAD/sAAAncAAAASGxvY2EHEgZyAAAKJAAAACZtYXhwABkAWgAACkwAAAAgbmFtZfNWFtAAAApsAAABn3Bvc3T/bQBkAAAMDAAAACBwcmVwomb4nQAADCwAAAAHAAEAAAABAABjqvKjXw889QALA+gAAAAA2fKVxAAAAADZ8pXEAAD/4AOAAwwAAAAIAAIAAAAAAAAAAQAAAwz/zAAABAAAAAAAA4AAAQAAAAAAAAAAAAAAAAAAAAkAAQAAAAwAVAADAAAAAAACAAAAAACaAAAAAAAAAP/qAAAAAAAAAAAAAAD/+QOAAwz/4P/g/+EAAAABAAAACQAJAAkACQAAAAEAAAABAAEAAQAAAAEAAAABAAEAAQAAAAEAAAACAAEAAQAAAwACAAAAAAARAAwAAQAAAAAAAAACAAcAAQAAAAEAAQABAAAAAwQFBgcICQoLDA==';

// ต้องติดตั้ง: npm install jspdf

function ReportDetails() {
  const { transaction_id } = useParams();
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/stats/reports/${transaction_id}`);
        setBorrowRecords(response.data.borrow_records || []);
      } catch (err) {
        console.error("Error fetching report details:", err);
        setError("Failed to load report details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [transaction_id]);

  const handleExportPDF = () => {
    try {
      if (!borrowRecords || borrowRecords.length === 0) {
        alert('ไม่มีข้อมูลสำหรับ Export PDF');
        return;
      }

      const doc = new jsPDF();
      const borrower = borrowRecords[0];
      
      // หัวเอกสาร
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Transaction ID: ' + transaction_id, 105, 15, { align: 'center' });
      
      // ข้อมูลผู้ยืม
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Equipment Borrowing and Returning System', 14, 30);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Borrower: ' + (borrower.student_name || '-'), 14, 38);
      doc.text('Year: ' + (borrower.year_of_study || '-'), 14, 44);
      doc.text('Email: ' + (borrower.student_email || '-'), 14, 50);
      doc.text('Phone: ' + (borrower.phone || '-'), 14, 56);
      
      // วาดตาราง
      let startY = 68;
      const rowHeight = 10;
      const colWidths = [60, 20, 30, 40, 40];
      const startX = 14;
      
      // Header
      doc.setFillColor(66, 139, 202);
      doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text('Equipment', startX + 2, startY + 6);
      doc.text('Qty', startX + colWidths[0] + 2, startY + 6);
      doc.text('Status', startX + colWidths[0] + colWidths[1] + 2, startY + 6);
      doc.text('Borrow Date', startX + colWidths[0] + colWidths[1] + colWidths[2] + 2, startY + 6);
      doc.text('Return Date', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, startY + 6);
      
      startY += rowHeight;
      
      // Data rows
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      
      borrowRecords.forEach((record, index) => {
        // สลับสีแถว
        if (index % 2 === 1) {
          doc.setFillColor(245, 245, 245);
          doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F');
        }
        
        // ข้อมูลในแต่ละคอลัมน์
        const equipmentName = record.equipment_name || '-';
        const qty = String(record.quantity_borrow || '0');
        const status = record.status === 'Returned' ? 'Returned' : 'Borrowed';
        
        // Format วันที่แบบไทย
        const borrowDate = record.borrow_date ? 
          new Date(record.borrow_date).toLocaleString('th-TH', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) : '-';
          
        const returnDate = record.status === 'Returned' && record.return_date ? 
          new Date(record.return_date).toLocaleString('th-TH', {
            timeZone: 'Asia/Bangkok',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }) : 'Not Returned';
        
        doc.text(equipmentName.substring(0, 30), startX + 2, startY + 6);
        doc.text(qty, startX + colWidths[0] + 2, startY + 6);
        doc.text(status, startX + colWidths[0] + colWidths[1] + 2, startY + 6);
        doc.text(borrowDate, startX + colWidths[0] + colWidths[1] + colWidths[2] + 2, startY + 6);
        doc.text(returnDate, startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + 2, startY + 6);
        
        // วาดเส้นขอบ
        doc.setDrawColor(200, 200, 200);
        doc.rect(startX, startY, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'S');
        
        startY += rowHeight;
        
        // เช็คว่าเกินหน้ากระดาษหรือไม่
        if (startY > 270) {
          doc.addPage();
          startY = 20;
        }
      });
      
      // บันทึกไฟล์ PDF
      doc.save(`Report_${transaction_id}.pdf`);
      alert('Export PDF สำเร็จ!');
      
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert(`เกิดข้อผิดพลาดในการ Export PDF: ${error.message}`);
    }
  };

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
              <p className="text-lg text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
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

  if (borrowRecords.length === 0) {
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

  const borrower = borrowRecords[0];

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
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none shadow-md transition-colors text-sm sm:text-base font-medium"
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
                {borrowRecords.map(record => (
                  <tr key={record.record_id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 border-b text-center">{record.equipment_name}</td>
                    <td className="py-3 px-4 border-b text-center">{record.quantity_borrow}</td>
                    <td className="py-3 px-4 border-b text-center">
                      {record.status === 'Returned' ? (
                        <span className="badge badge-success text-white">คืนแล้ว</span>
                      ) : (
                        <span className="badge badge-warning text-white">ยังไม่คืน</span>
                      )}
                    </td>
                    <td className="py-3 px-4 border-b">
                      <div className="flex justify-center">
                        {record.status === 'Returned' && record.image_return ? (
                          <img
                            src={`http://localhost:5000/image_return/${record.image_return}`}
                            alt="Returned"
                            className="h-16 w-16 rounded-lg object-cover border"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">
                            {record.status === 'Borrowed' ? 'ยังไม่คืน' : '-'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 border-b text-center text-sm">
                      {record.borrow_date ? (
                        new Date(record.borrow_date).toLocaleString('th-TH', {
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
                      {record.status === 'Returned' && record.return_date ? (
                        new Date(record.return_date).toLocaleString('th-TH', {
                          timeZone: 'Asia/Bangkok',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      ) : (
                        <span className="text-gray-400 text-sm">
                          {record.status === 'Borrowed' ? 'ยังไม่คืน' : '-'}
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
            {borrowRecords.map(record => (
              <div key={record.record_id} className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-base text-gray-800">
                    🔧 {record.equipment_name}
                  </h3>
                  <span className={`badge badge-sm ${
                    record.status === 'Returned' ? 'badge-success' : 'badge-warning'
                  } text-white`}>
                    {record.status === 'Returned' ? 'คืนแล้ว' : 'ยังไม่คืน'}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">จำนวน:</span>
                    <span className="font-medium">{record.quantity_borrow} ชิ้น</span>
                  </div>
                  
                  {record.status === 'Returned' && record.image_return && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">รูปที่คืน:</span>
                      <img
                        src={`http://localhost:5000/image_return/${record.image_return}`}
                        alt="Returned"
                        className="h-16 w-16 rounded-lg object-cover border"
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col pt-2 border-t">
                    <span className="text-gray-600">วันที่ยืม:</span>
                    <span className="font-medium text-gray-800 mt-1">
                      {record.borrow_date ? (
                        new Date(record.borrow_date).toLocaleString('th-TH', {
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
                  
                  {record.status === 'Returned' && (
                    <div className="flex flex-col">
                      <span className="text-gray-600">วันที่คืน:</span>
                      <span className="font-medium text-green-600 mt-1">
                        {record.return_date ? (
                          new Date(record.return_date).toLocaleString('th-TH', {
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
              to="/RMUTI/ReportResults"
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