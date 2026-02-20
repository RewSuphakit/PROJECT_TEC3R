import { useEffect, useState } from "react";
import { FaArrowUp } from 'react-icons/fa';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // ตรวจสอบว่าเลื่อนลงมามากพอที่จะแสดงปุ่ม
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // เลื่อนขึ้นแบบนุ่มนวล
    });
  };

  return (
    <button
    onClick={scrollToTop}
    className={`z-50 fixed bottom-28 right-5 p-3 rounded-box bg-blue-500 text-white shadow-lg transition-opacity ${
      isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
    }`}
  >
    <FaArrowUp className="m-1" />
  </button>
  );
}
