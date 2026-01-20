import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import bg2 from '../../assets/bg2.png';

function ReportResults() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // ใช้ state สำหรับเก็บเดือนในรูปแบบ "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stats/reports');
        let filteredTransactions = [];
        if (response.data && Array.isArray(response.data.borrow_transactions)) {
          // กรองเฉพาะ transaction ที่อุปกรณ์ทั้งหมดถูกคืน (status = "Returned")
          filteredTransactions = response.data.borrow_transactions.filter(
            (transaction) =>
              transaction.borrow_records.every(
                (record) => record.status.toLowerCase() === "returned"
              )
          );
        }
        setReports(filteredTransactions);
      } catch (err) {
        console.error("Error fetching report results:", err);
        setError("Failed to load report results. Please try again later.");
        toast.error("Error fetching report results");
      } finally {
        setLoading(false);
      }
    };
  
    fetchReports();
  }, []);
  

  // กรองรายงานตามเดือนที่เลือก
  // ถ้า selectedMonth เป็นค่าว่าง แสดงทั้งหมด
  const filteredReports = selectedMonth
    ? reports.filter(report => {
        const reportDate = new Date(report.return_date);
        const [selectedYear, selectedMonthNumber] = selectedMonth.split('-');
        return (
          reportDate.getFullYear() === parseInt(selectedYear, 10) &&
          reportDate.getMonth() + 1 === parseInt(selectedMonthNumber, 10)
        );
      })
    : reports;

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-lg text-gray-600">Loading report results...</p>
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

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundImage: `url(${bg2})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>      <div className="lg:pl-72">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">📅 รายงานคนคืนอุปกรณ์</h1>
            </div>
           
          </div>
      <div className="flex items-center space-x-2 mb-4 px-4">
        <label htmlFor="month-select" className="font-semibold">
          เลือกเดือน:
        </label>
        <input
          id="month-select"
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
        {/* ปุ่มรีเซ็ตเลือกเดือน */}
        {selectedMonth && (
          <button
            onClick={() => setSelectedMonth('')}
            className="text-sm text-red-500 underline"
          >
            รีเซ็ต
          </button>
        )}
      </div>
      {filteredReports.length === 0 ? (
        <p className="text-center text-gray-600">No report results available.</p>
      ) : (
        <div className="overflow-auto shadow-lg rounded-lg bg-white">
          <table className="min-w-full">
            <thead>
              <tr >
                <th className="py-2 px-4 border-b">รหัสรายงาน</th>
                <th className="py-2 px-4 border-b">ชื่อผู้ยืม</th>
                <th className="py-2 px-4 border-b">สถานะ</th>
                <th className="py-2 px-4 border-b">รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map(report => (
                <tr key={report.transaction_id} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b text-center">{report.transaction_id}</td>
                  <td className="py-2 px-4 border-b text-center">{report.student_name}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {(report.return_date) ? <span className="text-green-500">คืนแล้ว</span> : <span className="text-red-500">ยังไม่คืน</span>}
                  </td>
                  <td className="py-2 px-4 border-b text-center">
                    <Link
                      to={`/RMUTI/ReportDetails/${report.transaction_id}`}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ดูรายละเอียด
                    </Link>
                  </td>
                </tr>
              ))} 
            </tbody>
          </table>
        </div>
      )}
    </div>
    </div>
    </div>
  );
}

export default ReportResults;
