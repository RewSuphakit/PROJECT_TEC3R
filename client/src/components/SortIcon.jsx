import React from 'react';

/**
 * Component แสดง icon การเรียงลำดับ
 * @param {string} field - field ของคอลัมน์
 * @param {string} sortField - field ที่กำลัง sort อยู่
 * @param {string} sortOrder - ลำดับ ('asc' หรือ 'desc')
 * @param {string} size - ขนาดตัวอักษร ('xs' หรือ 'sm' หรือ default)
 */
const SortIcon = ({ field, sortField, sortOrder, size }) => {
  const sizeClass = size === 'xs' ? 'text-xs' : '';

  if (sortField !== field) {
    return <span className={`ml-1 text-gray-300 ${sizeClass}`}>⇅</span>;
  }
  return sortOrder === 'asc'
    ? <span className={`ml-1 text-blue-600 ${sizeClass}`}>▲</span>
    : <span className={`ml-1 text-blue-600 ${sizeClass}`}>▼</span>;
};

export default SortIcon;
