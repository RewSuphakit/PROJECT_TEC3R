import React, { useEffect, useRef, useState } from "react";
import { CountUp } from "countup.js";
import axios from "axios";
import {
  HiCube,
  HiUsers,
  HiBookOpen,
  HiCheckCircle,
} from "react-icons/hi";

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL;

const StatsSection = () => {
  const sectionRef = useRef(null);
  const [statsData, setStatsData] = useState([]);

  // ================= FETCH DATA =================
  useEffect(() => {
    axios
      .get(`${apiUrl}/api/stats/stats/`)
      .then((response) => {
        setStatsData([
          {
            id: 1,
            label: "อุปกรณ์ที่มีทั้งหมด",
            count: response.data.total_equipment,
            icon: "equipment",
          },
          {
            id: 2,
            label: "ผู้ใช้งานทั้งหมด",
            count: response.data.total_users,
            icon: "users",
          },
          {
            id: 3,
            label: "จำนวนการยืมทั้งหมด",
            count: response.data.total_borrow_items,
            icon: "borrow",
          },
          {
            id: 4,
            label: "จำนวนการคืนทั้งหมด",
            count: response.data.total_returned,
            icon: "returned",
          },
        ]);
      })
      .catch((err) => console.error("Error fetching stats:", err));
  }, []);

  // ================= COUNT ANIMATION =================
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && statsData.length > 0) {
          statsData.forEach((stat) => {
            const countUp = new CountUp(`stat-${stat.id}`, stat.count, {
              duration: 2,
              useEasing: true,
            });
            if (!countUp.error) countUp.start();
          });
        }
      },
      { threshold: 0.4 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [statsData]);

  // ================= ICON CONFIG =================
  const iconConfig = {
    equipment: {
      icon: HiCube,
      bg: "bg-blue-100",
      text: "text-blue-600",
    },
    users: {
      icon: HiUsers,
      bg: "bg-green-100",
      text: "text-green-600",
    },
    borrow: {
      icon: HiBookOpen,
      bg: "bg-orange-100",
      text: "text-orange-600",
    },
    returned: {
      icon: HiCheckCircle,
      bg: "bg-emerald-100",
      text: "text-emerald-600",
    },
  };

  return (
    <section className="py-10 ">
      <div
        ref={sectionRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-6"
      >
        {statsData.length > 0 ? (
          statsData.map((stat) => {
            const { icon: Icon, bg, text } = iconConfig[stat.icon];

            return (
              <div
                key={stat.id}
                className="
                  flex items-center gap-6
                  bg-white
                  px-8 py-8
                  rounded-2xl
                  shadow-md
                  hover:shadow-lg
                  transition duration-300
                "
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${bg}`}
                >
                  <Icon className={`w-7 h-7 ${text}`} />
                </div>

                {/* Text */}
                <div>
                  <p
                    id={`stat-${stat.id}`}
                    className="text-4xl font-bold text-gray-800"
                  >
                    0
                  </p>
                  <p className="mt-2 text-gray-600 text-base font-medium">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="col-span-full text-center text-gray-400">
            Loading stats...
          </p>
        )}
      </div>
    </section>
  );
};

export default StatsSection;