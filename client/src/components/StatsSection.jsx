import React, { useEffect, useRef, useState } from "react";
import { CountUp } from "countup.js";
import axios from 'axios';
const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

const StatsSection = () => {
  const sectionRef = useRef(null); // Reference to the section we want to observe
  const [statsData, setStatsData] = useState([]);

  useEffect(() => {
    axios.get(`${apiUrl}/api/stats/stats/`)
      .then((response) => {
        const fetchedStats = [
          { id: 1, label: 'อุปกรณ์ที่มีทั้งหมด', count: response.data.total_equipment, icon: 'equipment' },
          { id: 2, label: 'ผู้ใช้งานทั้งหมด', count: response.data.total_users, icon: 'users' },
          { id: 3, label: 'จำนวนการยืมทั้งหมด', count: response.data.total_borrow_items, icon: 'borrow' },
          { id: 4, label: 'จำนวนการคืนทั้งหมด', count: response.data.total_returned, icon: 'returned' }
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

// Inline SVG icons — no external network requests needed
const StatIcon = ({ type }) => {
  const icons = {
    equipment: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    users: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    borrow: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    returned: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };
  return icons[type] || null;
};

  return (
    <section className="flex flex-col pt-6 pb-8">
      <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 text-center px-4">
        จำนวนการยืม-คืนอุปกรณ์ทั้งหมด
      </p>
      <div
        ref={sectionRef}
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
                <StatIcon type={stat.icon} />
                <p
                  id={`stat-${stat.id}`}
                  className="text-gray-600 text-xl sm:text-2xl lg:text-4xl leading-9 ml-2"
                >
                  0
                </p>
              </div>
              <p className="font-medium text-sm sm:text-base md:text-lg leading-6 mt-3 md:mt-6 text-center">
                {stat.label}
              </p>
            </div>
          ))
        ) : (
          <p>Loading stats...</p>
        )}
      </div>
    </section>
  );
};

export default StatsSection;
