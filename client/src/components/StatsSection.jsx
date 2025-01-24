import React, { useEffect, useRef } from "react";
import { CountUp } from "countup.js";

const StatsSection = ({ stats }) => {
  const sectionRef = useRef(null); // อ้างอิงถึง div ที่ต้องการสังเกต

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // เมื่อ div เข้าสู่ viewport ให้เริ่มนับใหม่
          stats.forEach((stat) => {
            const countUp = new CountUp(`stat-${stat.id}`, stat.count, {
              duration: 2, // ระยะเวลาในการนับ
              useEasing: true, // ใช้ easing เพื่อให้ดู smooth
            });

            if (!countUp.error) {
              countUp.start();
            } else {
              console.error("CountUp error:", countUp.error);
            }
          });
        }
      },
      { threshold: 0.5 } // ต้องปรากฏใน viewport อย่างน้อย 50%
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current); // สังเกต div
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current); // ยกเลิกการสังเกตเมื่อ component ถูก unmount
      }
    };
  }, [stats]);

  return (
    <section className="flex flex-col pt-6 pb-8">
      <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 text-center px-4">
        จำนวนการยืม-คืนอุปกรณ์ทั้งหมด
      </p>
      <div
        ref={sectionRef} // เชื่อม ref กับ div
        className="mt-6 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 place-items-center w-full mx-auto max-w-7xl px-4 sm:px-5 pb-16 sm:pb-32"
        data-aos="fade-up"
        data-aos-anchor-placement="center-bottom"
      >
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="flex flex-col justify-center items-center bg-white px-4 py-6 w-full rounded-lg border border-gray-300 drop-shadow-md"
          >
            <div className="flex flex-row justify-center items-center">
              <img
                className="w-[30px] h-[30px] sm:w-[35px] sm:h-[35px] md:w-[50px] md:h-[50px] object-contain"
                src={stat.icon}
                alt=""
                loading="lazy"
              />
              <p
                id={`stat-${stat.id}`}
                className="text-gray-600 text-xl sm:text-2xl lg:text-4xl leading-9 ml-2"
              >
                0 {/* เริ่มจาก 0 */}
              </p>
            </div>
            <p className="font-medium text-sm sm:text-base md:text-lg leading-6 mt-3 md:mt-6 text-center">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
