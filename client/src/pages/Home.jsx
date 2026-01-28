import React, { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Typed from 'typed.js';
import bg from '../assets/bbb.png';
import bg2 from '../assets/bg2.png';
import axios from 'axios';
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import StatsSection from '../components/StatsSection';
import Swal from 'sweetalert2';
import ScrollToTopButton from '../components/ScrollToTopButton';
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;
function Home() {
  const { user, fetchBorrowItems } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // จำนวนต่อหน้า

  // ======= LocalStorage helper แยกตาม user_id =======
  const getBorrowItems = () => {
    const allItems = JSON.parse(localStorage.getItem('borrowItems')) || {};
    return user?.user_id ? allItems[user.user_id] || [] : [];
  };

  const setBorrowItems = (items) => {
    if (!user?.user_id) return;
    const allItems = JSON.parse(localStorage.getItem('borrowItems')) || {};
    allItems[user.user_id] = items;
    localStorage.setItem('borrowItems', JSON.stringify(allItems));
  };

  const removeBorrowItems = () => {
    if (!user?.user_id) return;
    const allItems = JSON.parse(localStorage.getItem('borrowItems')) || {};
    delete allItems[user.user_id];
    localStorage.setItem('borrowItems', JSON.stringify(allItems));
  };

  // ======= ดึงข้อมูลอุปกรณ์ =======
  // ใช้ public endpoint สำหรับ Guest, protected endpoint สำหรับ User ที่ login แล้ว
  const fetchEquipment = async () => {
    try {
      const token = localStorage.getItem('token');
      let response;
      
      if (token) {
        // ถ้า login แล้ว ใช้ protected endpoint
        response = await axios.get(`${apiUrl}/api/equipment/equipment`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const sortedEquipment = response.data.equipment || [];
        const equipmentAvailable = sortedEquipment.filter(record => record.status === 'Available');
        setEquipment(equipmentAvailable);
        sortedEquipment.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      } else {
        // ถ้ายังไม่ login ใช้ public endpoint (ได้เฉพาะ Available)
        response = await axios.get(`${apiUrl}/api/equipment/public`);
        const sortedEquipment = response.data.equipment || [];
        setEquipment(sortedEquipment);
        sortedEquipment.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      }
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [user]); // เพิ่ม user เป็น dependency เพื่อ refetch เมื่อ login/logout

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const el = useRef(null);
  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: [
        'ยินดีต้อนรับเข้าสู่',
        'ระบบการยืม-คืนอุปกรณ์ '
      ],
      typeSpeed: 50,
      loop: true,
      backSpeed: 1,
      smartBackspace: true,
      backDelay: 4000,
    });
    return () => typed.destroy();
  }, []);

  // ======= ฟังก์ชันยืนยันการยืมรายการค้าง =======
  const confirmBorrowFromStorage = async () => {
    try {
      const items = getBorrowItems();
      const pendingCount = items.reduce((sum, item) => sum + item.quantity_borrow, 0);

      if (items.length === 0) {
        return Swal.fire({
          title: "ไม่มีรายการ",
          text: "คุณยังไม่มีรายการอุปกรณ์ในรายการค้าง",
          icon: "info",
        });
      }

      if (!user?.user_id) {
        return Swal.fire({
          title: "เกิดข้อผิดพลาด!",
          text: "ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่",
          icon: "error",
        });
      }

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded",
          denyButton: "bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded",
          cancelButton: "bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded",
        },
        buttonsStyling: true,
      });

      const result = await swalWithBootstrapButtons.fire({
        title: `ยืนยันการยืมทั้งหมด (${pendingCount} ชิ้น)`,
        icon: "warning",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "ยืมทั้งหมด!",
        denyButtonText: "ลบรายการค้าง",
        cancelButtonText: "ยกเลิก",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        const payloadItems = items.map(item => ({
          equipment_id: item.equipment_id,
          quantity: item.quantity_borrow || item.quantity
        }));

        await axios.post(
          `${apiUrl}/api/borrow/add`,
          { user_id: user.user_id, items: payloadItems },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        await swalWithBootstrapButtons.fire({
          title: "สำเร็จ!",
          text: "คุณได้ยืมอุปกรณ์เรียบร้อยแล้ว",
          icon: "success",
        });
        removeBorrowItems();
        await fetchEquipment();
        await fetchBorrowItems();
      } else if (result.isDenied) {
        removeBorrowItems();
        await swalWithBootstrapButtons.fire({
          title: "ลบรายการค้างเรียบร้อยแล้ว",
          icon: "success",
        });
      }
    } catch (error) {
      console.error("Error borrowing stored equipment:", error);
    }
  };

  // ======= ฟังก์ชันยืมอุปกรณ์แต่ละชิ้น =======
  const handleClick = async (equipmentId, title, image, quantity) => {
    try {
      equipmentId = Number(equipmentId);
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded",
          denyButton: "bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded",
          cancelButton: "bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded",
          infoButton: "bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded",
        },
        buttonsStyling: true,
      });

      const pendingItems = getBorrowItems();
      const pendingCount = pendingItems.reduce((sum, item) => sum + item.quantity_borrow, 0);

      const result = await swalWithBootstrapButtons.fire({
        title: `ยืมอุปกรณ์ ${title}`,
        imageUrl: image ? `${apiUrl}/uploads/${image.replace(/\\/g, "/")}` : "default-image-url.jpg",
        imageWidth: 150,
        imageHeight: 150,
        imageAlt: `${title}`,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "ยืมอุปกรณ์!",
        denyButtonText: pendingCount > 0 ? `ที่ยืมค้างอยู่ (${pendingCount})` : "ที่ยืมค้างอยู่",
        cancelButtonText: "ยกเลิก!",
        reverseButtons: true,
        input: "number",
        inputLabel: "จำนวนที่ต้องการยืม",
        inputPlaceholder: "กรอกจำนวนอุปกรณ์",
        inputAttributes: { min: 1, max: quantity, step: 1 },
        inputValidator: (value) => {
          if (!value || value <= 0) return "กรุณากรอกจำนวนที่ถูกต้อง";
        },
      });

      if (result.isConfirmed) {
        const quantityToBorrow = parseInt(result.value, 10);
        if (!user?.user_id) {
          return swalWithBootstrapButtons.fire({
            title: "เกิดข้อผิดพลาด!",
            text: "ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่",
            icon: "error",
          });
        }

        let items = getBorrowItems();
        const existingIndex = items.findIndex((item) => Number(item.equipment_id) === equipmentId);

        if (existingIndex !== -1) {
          const newTotal = items[existingIndex].quantity_borrow + quantityToBorrow;
          if (newTotal > quantity) {
            return swalWithBootstrapButtons.fire({
              title: "จำนวนเกิน!",
              text: `คุณไม่สามารถยืมได้เกิน ${quantity} ชิ้น`,
              icon: "error",
            });
          }
          items[existingIndex].quantity_borrow = newTotal;
        } else {
          if (quantityToBorrow > quantity) {
            return swalWithBootstrapButtons.fire({
              title: "จำนวนเกิน!",
              text: `คุณไม่สามารถยืมได้เกิน ${quantity} ชิ้น`,
              icon: "error",
            });
          }
          items.push({ equipment_id: equipmentId, quantity_borrow: quantityToBorrow });
        }

        setBorrowItems(items);

        const confirmBorrow = await swalWithBootstrapButtons.fire({
          title: "ยืนยันการยืมอุปกรณ์",
          text: "คลิกที่พื้นที่ว่างเพื่อ ยืมอุปกรณ์เพิ่มเติม ",
          icon: "warning",
          showCancelButton: false,
          confirmButtonText: "ยืมทั้งหมด!",
          cancelButtonText: "ยกเลิก!",
          reverseButtons: true,
        });

        if (confirmBorrow.isConfirmed) {
          const payloadItems = items.map(item => ({
            equipment_id: item.equipment_id,
            quantity: item.quantity_borrow || item.quantity
          }));

          await axios.post(
            `${apiUrl}/api/borrow/add`,
            { user_id: user.user_id, items: payloadItems },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          await swalWithBootstrapButtons.fire({
            title: "สำเร็จ!",
            text: "คุณได้ยืมอุปกรณ์เรียบร้อยแล้ว",
            icon: "success",
          });
          removeBorrowItems();
          await fetchEquipment();
          await fetchBorrowItems();
        }
      } else if (result.isDenied) {
        await confirmBorrowFromStorage();
      }
    } catch (error) {
      console.error("Error borrowing equipment:", error);
    }
  };

  // ======= Filter และ Pagination =======
  const filteredEquipment = equipment.filter(item =>
    item.equipment_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEquipment.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage);
  const loadingData = equipment.length === 0;
  return (
    <div style={{ backgroundImage: `url(${bg2})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'}}>
      <ScrollToTopButton />

      {/* Hero Section */}
      <div
        className="relative bg-fixed min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(
            to bottom, 
            rgba(0, 0, 0, 1), 
            rgba(0, 0, 0, 0.4), 
            rgba(0, 0, 0, 0.4), 
            rgba(0, 0, 0, 0.4), 
            rgba(0, 0, 0, 0.4)
          ), url(${bg})`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-bold text-center transition-all duration-300">
            <span ref={el} />
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mt-2 sm:mt-4 text-center transition-all duration-300">
            สาขาครุศาสตร์อุตสาหกรรมคอมพิวเตอร์
          </p>
        </div>
      </div>

      {/* Search Section */}
      <section className="px-4 md:px-8 pb-8 mt-5">
        <div className="container max-w-6xl mx-auto">
          <div className="px-4 sm:px-8">
            <h1 className="pl-2 text-lg sm:text-xl border-l-4 border-blue-500 text-black">
              อุปกรณ์ที่สามารถยืมได้
            </h1>
            <div className="mt-4 sm:mt-6 flex items-center justify-center">
              <input
                type="text"
                placeholder="ค้นหาอุปกรณ์..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-1/2 px-4 py-2 border rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-center w-full">
            <hr className="w-full sm:w-3/4 h-1 my-6 sm:my-8 bg-gray-200 border-0 rounded" />
          </div>

          {/* Equipment Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {loadingData ? (
              <div className="col-span-full text-center text-gray-500">กำลังโหลดข้อมูล...</div>
            ) : currentItems.length > 0 ? (
              currentItems.map((item) => (
                <div key={item.equipment_id} className="relative bg-white border rounded-lg shadow-md transform transition duration-500 hover:scale-105">
                  <div className="aspect-w-16 aspect-h-9 p-2">
                    <img
                      className="rounded-md min-w-[100px] min-h-[100px] object-cover object-center"
                      src={item.image ? `${apiUrl}/uploads/${item.image.replace(/\\/g, "/")}` : null}
                      alt={item.equipment_id}
                      loading="lazy"
                      width="200"
                      height="200"
                    />
                  </div>
                  <div className="px-4 pb-3">
                    <h5 className="text-base sm:text-lg tracking-tight hover:text-sky-700 text-gray-900">
                      {item.equipment_name}
                    </h5>
                    <p className="text-sm text-gray-600 break-all">จำนวนคงเหลือ {item.available_quantity}</p>
                    <p className="text-xs text-gray-500 mt-2">อัพเดทเมื่อ: {new Date(item.updated_at).toLocaleString()}</p>
                    <hr className="w-full max-w-[12rem] h-1 mx-auto my-4 bg-gray-100 border-0 rounded" />
                    <div className="text-center pb-2">
                      {item.available_quantity === 0 ? (
                        <button className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-medium text-white rounded-md shadow-sm bg-red-300 cursor-not-allowed">
                          หมด
                        </button>
                      ) : user?.user_id ? (
                        <button
                          onClick={() => handleClick(item.equipment_id, item.equipment_name, item.image, item.available_quantity)}
                          className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-medium text-white rounded-md shadow-sm bg-[#1B262C] hover:bg-[#273A45] focus:ring-offset-2"
                        >
                          ยืมอุปกรณ์
                        </button>
                      ) : (
                        <Link
                          to="/RMUTI/login"
                          className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-medium text-white rounded-md shadow-sm bg-[#1B262C] hover:bg-[#273A45] focus:ring-offset-2"
                        >
                          ยืมอุปกรณ์
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500">ไม่พบข้อมูลอุปกรณ์</div>
            )}
          </div>
        </div>
      </section>

      {/* Pagination Section */}
      <div className="flex justify-center sm:justify-end px-4 sm:pr-[15%] md:pr-[20%] lg:pr-[23%] mb-5">
        <button
          disabled={currentPage === 1}
          className={`flex items-center justify-center px-3 h-8 me-3 text-sm font-medium border rounded-lg ${
            currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          ย้อนกลับ
        </button>
        <button
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center px-3 h-8 text-sm font-medium border rounded-lg ${
            currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          หน้าต่อไป
        </button>
      </div>

      <StatsSection />
    </div>
  );
}

export default Home;
