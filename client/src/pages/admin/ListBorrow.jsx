import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";

function ListBorrow() {
  const [tools, setTools] = useState([]); // รายการ flattened ของการยืมที่ยังค้างอยู่
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const groupsPerPage = 5; // จำนวนกลุ่มที่แสดงต่อหน้า
  const [openGroups, setOpenGroups] = useState([]); // รายชื่อกลุ่มที่เปิด dropdown

  // ฟังก์ชันจัดรูปแบบวันที่เป็นแบบไทย
  const formatThaiDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // ดึงข้อมูลบันทึกการยืมทั้งหมดจาก API และกรองเฉพาะรายการที่ยังค้างอยู่ (status = "Borrowed")
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/borrowRecords/all");
        if (
          response.data &&
          Array.isArray(response.data.borrow_transactions)
        ) {
          // กรองเฉพาะ transaction ที่มีอย่างน้อยหนึ่งรายการที่มีสถานะ "Borrowed"
          const filteredTransactions = response.data.borrow_transactions.filter(
            (transaction) =>
              transaction.borrow_records.some(
                (record) => record.status.toLowerCase() === "borrowed"
              )
          );

          // Flatten รายการในแต่ละ transaction เฉพาะรายการที่ยังค้างอยู่
          const flattenedRecords = [];
          filteredTransactions.forEach((transaction) => {
            transaction.borrow_records.forEach((record, index) => {
              if (record.status.toLowerCase() === "borrowed") {
                flattenedRecords.push({
                  groupId: transaction.transaction_id, // ใช้ transaction_id เป็น groupId
                  record_id: `${transaction.transaction_id}-${index}`, // สร้าง id สำหรับรายการย่อย
                  student_name: transaction.student_name,
                  equipment_name: record.equipment_name,
                  quantity_borrow: record.quantity_borrow,
                  status: record.status,
                  borrow_date: transaction.borrow_date,
                });
              }
            });
          });

          setTools(flattenedRecords);
        } else {
          toast.error("ข้อมูลที่ได้รับไม่ถูกต้อง");
        }
      } catch (error) {
        console.error("Error fetching borrow records:", error);
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  // จัดกลุ่มข้อมูลตาม transaction_id
  const groupedRecords = useMemo(() => {
    return tools.reduce((acc, record) => {
      if (!acc[record.groupId]) {
        acc[record.groupId] = [];
      }
      acc[record.groupId].push(record);
      return acc;
    }, {});
  }, [tools]);

  // เรียงลำดับกลุ่มตามวันที่ยืม (borrow_date) จากล่าสุดไปเก่า
  const groupKeys = useMemo(() => {
    return Object.keys(groupedRecords).sort(
      (a, b) =>
        new Date(groupedRecords[b][0].borrow_date) -
        new Date(groupedRecords[a][0].borrow_date)
    );
  }, [groupedRecords]);

  // Pagination สำหรับกลุ่ม
  const totalPages = Math.ceil(groupKeys.length / groupsPerPage);
  const currentGroupKeys = groupKeys.slice(
    (currentPage - 1) * groupsPerPage,
    currentPage * groupsPerPage
  );

  // ฟังก์ชันเปิด/ปิด dropdown สำหรับกลุ่ม
  const toggleGroup = (groupId) => {
    setOpenGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  return (
    <div className="min-h-screen container mx-auto py-8">
      <div className="lg:pl-72">
        <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">📦 รายชื่อคนยืมอุปกรณ์</h1>
              <p className="text-sm text-gray-500 mt-1">
                หมายเหตุ: รายชื่อคนที่ยังค้างอยู่
              </p>
            </div>
           
          </div>
        {loading ? (
          <p className="text-center text-lg text-gray-600">กำลังโหลดข้อมูล...</p>
        ) : (
          <div className="overflow-auto shadow-lg rounded-lg bg-white p-4">
            <table className="table w-full">
              <thead>
                <tr className="text-sm font-semibold text-gray-700 text-center">
                  <th>ชื่อผู้ยืม</th>
                  <th>ชื่ออุปกรณ์</th>
                  <th>จำนวนที่ยืม</th>
                  <th>สถานะ</th>
                  <th>วันที่ยืม</th>
                </tr>
              </thead>
              <tbody>
                {currentGroupKeys.length ? (
                  currentGroupKeys.map((groupId) => {
                    const groupItems = groupedRecords[groupId];
                    // หากกลุ่มมีรายการเดียว แสดงแถวเดียว
                    if (groupItems.length === 1) {
                      const item = groupItems[0];
                      return (
                        <tr key={item.record_id}>
                          <td className="py-4 px-2 text-center">
                            {item.student_name}
                          </td>
                          <td className="py-4 px-2 text-center">
                            {item.equipment_name}
                          </td>
                          <td className="py-4 px-2 text-center">
                            {item.quantity_borrow}
                          </td>
                          <td className="py-4 px-2 text-center">
                            {item.status}
                          </td>
                          <td className="py-4 px-2 text-center">
                            {formatThaiDate(item.borrow_date)}
                          </td>
                        </tr>
                      );
                    } else {
                      // หากมีมากกว่าหนึ่งรายการในกลุ่ม ให้แสดงแถวแรกพร้อมปุ่มเปิด/ปิดรายการที่ซ่อนอยู่
                      const firstItem = groupItems[0];
                      const hiddenItems = groupItems.slice(1);
                      return (
                        <React.Fragment key={groupId}>
                          <tr
                            onClick={() => toggleGroup(groupId)}
                            className="cursor-pointer bg-gray-100"
                          >
                            <td className="py-4 px-2 text-center">
                              {firstItem.student_name}
                              <span className="ml-2">
                                {openGroups.includes(groupId) ? "▾" : "▸"}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-center">
                              {firstItem.equipment_name}
                            </td>
                            <td className="py-4 px-2 text-center">
                              {firstItem.quantity_borrow}
                            </td>
                            <td className="py-4 px-2 text-center">
                              {firstItem.status}
                            </td>
                            <td className="py-4 px-2 text-center">
                              {formatThaiDate(firstItem.borrow_date)}
                            </td>
                          </tr>
                          {openGroups.includes(groupId) &&
                            hiddenItems.map((item) => (
                              <tr key={item.record_id}>
                                <td className="py-4 px-2 text-center">
                                  {item.student_name}
                                </td>
                                <td className="py-4 px-2 text-center">
                                  {item.equipment_name}
                                </td>
                                <td className="py-4 px-2 text-center">
                                  {item.quantity_borrow}
                                </td>
                                <td className="py-4 px-2 text-center">
                                  {item.status}
                                </td>
                                <td className="py-4 px-2 text-center">
                                  {formatThaiDate(item.borrow_date)}
                                </td>
                              </tr>
                            ))}
                        </React.Fragment>
                      );
                    }
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-lg text-gray-500">
                      ไม่มีข้อมูลอุปกรณ์ที่ยังค้างอยู่
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="btn btn-sm btn-outline px-4 mx-1"
          >
            «
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`btn btn-sm ${
                currentPage === i + 1 ? "btn-primary" : "btn-outline"
              } px-4 mx-1`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="btn btn-sm btn-outline px-4 mx-1"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}

export default ListBorrow;
