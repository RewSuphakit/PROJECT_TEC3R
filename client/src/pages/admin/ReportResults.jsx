import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

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
        // หาก key จริงใน response เป็น borrow_transactions ให้แก้ไขตรงนี้
        setReports(response.data.borrow_transactions || []);
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
    <div className="container lg:pl-72 mx-auto py-8">

      <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">📅 รายงาน</h1>
              <p className="text-sm text-gray-500 mt-1">
                ดูรายงานการยืมอุปกรณ์ทั้งหมด
              </p>
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
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border-b">รหัสรายงาน</th>
                <th className="py-2 px-4 border-b">ชื่อผู้ยืม</th>
                <th className="py-2 px-4 border-b">วันที่คืน</th>
                <th className="py-2 px-4 border-b">รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map(report => (
                <tr key={report.transaction_id} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b text-center">{report.transaction_id}</td>
                  <td className="py-2 px-4 border-b">{report.student_name}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {new Date(report.return_date).toLocaleString('th-TH', {
                      timeZone: 'Asia/Bangkok',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
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
  );
}

export default ReportResults;
