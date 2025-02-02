import React, { useEffect, useRef, useState } from "react";
import { CountUp } from "countup.js";
import axios from 'axios';

const StatsSection = () => {
  const sectionRef = useRef(null); // Reference to the section we want to observe
  const [statsData, setStatsData] = useState([]);

  useEffect(() => {
    
    
    axios.get("http://localhost:5000/api/stats/stats/")
      .then((response) => {
        // Assuming the response contains the correct structure, map it properly
        const fetchedStats = [
          { id: 1, label: 'อุปกรณ์ที่มีทั้งหมด', count: response.data.total_equipment, icon: 'https://img.icons8.com/?size=100&id=Wwrq6dySBLGL&format=png&color=000000' },
          { id: 2, label: 'ผู้ใช้งานทั้งหมด', count: response.data.total_users, icon: 'https://img.icons8.com/?size=100&id=13042&format=png&color=000000' },
          { id: 3, label: 'การยืมอุปกรณ์ทั้งหมด', count: response.data.total_borrowed, icon: 'https://img.icons8.com/?size=100&id=tbXXLF54CFmX&format=png&color=000000' },
          { id: 4, label: 'การคืนอุปกรณ์ทั้งหมด', count: response.data.total_returned, icon: 'https://img.icons8.com/?size=100&id=sLAKrHTYvco6&format=png&color=000000' }
        ];

        setStatsData(fetchedStats);
      })
      .catch((error) => {
        console.error("Error fetching stats:", error);
      });
  }, []);

  useEffect(() => {
    // Intersection Observer to trigger animation when section is in view
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && statsData.length > 0) {
          statsData.forEach((stat) => {
            const countUp = new CountUp(`stat-${stat.id}`, stat.count, {
              duration: 2, // Duration of the count animation
              useEasing: true, // Smooth animation
            });

            if (!countUp.error) {
              countUp.start();
            } else {
              console.error("CountUp error:", countUp.error);
            }
          });
        }
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current); // Observe the section div
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current); // Clean up observer on unmount
      }
    };
  }, [statsData]);

  return (
    <section className="flex flex-col pt-6 pb-8">
      <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 text-center px-4">
        จำนวนการยืม-คืนอุปกรณ์ทั้งหมด
      </p>
      <div
        ref={sectionRef} // Attach the ref to this div
        className="mt-6 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 place-items-center w-full mx-auto max-w-7xl px-4 sm:px-5 pb-16 sm:pb-32"
        data-aos="fade-up"
        data-aos-anchor-placement="center-bottom"
      >
        {statsData.length > 0 ? (
          statsData.map((stat) => (
            <div
              key={stat.id}
              className="flex flex-col justify-center items-center bg-white px-4 py-6 w-full rounded-lg border border-gray-300 drop-shadow-md"
            >
              <div className="flex flex-row justify-center items-center">
                <img
                  className="w-[30px] h-[30px] sm:w-[35px] sm:h-[35px] md:w-[50px] md:h-[50px] object-contain"
                  src={stat.icon}
                  alt={stat.label}
                  loading="lazy"
                />
                <p
                  id={`stat-${stat.id}`}
                  className="text-gray-600 text-xl sm:text-2xl lg:text-4xl leading-9 ml-2"
                >
                  0 {/* Initial value is set to 0 */}
                </p>
              </div>
              <p className="font-medium text-sm sm:text-base md:text-lg leading-6 mt-3 md:mt-6 text-center">
                {stat.label}
              </p>
            </div>
          ))
        ) : (
          <p>Loading stats...</p> // Display loading message if statsData is empty
        )}
      </div>
    </section>
  );
};

export default StatsSection;
