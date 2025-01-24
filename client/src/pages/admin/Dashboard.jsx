import React from 'react';
import { Link } from 'react-router-dom';


function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 font-[Kanit]">
   
      <div className="lg:pl-72">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ด</h1>
              <p className="text-sm text-gray-500 mt-1">ภาพรวมของระบบและสถิติที่สำคัญ</p>
            </div>
            <button 
              className="inline-flex items-center gap-2 text-white px-6 py-2.5 rounded-xl transition duration-200 shadow-sm hover:shadow group"
              style={{backgroundColor: '#0F4C75'}}
            >
              <i className="fas fa-plus transition-transform group-hover:rotate-90" />
              <span>เพิ่มอุปกรณ์ใหม่</span>
            </button>
          </div>


{/* // เป็น */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  {/* Equipment Card - ขยายให้กว้าง 2 คอลัมน์ */}
  <div className="md:col-span-3 lg:col-span-1 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">อุปกรณ์ทั้งหมด</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-2">152</h3>
        <p className="text-blue-500 text-sm font-medium mt-2 flex items-center gap-1">
          <i className="fa-solid fa-box text-xs" />
          <span>อุปกรณ์ทั้งหมดที่มีให้ยืม</span>
        </p>
      </div>
      <div className="bg-blue-50 p-4 rounded-xl">
        <i className="fas fa-boxes text-2xl text-blue-500" />
      </div>
    </div>
  </div>

  {/* Borrowed Card */}
  <div className="md:col-span-3 lg:col-span-1 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">กำลังถูกยืม</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-2">28</h3>
        <p className="text-green-500 text-sm font-medium mt-2 flex items-center gap-1">
          <i className="fas fa-exchange-alt text-xs" />
          <span>อุปกรณ์ที่กำลังถูกยืมทั้งหมด</span>
        </p>
      </div>
      <div className="bg-green-50 p-4 rounded-xl">
        <i className="fas fa-exchange-alt text-2xl text-green-500" />
      </div>
    </div>
  </div>

  {/* Users Card */}
  <div className="md:col-span-3 lg:col-span-1 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">ผู้ใช้งานทั้งหมด</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-2">842</h3>
        <p className="text-blue-800 text-sm font-medium mt-2 flex items-center gap-1">
          <i className="fas fa-users text-xs" />
          <span>ผู้ใช้งานในเว็บไซต์ทั้งหมด</span>
        </p>
      </div>
      <div className="bg-purple-50 p-4 rounded-xl">
        <i className="fas fa-users text-2xl text-blue-800" />
      </div>
    </div>
  </div>
</div>
          </div>

{/* Recent Activities */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
  <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6 w-4/5 mx-auto"> {/* ทำให้กว้าง 80% และจัดให้อยู่กลาง */}
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-lg font-semibold text-gray-800">กิจกรรมล่าสุด</h2>
      <Link to="/activities" className="text-sm text-blue-600 hover:text-blue-700">
        ดูทั้งหมด
      </Link>
    </div>
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <ActivityItem key={index} {...activity} />
      ))}
    </div>
  </div>
</div>
</div>
</div>


  );
}

// ActivityItem Component
const ActivityItem = ({ type, user, action, time, status, statusColor }) => {
  const getIconClass = () => {
    switch (type) {
      case 'borrow':
        return 'fa-box text-blue-500';
      case 'return':
        return 'fa-check text-green-500';
      case 'new-user':
        return 'fa-user text-purple-500';
      default:
        return 'fa-box text-blue-500';
    }
  };

  const getBgClass = () => {
    switch (type) {
      case 'borrow':
        return 'bg-blue-100';
      case 'return':
        return 'bg-green-100';
      case 'new-user':
        return 'bg-purple-100';
      default:
        return 'bg-blue-100';
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200">
      <div className={`w-10 h-10 rounded-full ${getBgClass()} flex items-center justify-center flex-shrink-0`}>
        <i className={`fas ${getIconClass()}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-800">
          <span className="font-medium">{user}</span> {action}
        </p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
      <span className={`px-3 py-1 text-xs font-medium text-${statusColor}-700 bg-${statusColor}-100 rounded-full`}>
        {status}
      </span>
    </div>
  );
};

// Sample activities data
const activities = [
  {
    type: 'borrow',
    user: 'jirasak1',
    action: 'ยืมชุดฝึกการเรียนการสอน1',
    time: '2 นาทีที่แล้ว',
    status: 'ยืมอุปกรณ์',
    statusColor: 'yellow'
  },
  {
    type: 'return',
    user: 'jirasak1',
    action: 'ยืมชุดฝึกการเรียนการสอน1',
    time: '15 นาทีที่แล้ว',
    status: 'คืนแล้ว',
    statusColor: 'green'
  },
  {
    type: 'new-user',
    user: 'jirasak1',
    action: 'สมัครสมาชิกใหม่',
    time: '1 ชั่วโมงที่แล้ว',
    status: 'สมาชิกใหม่',
    statusColor: 'blue'
  }
];

export default Dashboard;