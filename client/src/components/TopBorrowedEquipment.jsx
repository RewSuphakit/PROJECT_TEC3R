import React, { useEffect, useState } from 'react';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

const TopBorrowedEquipment = () => {
  const [topEquipment, setTopEquipment] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopBorrowed = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/stats/top-borrowed`);
        setTopEquipment(response.data);
      } catch (error) {
        console.error('Error fetching top borrowed equipment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopBorrowed();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-3 rounded-xl shadow-lg shadow-amber-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">อุปกรณ์ยอดนิยม</h2>
          <p className="text-gray-500 text-sm">Top 5 อุปกรณ์ที่ถูกยืมมากที่สุด</p>
        </div>
      </div>

      {topEquipment.length === 0 ? (
        <p className="text-gray-500 text-center py-8">ยังไม่มีข้อมูลการยืม</p>
      ) : (
        <div className="space-y-3">
          {topEquipment.map((item, index) => (
            <div
              key={item.equipment_id}
              className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200 border border-gray-100"
            >
              {/* Rank Badge */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-700' :
                'bg-gradient-to-br from-blue-400 to-blue-500'
              }`}>
                {index + 1}
              </div>

              {/* Equipment Image */}
              <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                {item.image ? (
                  <img
                    src={`${apiUrl}/uploads/${item.image}`}
                    alt={item.equipment_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/48?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fas fa-box text-gray-400"></i>
                  </div>
                )}
              </div>

              {/* Equipment Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {item.equipment_name}
                </p>
              </div>

              {/* Borrow Count */}
              <div className="flex-shrink-0 text-right">
                <p className="text-lg font-bold text-blue-600">{item.total_borrowed}</p>
                <p className="text-xs text-gray-500">ครั้ง</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopBorrowedEquipment;
