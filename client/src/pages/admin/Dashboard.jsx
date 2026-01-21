import React, { useEffect, useState } from "react";
import axios from "axios";
import Activity from "../admin/Activity";
import AddTool from '../admin/addTool';
import bg2 from '../../assets/bg2.png';

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
function Dashboard() {
  const [statsData, setStatsData] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${apiUrl}/api/stats/stats/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        setStatsData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching stats:", error);
      });
  }, []);

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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">แดชบอร์ด</h1>
            </div>
           
            <AddTool />
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Equipment Card */}
            <div className="md:col-span-3 lg:col-span-1 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mt-2">
                    {statsData.total_equipment || 0}
                  </h3>
                  <p className="text-blue-500 text-sm font-medium mt-2 flex items-center gap-1">
                    <i className="fa-solid fa-box text-xs" />
                    <span>อุปกรณ์ทั้งหมด</span>
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
                  <h3 className="text-3xl font-bold text-gray-800 mt-2">
                    {statsData.total_borrowed || 0}
                  </h3>
                  <p className="text-green-500 text-sm font-medium mt-2 flex items-center gap-1">
                    <i className="fas fa-exchange-alt text-xs" />
                    <span>รายการอุปกรณ์ที่ถูกยืม</span>
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
                  <h3 className="text-3xl font-bold text-gray-800 mt-2">
                    {statsData.total_users || 0}
                  </h3>
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

          {/* Recent Activities */}
          <Activity />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
