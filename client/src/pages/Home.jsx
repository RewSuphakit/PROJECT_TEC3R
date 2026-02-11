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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [equipment, setEquipment] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const itemsPerPage = 10; // จำนวนต่อหน้า

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

  // ลบอุปกรณ์ทีละชิ้นจาก localStorage
  const removeOneBorrowItem = (equipmentId) => {
    if (!user?.user_id) return;
    const items = getBorrowItems();
    const filteredItems = items.filter(item => Number(item.equipment_id) !== Number(equipmentId));
    setBorrowItems(filteredItems);
  };

  // อัพเดทจำนวนอุปกรณ์ใน localStorage
  const updateBorrowItemQuantity = (equipmentId, newQuantity) => {
    if (!user?.user_id) return;
    const items = getBorrowItems();
    const itemIndex = items.findIndex(item => Number(item.equipment_id) === Number(equipmentId));
    
    if (itemIndex !== -1) {
      if (newQuantity <= 0) {
        // ถ้าจำนวนเป็น 0 หรือน้อยกว่า ให้ลบรายการออก
        items.splice(itemIndex, 1);
      } else {
        items[itemIndex].quantity_borrow = newQuantity;
      }
      setBorrowItems(items);
    }
  };

  // ======= ดึงข้อมูลอุปกรณ์ (Server-side Pagination) =======
  const fetchEquipment = async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      let response;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        ...(search && { search })
      });

      // ใช้ user object แทนการตรวจสอบ token เพื่อป้องกันปัญหา token หมดอายุ
      if (user?.user_id) {
        const token = localStorage.getItem('token');
        // ถ้า login แล้ว ใช้ protected endpoint และส่ง status=Available เพื่อกรองที่ server
        params.append('status', 'Available');
        response = await axios.get(`${apiUrl}/api/equipment/equipment?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // ถ้ายังไม่ login ใช้ public endpoint
        response = await axios.get(`${apiUrl}/api/equipment/public?${params}`);
      }

      const equipmentData = response.data.equipment || [];
      const pagination = response.data.pagination || { totalPages: 1, currentPage: 1 };

      // ไม่ต้องกรองที่ client อีกแล้ว เพราะ server กรองให้แล้ว
      setEquipment(equipmentData);
      setTotalPages(pagination.totalPages || 1);
    } catch (error) {
      console.error('Error fetching equipment:', error);

      // ถ้าได้ 401 error อาจเป็นเพราะ token หมดอายุ ให้ล้าง token และ reload
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        console.log('Token expired, cleared from localStorage');
        // Retry with public endpoint
        try {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: itemsPerPage.toString(),
            ...(search && { search })
          });
          const response = await axios.get(`${apiUrl}/api/equipment/public?${params}`);
          const equipmentData = response.data.equipment || [];
          const pagination = response.data.pagination || { totalPages: 1, currentPage: 1 };
          setEquipment(equipmentData);
          setTotalPages(pagination.totalPages || 1);
        } catch (retryError) {
          console.error('Error fetching public equipment:', retryError);
          setEquipment([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch data when page, search, or user changes
  useEffect(() => {
    fetchEquipment(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch, user]);

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
        confirmButtonText: "ยืนยันการยืม",
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
        await fetchEquipment(currentPage, debouncedSearch);
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
        showDenyButton: pendingCount > 0,
        confirmButtonText: pendingCount > 0 ? `ยืนยันรายการที่เลือก (${pendingCount})` : "ยืนยันรายการที่เลือก",
        denyButtonText: "ลบรายการที่เลือก",
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

        const pendingTotal = items.reduce((sum, item) => sum + item.quantity_borrow, 0);

        const confirmBorrow = await swalWithBootstrapButtons.fire({
          title: "ยืนยันการยืมอุปกรณ์",
          html: `<p>คุณมี <strong>${items.length}</strong> รายการ (<strong>${pendingTotal}</strong> ชิ้น) ในรายการยืม</p>`,
          icon: "warning",
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonText: "ยืนยันการยืม",
          denyButtonText: "ยืมเพิ่มเติม",
          cancelButtonText: "ยกเลิก",
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
          await fetchEquipment(currentPage, debouncedSearch);
          await fetchBorrowItems();
        } else if (confirmBorrow.isDenied) {
          // ผู้ใช้กด "ยืมเพิ่มเติม" - รายการจะถูกเก็บไว้ใน localStorage และ popup จะปิด
          await swalWithBootstrapButtons.fire({
            title: "เพิ่มอุปกรณ์สำเร็จ!",
            html: `<p>คุณมี <strong>${items.length}</strong> รายการ (<strong>${pendingTotal}</strong> ชิ้น) รอยืม</p><p>กดปุ่ม "ยืนยันรายการที่เลือก" เพื่อยืมทั้งหมด</p>`,
            icon: "info",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } else if (result.isDenied) {
        // แสดง popup รายการอุปกรณ์ที่เลือกไว้พร้อมปุ่มลบทีละชิ้น
        const showDeleteItemsPopup = async () => {
          const pendingItems = getBorrowItems();
          
          if (pendingItems.length === 0) {
            return swalWithBootstrapButtons.fire({
              title: "ไม่มีรายการ",
              text: "ไม่มีอุปกรณ์ในรายการที่เลือก",
              icon: "info",
            });
          }

          // ดึงชื่ออุปกรณ์จากรายการ equipment ปัจจุบัน
          const getEquipmentName = (equipmentId) => {
            const found = equipment.find(e => Number(e.equipment_id) === Number(equipmentId));
            return found ? found.equipment_name : `อุปกรณ์ #${equipmentId}`;
          };

          // ดึงจำนวนอุปกรณ์คงเหลือ
          const getEquipmentMaxQty = (equipmentId) => {
            const found = equipment.find(e => Number(e.equipment_id) === Number(equipmentId));
            return found ? found.available_quantity : 999;
          };

          const buildItemsHtml = () => {
            const items = getBorrowItems();
            if (items.length === 0) {
              return '<p style="color: #6b7280; text-align: center;">ไม่มีรายการอุปกรณ์</p>';
            }
            return `
              <div style="max-height: 300px; overflow-y: auto; text-align: left;">
                ${items.map((item, index) => {
                  const maxQty = getEquipmentMaxQty(item.equipment_id);
                  return `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin: 8px 0; background: #f3f4f6; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="flex: 1; min-width: 0;">
                      <strong style="display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${index + 1}. ${getEquipmentName(item.equipment_id)}</strong>
                      <span style="color: #6b7280; font-size: 12px;">คงเหลือ: ${maxQty}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-left: 12px;">
                      <button 
                        type="button"
                        class="swal-minus-btn" 
                        data-equipment-id="${item.equipment_id}"
                        data-current-qty="${item.quantity_borrow}"
                        style="background: ${item.quantity_borrow <= 1 ? '#d1d5db' : '#3b82f6'}; color: white; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: ${item.quantity_borrow <= 1 ? 'not-allowed' : 'pointer'}; font-weight: bold; font-size: 18px; display: flex; align-items: center; justify-content: center;"
                      >
                        −
                      </button>
                      <span style="min-width: 40px; text-align: center; font-weight: bold; font-size: 16px;">${item.quantity_borrow}</span>
                      <button 
                        type="button"
                        class="swal-plus-btn" 
                        data-equipment-id="${item.equipment_id}"
                        data-current-qty="${item.quantity_borrow}"
                        data-max-qty="${maxQty}"
                        style="background: ${item.quantity_borrow >= maxQty ? '#d1d5db' : '#3b82f6'}; color: white; border: none; width: 32px; height: 32px; border-radius: 6px; cursor: ${item.quantity_borrow >= maxQty ? 'not-allowed' : 'pointer'}; font-weight: bold; font-size: 18px; display: flex; align-items: center; justify-content: center;"
                      >
                        +
                      </button>
                      <button 
                        type="button"
                        class="swal-delete-btn" 
                        data-equipment-id="${item.equipment_id}"
                        style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; margin-left: 8px;"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                `}).join('')}
              </div>
            `;
          };

          // ฟังก์ชันสำหรับ attach event listeners ให้ปุ่มทั้งหมด
          const attachEventListeners = (popup) => {
            const htmlContainer = popup.querySelector('.swal2-html-container');
            
            // ปุ่มลบ
            htmlContainer.querySelectorAll('.swal-delete-btn').forEach(btn => {
              btn.addEventListener('click', (e) => {
                const equipmentId = e.target.getAttribute('data-equipment-id');
                removeOneBorrowItem(equipmentId);
                htmlContainer.innerHTML = buildItemsHtml();
                attachEventListeners(popup);
                checkAndCloseIfEmpty();
              });
            });

            // ปุ่มลด
            htmlContainer.querySelectorAll('.swal-minus-btn').forEach(btn => {
              btn.addEventListener('click', (e) => {
                const equipmentId = e.target.getAttribute('data-equipment-id');
                const currentQty = parseInt(e.target.getAttribute('data-current-qty'), 10);
                // ไม่ให้ลดต่ำกว่า 1
                if (currentQty <= 1) return;
                const newQty = currentQty - 1;
                updateBorrowItemQuantity(equipmentId, newQty);
                htmlContainer.innerHTML = buildItemsHtml();
                attachEventListeners(popup);
              });
            });

            // ปุ่มเพิ่ม
            htmlContainer.querySelectorAll('.swal-plus-btn').forEach(btn => {
              btn.addEventListener('click', (e) => {
                const equipmentId = e.target.getAttribute('data-equipment-id');
                const currentQty = parseInt(e.target.getAttribute('data-current-qty'), 10);
                const maxQty = parseInt(e.target.getAttribute('data-max-qty'), 10);
                // ไม่ให้เพิ่มเกินจำนวนคงเหลือ
                if (currentQty >= maxQty) return;
                const newQty = currentQty + 1;
                updateBorrowItemQuantity(equipmentId, newQty);
                htmlContainer.innerHTML = buildItemsHtml();
                attachEventListeners(popup);
              });
            });
          };

          // ตรวจสอบว่ารายการหมดหรือยัง และปิด popup
          const checkAndCloseIfEmpty = () => {
            if (getBorrowItems().length === 0) {
              Swal.close();
              swalWithBootstrapButtons.fire({
                title: "ลบรายการทั้งหมดเรียบร้อย",
                icon: "success",
                timer: 1500,
                showConfirmButton: false
              });
            }
          };

          const deleteResult = await swalWithBootstrapButtons.fire({
            title: "รายการอุปกรณ์ที่เลือก",
            html: buildItemsHtml(),
            showCancelButton: true,
            showConfirmButton: true,
            showDenyButton: true,
            cancelButtonText: "กลับ",
            denyButtonText: "ลบทั้งหมด",
            confirmButtonText: "ยืนยันการยืม",
            reverseButtons: true,
            width: '500px',
            customClass: {
              cancelButton: "bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded",
              denyButton: "bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded",
              confirmButton: "bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded",
            },
            didOpen: () => {
              const popup = Swal.getPopup();
              attachEventListeners(popup);
            }
          });

          if (deleteResult.isDenied) {
            // ลบทั้งหมด
            removeBorrowItems();
            await swalWithBootstrapButtons.fire({
              title: "ลบรายการทั้งหมดเรียบร้อย",
              icon: "success",
              timer: 1500,
              showConfirmButton: false
            });
          } else if (deleteResult.isConfirmed) {
            // ยืนยันการยืม
            const items = getBorrowItems();
            if (items.length === 0) {
              return swalWithBootstrapButtons.fire({
                title: "ไม่มีรายการ",
                text: "ไม่มีอุปกรณ์ในรายการยืม",
                icon: "info",
              });
            }

            const payloadItems = items.map(item => ({
              equipment_id: item.equipment_id,
              quantity: item.quantity_borrow
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
            await fetchEquipment(currentPage, debouncedSearch);
            await fetchBorrowItems();
          }
          // กลับ (dismiss === cancel) - ไม่ต้องทำอะไร
        };

        await showDeleteItemsPopup();
      }
    } catch (error) {
      console.error("Error borrowing equipment:", error);
    }
  };

  const loadingData = isLoading || equipment.length === 0;
  return (
    <div style={{
      backgroundImage: `url(${bg2})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      minHeight: '100vh'
    }}>
      <ScrollToTopButton />

      {/* Image Popup Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              className="absolute -top-10 right-0 text-white text-4xl hover:text-gray-300 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.name}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-center text-white mt-4 text-lg font-medium">
              {selectedImage.name}
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* LCP Optimization: Use img tag instead of background-image for priority loading */}
        <div className="absolute inset-0 z-0">
          <img
            src={bg}
            alt="Background"
            className="w-full h-full object-cover"
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-black/40" /> {/* Dim overlay */}
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
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
            ) : equipment.length > 0 ? (
              equipment.map((item) => (
                <div key={item.equipment_id} className="relative bg-white border rounded-lg shadow-md transform transition duration-500 hover:scale-105 flex flex-col h-full">
                  <div className="w-full h-40 p-2">
                    <img
                      className="w-full h-full rounded-md object-cover object-center cursor-pointer hover:opacity-80 transition-opacity"
                      src={item.image ? `${apiUrl}/uploads/${item.image.replace(/\\/g, "/")}` : null}
                      alt={item.equipment_id}
                      loading="lazy"
                      onClick={() => setSelectedImage({
                        src: item.image ? `${apiUrl}/uploads/${item.image.replace(/\\/g, "/")}` : null,
                        name: item.equipment_name
                      })}
                    />
                  </div>
                  <div className="px-4 pb-3 flex flex-col flex-grow">
                    <h5 className="text-base sm:text-lg tracking-tight hover:text-sky-700 text-gray-900">
                      {item.equipment_name}
                    </h5>
                    <p className="text-sm text-gray-600 break-all">จำนวนคงเหลือ {item.available_quantity}</p>
                    <p className="text-xs text-gray-500 mt-2">อัพเดทเมื่อ: {new Date(item.updated_at).toLocaleString()}</p>
                    <hr className="w-full max-w-[12rem] h-1 mx-auto my-4 bg-gray-100 border-0 rounded" />
                    <div className="text-center pb-2 pb-2 mt-auto">
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
          className={`flex items-center justify-center px-6 py-3 me-3 text-lg font-bold border-2 rounded-xl shadow-md transition-all duration-200 ${currentPage === 1 ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 hover:scale-105'
            }`}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          ย้อนกลับ
        </button>
        <button
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center px-6 py-3 text-lg font-bold border-2 rounded-xl shadow-md transition-all duration-200 ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-400 hover:scale-105'
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
