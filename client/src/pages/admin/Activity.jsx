import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function BorrowRecords() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/borrowRecords/all');
        // สมมุติว่า API ส่งข้อมูลในรูปแบบ { borrow_records: [...] }
        setRecords(response.data.borrow_records || []);
      } catch (error) {
        console.error("Error fetching borrow records:", error.message);
      }
    };

    fetchRecords();
  }, []);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6 w-4/5 mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">กิจกรรมล่าสุด</h2>

          </div>
          <div className="space-y-4">
            {records.map(record => (
              <BorrowRecordItem key={record.record_id} record={record} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const BorrowRecordItem = ({ record }) => {
  // ใช้ student_name หากมี ถ้าไม่มีให้แสดง user_id
  const userName = record.student_name || `User ID: ${record.user_id}`;

  // ฟังก์ชันคำนวณความต่างของเวลาเป็นนาที โดยรีเซ็ตทุก 1 วัน (1440 นาที)
  const getTimeDifferenceInMinutes = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diff / 60000);
    const minutes = diffInMinutes % 1440; // รีเซ็ตทุก 1 วัน
    return `${minutes} นาทีที่แล้ว`;
  };

  const borrowTime = getTimeDifferenceInMinutes(record.borrow_date);
  const returnTime = record.return_date ? getTimeDifferenceInMinutes(record.return_date) : null;

  // กำหนดไอคอนและพื้นหลังตามสถานะ
  const getIconClass = () => {
    return record.status === "Borrowed" ? "fa-box text-blue-500" : "fa-check text-green-500";
  };

  const getBgClass = () => {
    return record.status === "Borrowed" ? "bg-blue-100" : "bg-green-100";
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
      <div className={`w-10 h-10 rounded-full ${getBgClass()} flex items-center justify-center flex-shrink-0`}>
        <i className={`fas ${getIconClass()}`}></i>
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-800">
          <span className="font-medium">{userName}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          ยืม: {borrowTime} {returnTime && `| คืน: ${returnTime}`}
        </p>
      </div>
    </div>
  );
};

export default BorrowRecords;
