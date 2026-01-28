import React, { useEffect, useState } from "react";
import "daisyui/dist/full.css";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import bg2 from "../../assets/bg2.png";

function History() {
  const { user, loading } = useAuth();
  const [history, setHistory] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");
  const itemsPerPage = 10;

  // Fetch history with pagination and filter
  const fetchHistory = async (page = 1, filterValue = "all") => {
    if (!user?.user_id) return;
    setApiLoading(true);
    try {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        filter: filterValue
      });
      const response = await axios.get(
        `${apiUrl}/api/borrow/history/${user.user_id}?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHistory(response.data.history || []);
      const pagination = response.data.pagination || { totalPages: 1 };
      setTotalPages(pagination.totalPages || 1);
    } catch (err) {
      console.error("Error fetching history:", err);
      setHistory([]);
      setTotalPages(1);
    } finally {
      setApiLoading(false);
    }
  };

  // Fetch when page, filter, or user changes
  useEffect(() => {
    fetchHistory(currentPage, filter);
  }, [currentPage, filter, user]);

  // Reset to page 1 when filter changes
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  // ใช้ history โดยตรง (ไม่ต้อง filter/slice ที่ client)
  const currentItems = history;

  return (
    <div
      className="flex-1 flex flex-col py-6 px-4 relative"
      style={{
        backgroundImage: `url(${bg2})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* ชั้น overlay */}
      {/* <div className="fixed inset-0 bg-black/30r-sm "></div> */}

      {/* กล่องหลัก */}
      <div className="relative z-10 w-full max-w-6xl mx-auto bg-white/95 rounded-xl shadow-2xl p-4 sm:p-6 lg:p-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-6 sm:mb-8 text-gray-800">
          ประวัติการยืม-คืนอุปกรณ์
        </h2>

        {/* ปุ่มกรองแบบเรียบๆ */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          <button
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === "all"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => handleFilterChange("all")}
          >
            ทั้งหมด
          </button>
          <button
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === "borrowed"
                ? "bg-red-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => handleFilterChange("borrowed")}
          >
            ยังไม่คืน
          </button>
          <button
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              filter === "returned"
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
            onClick={() => handleFilterChange("returned")}
          >
            คืนแล้ว
          </button>
        </div>

        {/* โหลดข้อมูล */}
        {loading || apiLoading ? (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        ) : !user ? (
          <div className="text-center text-red-500 py-16 text-lg">
            ⚠️ กรุณาเข้าสู่ระบบเพื่อดูประวัติ
          </div>
        ) : (
          <>
            {/* แสดงแบบตารางบนหน้าจอใหญ่ */}
            <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        ชื่ออุปกรณ์
                      </th>
                      <th className="px-4 lg:px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        จำนวน
                      </th>
                      <th className="px-4 lg:px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        วันที่ยืม
                      </th>
                      <th className="px-4 lg:px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        วันที่คืน
                      </th>
                      <th className="px-4 lg:px-6 py-4 text-center text-sm font-semibold text-gray-700">
                        สถานะ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          ไม่มีประวัติการยืม
                        </td>
                      </tr>
                    ) : (
                        currentItems.map((record) => (
                        <tr
                          key={record.item_id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 lg:px-6 py-4 text-sm text-gray-800">
                            {record.equipment_name}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-center text-gray-800">
                            {record.quantity}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-center text-gray-600">
                            {record.borrow_date || "-"}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-sm text-center text-gray-600">
                            {record.returned_at || "-"}
                          </td>
                          <td className="px-4 lg:px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                record.status === "Returned"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-200 text-red-800"
                              }`}
                            >
                              {record.status === "Returned"
                                ? "คืนแล้ว"
                                : "ยังไม่คืน"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* ปุ่มเปลี่ยนหน้า */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-1 py-4 bg-gray-50 border-t border-gray-200">
                  <button
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                  >
                    ←
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        currentPage === idx + 1
                          ? "bg-blue-500 text-white"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                      onClick={() => setCurrentPage(idx + 1)}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            {/* แสดงแบบ Card บนมือถือ */}
            <div className="md:hidden space-y-4">
              {currentItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  ไม่มีประวัติการยืม
                </div>
              ) : (
                currentItems.map((record) => (
                  <div
                    key={record.item_id}
                    className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-800 flex-1">
                        {record.equipment_name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                          record.status === "Returned"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {record.status === "Returned" ? "คืนแล้ว" : "ยังไม่คืน"}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">จำนวน:</span>
                        <span className="text-gray-800 font-medium">
                          {record.quantity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">วันที่ยืม:</span>
                        <span className="text-gray-800">
                          {record.borrow_date || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">วันที่คืน:</span>
                        <span className="text-gray-800">
                          {record.returned_at || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ปุ่มเปลี่ยนหน้าสำหรับมือถือ */}
            {totalPages > 1 && (
              <div className="md:hidden flex justify-center gap-1 pt-4">
                <button
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-200 bg-white border border-gray-300"
                  }`}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  ←
                </button>
                <div className="flex items-center px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded">
                  {currentPage} / {totalPages}
                </div>
                <button
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-200 bg-white border border-gray-300"
                  }`}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default History;