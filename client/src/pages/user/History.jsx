

import React, { useEffect, useState } from 'react';
import 'daisyui/dist/full.css';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';

function History() {
  const { user, loading } = useAuth();
  const [history, setHistory] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.user_id) return;
      setApiLoading(true);
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
        const response = await axios.get(`${apiUrl}/api/borrowRecords/history/${user.user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(response.data.history || []);
      } catch (err) {
        setHistory([]);
      } finally {
        setApiLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  // Filtered history
  const filteredHistory = filter === 'all'
    ? history
    : history.filter((record) =>
        filter === 'borrowed' ? record.status !== 'Returned' : record.status === 'Returned'
      );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">ประวัติการยืม-คืนอุปกรณ์</h2>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('all')}
        >ทั้งหมด</button>
        <button
          className={`btn btn-sm ${filter === 'borrowed' ? 'btn-warning' : 'btn-outline'}`}
          onClick={() => setFilter('borrowed')}
        >ยังไม่คืน</button>
        <button
          className={`btn btn-sm ${filter === 'returned' ? 'btn-success' : 'btn-outline'}`}
          onClick={() => setFilter('returned')}
        >คืนแล้ว</button>
      </div>

      {loading || apiLoading ? (
        <div className="text-center">กำลังโหลดข้อมูล...</div>
      ) : !user ? (
        <div className="text-center text-red-500">กรุณาเข้าสู่ระบบเพื่อดูประวัติ</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full rounded-lg">
            <thead>
              <tr>
                <th>ชื่ออุปกรณ์</th>
                <th className='text-center'>จำนวน</th>
                <th className='text-center'>วันที่ยืม</th>
                <th className='text-center'>วันที่คืน</th>
                <th className='text-center'>สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">ไม่มีประวัติการยืม</td>
                </tr>
              ) : (
                currentItems.map((record) => (
                  <tr key={record.record_id} className="hover">
                    <td>{record.equipment_name}</td>
                    <td className="text-center">{record.quantity_borrow}</td>
                    <td className="text-center">{record.borrow_date || '-'}</td>
                    <td className="text-center">{record.return_date || '-'}</td>
                    <td className="text-center">
                      <span className={`badge px-2 py-1 text-xs ${record.status === 'Returned' ? 'badge-success' : 'badge-warning'}`}>
                        {record.status === 'Returned' ? 'คืนแล้ว' : 'ยังไม่คืน'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >«</button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    className={`join-item btn btn-sm ${currentPage === idx + 1 ? 'btn-active' : ''}`}
                    onClick={() => setCurrentPage(idx + 1)}
                  >{idx + 1}</button>
                ))}
                <button
                  className="join-item btn btn-sm"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >»</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default History;
