import React, { useState, useEffect } from 'react';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
function Activity() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());

  // ดึงข้อมูลกิจกรรมจาก API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/api/borrowRecords/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const filtered = response.data.borrow_transactions?.filter(transaction => {
          const borrowDate = new Date(transaction.borrow_date);
          const diffInHours = (now - borrowDate.getTime()) / 3600000;
          return diffInHours <= 24;
        }) || [];
  
        // เรียงจากใหม่ไปเก่าโดยดูจาก borrow_date
        filtered.sort((a, b) => new Date(b.borrow_date) - new Date(a.borrow_date));
  
        setTransactions(filtered);
      } catch (err) {
        console.error("Error fetching transactions:", err.message);
        setError("Failed to fetch activity records. Please try again later.");
      }
    };
  
    fetchTransactions();
  }, [now]);
  

  // อัปเดต "now" ทุก ๆ นาที เพื่อให้การคำนวณเวลาที่ผ่านไปเปลี่ยนแปลง
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {error && <p className="text-red-500">{error}</p>}
      <h2 className="text-2xl font-semibold mb-4">กิจกรรมล่าสุด (ภายใน 24 ชั่วโมง)</h2>
      {transactions.length === 0 ? (
        <p>ไม่มีข้อมูลกิจกรรมในช่วง 24 ชั่วโมงที่ผ่านมา</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.transaction_id} transaction={transaction} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}

const TransactionItem = ({ transaction, now }) => {
  // ใช้ student_name หรือหากไม่มี ให้แสดง User ID
  const userName = transaction.student_name || `User ID: ${transaction.user_id}`;

  // กำหนดสถานะโดยดูจากว่า return_date มีค่าหรือไม่ (ถ้ามี ให้ถือว่า Returned)
  const status = transaction.return_date ? "Returned" : "Borrowed";

  // ฟังก์ชันคำนวณเวลาที่ผ่านไปจากวันที่ที่กำหนด
  const getTimeDifference = (date) => {
    const diff = now - new Date(date).getTime();
    const diffInMinutes = Math.floor(diff / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours > 0) {
      return `${diffInHours} ชั่วโมงที่แล้ว`;
    }
    return `${diffInMinutes} นาทีที่แล้ว`;
  };

  const borrowTime = getTimeDifference(transaction.borrow_date);
  const returnTime = transaction.return_date ? getTimeDifference(transaction.return_date) : null;

  // กำหนดไอคอนและพื้นหลังตามสถานะ
  const getIconClass = () => status === "Borrowed" ? "fa-box text-blue-500" : "fa-check text-green-500";
  const getBgClass = () => status === "Borrowed" ? "bg-blue-100" : "bg-green-100";

  return (
    <div className="bg-white flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm">
      <div className={`w-10 h-10 rounded-full ${getBgClass()} flex items-center justify-center flex-shrink-0`}>
        <i className={`fas ${getIconClass()}`}></i>
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{userName}</p>
        <p className="text-xs text-gray-500 mt-1">
          ยืม: {borrowTime} {returnTime && `| คืน: ${returnTime}`}
        </p>
        {transaction.borrow_records && transaction.borrow_records.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            อุปกรณ์: {transaction.borrow_records.map(record => record.equipment_name).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
};

export default Activity;
