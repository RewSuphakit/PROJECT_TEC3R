import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

function ReportDetails() {
  const { transaction_id } = useParams();
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useRef เพื่ออ้างอิงส่วนที่ต้องการพิมพ์ (สำหรับ Export as PDF)
  const printRef = useRef();

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

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-lg text-gray-600">Loading report details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  if (borrowRecords.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-gray-600">No report details available.</p>
      </div>
    );
  }

  // สมมติว่าข้อมูลนักศึกษาสำหรับทุก record เหมือนกัน ให้ดึงข้อมูลจาก record แรก
  const borrower = borrowRecords[0];

  return (

<div className="min-h-screen bg-gray-50 font-[Kanit]">
      <div className="lg:pl-72">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 text-center">รายงานหมายเลข {transaction_id}</h1>
      <div className="flex flex-col sm:flex-row justify-between  mb-6">
      <div className=" p-4 ">
  <p className="text-xl font-bold border-b pb-2">
    ระบบยืมคืนอุปกรณ์ชุดฝึกการเรียนนการสอน
  </p>
  <div className="mt-4 space-y-2">
    <div className="flex">
      <span className="font-semibold w-40 ">ชื่อผู้ยืม:</span>
      <span>{borrower.student_name}</span>
    </div>
    <div className="flex">
      <span className="font-semibold w-40">ชั้นปี:</span>
      <span>{borrower.year_of_study}</span>
    </div>
    <div className="flex">
      <span className="font-semibold w-40">อีเมลนักศึกษา:</span>
      <span>{borrower.student_email}</span>
    </div>
    <div className="flex">
      <span className="font-semibold w-40">เบอร์:</span>
      <span>{borrower.phone}</span>
    </div>
  </div>
</div>

        <div className="p-4">
        <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
          >
            Export as PDF
          </button>
        </div>
      </div>
      <div ref={printRef} className="overflow-auto shadow-lg rounded-lg bg-white">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-2 border-b">ชื่ออุปกรณ์</th>
              <th className="py-2 border-b">จำนวนอุปกรณ์ที่ยืม</th>
             <th className="py-2 border-b">รูปภาพที่คืน</th>
              <th className="py-2  border-b">เวลาที่คืน</th>
            </tr>
          </thead>
          <tbody>
            {borrowRecords.map(record => (
              <tr key={record.record_id} className="hover:bg-gray-100 transition-colors duration-300 ">
                <td className="py-2  border-b text-center">{record.equipment_name}</td>
                <td className="py-2  border-b text-center">{record.quantity_borrow}</td>
                <td className="py-2  border-b  flex justify-center"><img
                                src={`http://localhost:5000/image_return/${record.image_return}`}
                                alt="Returned"
                                className="h-16 w-16 rounded-lg object-cover"  
                              /></td>

                <td className="py-2 px-4 border-b text-center">
                  {new Date(record.return_date).toLocaleString('th-TH', {
                    timeZone: 'Asia/Bangkok',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
            ))} 
          </tbody>
        </table>
      </div>
      <div className=" py-4 flex flex-col sm:flex-row justify-between items-center mb-6">
        <div className="flex space-x-4 mt-4 sm:mt-0">
          
          <Link
            to="/RMUTI/ReportResults"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
          >
         กลับไปยังหน้ารายงาน
          </Link>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}

export default ReportDetails;
