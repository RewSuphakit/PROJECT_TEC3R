import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Typed from 'typed.js';
import bg from '../assets/bg.png';
import axios from 'axios';
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import StatsSection from '../components/StatsSection';
import { CountUp } from "countup.js";
import Swal from 'sweetalert2';
import ScrollToTopButton from '../components/ScrollToTopButton';
function Home() {
  const { user,loading,fetchBorrowRecords} = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page
 


// ฟังก์ชันสำหรับกดยืมอุปกรณ์แต่ละชิ้น
const handleClick = async (equipmentId, title, image, quantity) => {
  try {
    // แปลง equipmentId เป็น Number ให้แน่ใจว่าประเภทตรงกัน
    equipmentId = Number(equipmentId);

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded", // ยืมอุปกรณ์!
        denyButton:
          "bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded", // ที่ยืมค้างอยู่
        cancelButton:
          "bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded",  // ยกเลิก!
      },
      buttonsStyling: true,
    });

    // ดึงรายการค้างอยู่จาก Local Storage และคำนวณจำนวนทั้งหมด
    const pendingItems = JSON.parse(localStorage.getItem("borrowItems")) || [];
    const pendingCount = pendingItems.reduce(
      (sum, item) => sum + item.quantity_borrow,
      0
    );

    // popup หลักที่มี 3 ปุ่ม: ยืมอุปกรณ์!, ที่ยืมค้างอยู่ (พร้อมแสดงจำนวน), ยกเลิก!
    const result = await swalWithBootstrapButtons.fire({
      title: `ยืมอุปกรณ์ ${title}`,
      text: "คุณต้องการยืมอุปกรณ์นี้หรือดำเนินการกับรายการค้างอยู่?",
      imageUrl: image
        ? `http://localhost:5000/uploads/${image.replace(/\\/g, "/")}`
        : "default-image-url.jpg",
      imageWidth: 150,
      imageHeight: 150,
      imageAlt: `${title}`,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "ยืมอุปกรณ์!",
      denyButtonText:
        pendingCount > 0 ? `ที่ยืมค้างอยู่ (${pendingCount})` : "ที่ยืมค้างอยู่",
      cancelButtonText: "ยกเลิก!",
      reverseButtons: true,
      input: "number",
      inputLabel: "จำนวนที่ต้องการยืม",
      inputPlaceholder: "กรอกจำนวนอุปกรณ์",
      inputAttributes: {
        min: 1,
        max: quantity,
        step: 1,
      },
      inputValidator: (value) => {
        if (!value || value <= 0) {
          return "กรุณากรอกจำนวนที่ถูกต้อง";
        }
      },
    });

    if (result.isConfirmed) {
      // กรณีเลือก "ยืมอุปกรณ์!" (เพิ่มรายการใหม่)
      const quantityToBorrow = parseInt(result.value, 10);
      let token = localStorage.getItem("token");

      if (!user || !user.user_id) {
        return await swalWithBootstrapButtons.fire({
          title: "เกิดข้อผิดพลาด!",
          text: "ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่",
          icon: "error",
        });
      }

      // ดึงรายการที่มีอยู่จาก Local Storage
      let items = JSON.parse(localStorage.getItem("borrowItems")) || [];

      // ตรวจสอบว่ามีรายการอุปกรณ์นี้อยู่แล้วหรือไม่
      const existingItemIndex = items.findIndex(
        (item) => Number(item.equipment_id) === equipmentId
      );

      if (existingItemIndex !== -1) {
        const currentQuantity = items[existingItemIndex].quantity_borrow;
        const newTotal = currentQuantity + quantityToBorrow;
        if (newTotal > quantity) {
          await swalWithBootstrapButtons.fire({
            title: "จำนวนเกิน!",
            text: `คุณไม่สามารถยืมได้เกิน ${quantity} ชิ้น`,
            icon: "error",
          });
          return;
        }
        items[existingItemIndex].quantity_borrow = newTotal;
      } else {
        if (quantityToBorrow > quantity) {
          await swalWithBootstrapButtons.fire({
            title: "จำนวนเกิน!",
            text: `คุณไม่สามารถยืมได้เกิน ${quantity} ชิ้น`,
            icon: "error",
          });
          return;
        }
        items.push({ equipment_id: equipmentId, quantity_borrow: quantityToBorrow });
      }

      // บันทึกรายการลง Local Storage
      localStorage.setItem("borrowItems", JSON.stringify(items));

      // หลังจากเพิ่มรายการใหม่แล้วให้แสดง popup เพื่อยืนยันการยืมรายการทั้งหมดใน Local Storage
      const confirmBorrow = await swalWithBootstrapButtons.fire({
        title: "ยืนยันการยืมทั้งหมด?",
        text: "คุณต้องการยืมอุปกรณ์ทั้งหมดในรายการค้างอยู่หรือไม่?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ยืมทั้งหมด!",
        cancelButtonText: "เพิ่มต่อ",
        reverseButtons: true,
      });

      if (confirmBorrow.isConfirmed) {
        await axios.post(
          `http://localhost:5000/api/borrowRecords/add`,
          { user_id: user.user_id, items },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        await swalWithBootstrapButtons.fire({
          title: "สำเร็จ!",
          text: "คุณได้ยืมอุปกรณ์เรียบร้อยแล้ว",
          icon: "success",
        });
        localStorage.removeItem("borrowItems");
        await fetchEquipment();
        await fetchBorrowRecords();
      }
      // หากเลือก "เพิ่มต่อ" ก็จะเก็บรายการไว้ใน Local Storage (ไม่ดำเนินการยืมทันที)
    } else if (result.isDenied) {
      // กรณีเลือก "ที่ยืมค้างอยู่" ให้เรียกฟังก์ชันดำเนินการยืมรายการค้างอยู่
      await confirmBorrowFromStorage();
    }
    // หากเลือก "ยกเลิก!" (dismiss) ไม่ดำเนินการใด ๆ
  } catch (error) {
    console.error("Error borrowing equipment:", error);
  }
};

