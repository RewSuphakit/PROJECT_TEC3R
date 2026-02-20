import React, { useEffect, useState } from "react";
import axios from "axios";
import Activity from "../admin/Activity";
import AddTool from '../admin/addTool';
import TopBorrowedEquipment from '../../components/TopBorrowedEquipment';
import bg2 from '../../assets/bg2.webp';
import { Link } from "react-router-dom";
import { FaBox, FaBoxes, FaExchangeAlt, FaUsers } from 'react-icons/fa';
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

import './AdminStyles.css';


function Dashboard() {
  const [statsData, setStatsData] = useState({});

  const fetchStats = () => {
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
  };

  useEffect(() => {
    fetchStats();
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
          
          {/* Header Section */}
          <div className="filter-card rounded-2xl p-6 mb-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg shadow-blue-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    แดชบอร์ด
                  </h1>
                  <p className="text-gray-500 text-sm mt-1">ภาพรวมระบบและสถิติการใช้งาน</p>
                </div>
              </div>
              <AddTool onAddSuccess={fetchStats} />
            </div>
          </div>

          {/* Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link to="/RMUTI/ManageTools">
            {/* Equipment Card */}
            <div className="md:col-span-3 lg:col-span-1 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mt-2">
                    {statsData.total_equipment || 0}
                  </h3>
                  <p className="text-gray-500 text-sm font-medium mt-2 flex items-center gap-1">
                    <FaBox className="text-xs" />
                    <span>อุปกรณ์ทั้งหมด</span>
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <FaBoxes className="text-2xl text-blue-600" />
                </div>
              </div>
            </div>
            </Link>
            {/* Borrowed Card */}
            <div className="md:col-span-3 lg:col-span-1 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
              <Link to="/RMUTI/ListBorrow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mt-2">
                    {statsData.total_borrow_items || 0}
                  </h3>
                  <p className="text-gray-500 text-sm font-medium mt-2 flex items-center gap-1">
                    <FaExchangeAlt className="text-xs" />
                    <span>จำนวนการยืมทั้งหมด</span>
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl">
                  <FaExchangeAlt className="text-2xl text-orange-500" />
                </div>
                
              </div>
              </Link>
            </div>

            {/* Users Card */}
            <div className="md:col-span-3 lg:col-span-1 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
              <Link to="/RMUTI/ManageUsers">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800 mt-2">
                    {statsData.total_users || 0}
                  </h3>
                  <p className="text-gray-500 text-sm font-medium mt-2 flex items-center gap-1">
                    <FaUsers className="text-xs" />
                    <span>ผู้ใช้งานในเว็บไซต์ทั้งหมด</span>
                  </p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-xl">
                  <FaUsers className="text-2xl text-cyan-600" />
                </div>
              </div>
              </Link>
            </div>
          </div>

          {/* Recent Activities */}
          <Activity />

          {/* Top Borrowed Equipment */}
          <TopBorrowedEquipment />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
