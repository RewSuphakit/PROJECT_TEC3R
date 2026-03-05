import React from 'react';

/**
 * Pagination component สำหรับหน้า admin
 * @param {number} currentPage - หน้าปัจจุบัน
 * @param {number} totalPages - จำนวนหน้าทั้งหมด
 * @param {Function} onPageChange - callback เมื่อเปลี่ยนหน้า
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex justify-center">
      <div className="filter-card rounded-xl p-4 shadow-lg flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
        >
          «
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
        >
          ‹
        </button>

        {Array.from({ length: totalPages }, (_, i) => {
          if (totalPages <= 5 || i === 0 || i === totalPages - 1 || Math.abs(currentPage - (i + 1)) <= 1) {
            return (
              <button
                key={i}
                onClick={() => onPageChange(i + 1)}
                className={`w-10 h-10 rounded-lg font-bold transition-all ${currentPage === i + 1
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200 scale-105"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {i + 1}
              </button>
            );
          } else if (i === 1 && currentPage > 3) {
            return <span key={i} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
          } else if (i === totalPages - 2 && currentPage < totalPages - 2) {
            return <span key={i} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
          }
          return null;
        })}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
        >
          ›
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="w-10 h-10 rounded-lg bg-white border border-gray-200 text-gray-600 font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Pagination;