// ฟังก์ชันสำหรับดำเนินการยืมรายการค้างอยู่ใน Local Storage
const confirmBorrowFromStorage = async () => {
  try {
    const items = JSON.parse(localStorage.getItem("borrowItems")) || [];
    const pendingCount = items.reduce(
      (sum, item) => sum + item.quantity_borrow,
      0
    );

    if (items.length === 0) {
      return Swal.fire({
        title: "ไม่มีรายการ",
        text: "คุณยังไม่มีรายการอุปกรณ์ในรายการค้าง",
        icon: "info",
      });
    }

    let token = localStorage.getItem("token");
    if (!user || !user.user_id) {
      return Swal.fire({
        title: "เกิดข้อผิดพลาด!",
        text: "ไม่พบข้อมูลผู้ใช้ กรุณาล็อกอินใหม่",
        icon: "error",
      });
    }

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded", // ยืมทั้งหมด!
        denyButton:
          "bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded",  // ลบรายการค้าง
        cancelButton:
          "bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded",    // ยกเลิก
      },
      buttonsStyling: true,
    });

    const result = await swalWithBootstrapButtons.fire({
      title: `ยืนยันการยืมทั้งหมด (${pendingCount} ชิ้น)`,
      text: "คุณต้องการยืมอุปกรณ์ทั้งหมดในรายการค้างหรือไม่?",
      icon: "warning",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "ยืมทั้งหมด!",
      denyButtonText: "ลบรายการค้าง",
      cancelButtonText: "ยกเลิก",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      await axios.post(
        `http://localhost:5000/api/borrowRecords/add`,
        { user_id: user.user_id, items },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await swalWithBootstrapButtons.fire({
        title: "สำเร็จ!",
        text: "คุณได้ยืมอุปกรณ์เรียบร้อยแล้ว",
        icon: "success",
      });
      localStorage.removeItem("borrowItems");
      await fetchEquipment();
      await fetchBorrowRecords();
    } else if (result.isDenied) {
      // กรณีเลือก "ลบรายการค้าง"
      localStorage.removeItem("borrowItems");
      await swalWithBootstrapButtons.fire({
        title: "ลบรายการค้างเรียบร้อยแล้ว",
        text: "รายการอุปกรณ์ที่ยืมค้างถูกลบแล้ว",
        icon: "success",
      });
    }
    // หากเลือก "ยกเลิก" จะไม่ดำเนินการใดๆ
  } catch (error) {
    console.error("Error borrowing stored equipment:", error);
  }
};



  useEffect(() => {
    AOS.init({
      duration: 1000,
    });
  });

  const el = React.useRef(null);

  React.useEffect(() => {
    const typed = new Typed(el.current, {
      strings: ['ยินดีต้อนรับเข้าสู่', 'ระบบการยืม-คืนอุปกรณ์ ชุดฝึกการเรียนการสอน'],
      typeSpeed: 50,
      loop: true,
      backSpeed: 1,
      smartBackspace: true,
      backDelay: 4000,
    });

    return () => {
      typed.destroy();
    };
  }, []);
  
  const fetchEquipment = async () => {
    
    try {
      const response = await axios.get('http://localhost:5000/api/equipment/equipment'); // Replace fetch with axios
      const sortedEquipment = response.data.equipment || [];
   // กรองข้อมูลเฉพาะที่สถานะเป็น Borrowed
   const EquipmentAvailable = sortedEquipment.filter(record => record.status === 'Available');
      setEquipment(EquipmentAvailable); 
      sortedEquipment.sort((a, b) => new Date(b.timeupdate) - new Date(a.timeupdate));
    
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };
  

  useEffect(() => {
    fetchEquipment();
  }, []);
 
  
  const filteredEquipment = equipment.filter((item) =>
    item.equipment_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEquipment.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEquipment.length / itemsPerPage);

  return (
    <div  style={{
    backgroundImage: "linear-gradient(to top, #f3e7e9 0%, #e3eeff 100%)"
  }}>
            <ScrollToTopButton />
    <div
  className="relative bg-fixed min-h-[800px]"
  style={{
    backgroundImage: `linear-gradient(
      to bottom, 
      rgba(0, 0, 0, 1), 
      rgba(0, 0, 0, 0.4), 
      rgba(0, 0, 0, 0.4), 
      rgba(0, 0, 0, 0.4), 
      rgba(0, 0, 0, 0.4)
    ), url(https://media.discordapp.net/attachments/745663262699421737/1415188943766552596/IMG_20250909_122818.jpg?ex=68c24ce9&is=68c0fb69&hm=92e57482be2b3054d91742d8795cc7b76d9829590cba76b807e69430cc9fcedc&=&format=webp&width=1145&height=859)`,
    backgroundSize: 'cover',       // ขยายเต็มพื้นที่
    backgroundRepeat: 'no-repeat', // ไม่ซ้ำ
    backgroundPosition: 'center',  // จัดกึ่งกลาง
    backgroundAttachment: 'fixed',  // คงที่เมื่อ scroll
  }}
>
      <div className="absolute inset-0 bg-black bg-opacity-30" />
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white font-bold text-center transition-all duration-300">
          <span ref={el} />
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white mt-2 sm:mt-4 text-center transition-all duration-300">
          ในสาขาครุศาสตร์อุตสาหกรรมคอมพิวเตอร์
        </p>
      </div>
    </div>
  
    {/* Search Section */}
    <section
  className="px-4 md:px-8 pb-8 mt-5"
>
      <div className="container max-w-6xl mx-auto">
        <div className="px-4 sm:px-8">
          <h1 className="pl-2 text-lg sm:text-xl border-l-4 border-teal-400 text-black">อุปกรณ์ที่มียืมทั้งหมด</h1>
          <div className="mt-4 sm:mt-6 flex items-center justify-center">
            {/* Search Input */}
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
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <div key={item.equipment_id} className="relative bg-white border rounded-lg shadow-md transform transition duration-500 hover:scale-105">
                <div className="aspect-w-16 aspect-h-9 p-2">
                  <img
                    className="rounded-md min-w-[100px] min-h-[100px] object-cover object-center"
                    src={item.image ? `http://localhost:5000/uploads/${item.image.replace(/\\/g, "/")}` : null}
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
                  <p className="text-sm text-gray-600 break-all">จำนวนคงเหลือ {item.quantity}</p>
                  <p className="text-xs text-gray-500 mt-2">อัพเดทเมื่อ: {new Date(item.timeupdate).toLocaleString()}</p>
                  <hr className="w-full max-w-[12rem] h-1 mx-auto my-4 bg-gray-100 border-0 rounded" />
                  
                  <div className="text-center">
                 


{item.quantity === 0 ? (
  <button className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-medium text-white rounded-md shadow-sm bg-red-300 cursor-not-allowed">
    หมด
  </button>
) : (
  <>
  {user?.user_id ? (
    <button
    onClick={() => handleClick(item.equipment_id, item.equipment_name, item.image,item.quantity)}
    className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-medium text-white rounded-md shadow-sm bg-[#1B262C] hover:bg-slate-300 focus:ring-offset-2"
  >
    ยืมอุปกรณ์
  </button>
  ):(
    <Link to="/RMUTI/login" className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-medium text-white rounded-md shadow-sm bg-[#1B262C] hover:bg-slate-300 focus:ring-offset-2">
    ยืมอุปกรณ์
  </Link>
  )}
  
  </>
)}



       
                 
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">ไม่พบข้อมูลอุปกรณ์ที่ตรงกับการค้นหา</div>
          )}
        </div>
      </div>
    </section>
  
    {/* Pagination Section */}
    <div className="flex justify-center sm:justify-end px-4 sm:pr-[15%] md:pr-[20%] lg:pr-[23%] mb-5">
      <button
        className="flex items-center justify-center px-3 h-8 me-3 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
        onClick={() => setCurrentPage(currentPage > 1 ? currentPage - 1 : currentPage)}
      >
        <svg className="w-3.5 h-3.5 me-2 rtl:rotate-180" fill="none" viewBox="0 0 14 10">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5H1m0 0 4 4M1 5l4-4" />
        </svg>
        ย้อนกลับ
      </button>
      <button
        className="flex items-center justify-center px-3 h-8 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
        onClick={() => setCurrentPage(currentPage < totalPages ? currentPage + 1 : currentPage)}
      >
        หน้าต่อไป
        <svg className="w-3.5 h-3.5 ms-2 rtl:rotate-180" fill="none" viewBox="0 0 14 10">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 5h12m0 0L9 1m4 4L9 9" />
        </svg>
      </button>
    </div>
   

  
    <StatsSection />;





    
  </div>
  







  );
}

export default Home;
