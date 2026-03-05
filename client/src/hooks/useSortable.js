import { useState, useCallback } from 'react';

/**
 * Hook สำหรับจัดการ sorting ของตาราง
 * @param {string} defaultField - field เริ่มต้นที่ใช้ sort
 * @param {string} defaultOrder - ลำดับเริ่มต้น ('asc' หรือ 'desc')
 * @param {Function} setCurrentPage - ฟังก์ชัน reset หน้าเมื่อเปลี่ยน sort
 * @returns {{ sortField: string, sortOrder: string, handleSort: Function }}
 */
export const useSortable = (defaultField = 'id', defaultOrder = 'asc', setCurrentPage) => {
    const [sortField, setSortField] = useState(defaultField);
    const [sortOrder, setSortOrder] = useState(defaultOrder);

    const handleSort = useCallback((field) => {
        if (sortField === field) {
            // Toggle order if same field
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            // New field, reset to default order
            setSortField(field);
            setSortOrder('asc');
        }
        // Reset to page 1 when sort changes
        if (setCurrentPage) {
            setCurrentPage(1);
        }
    }, [sortField, setCurrentPage]);

    return { sortField, sortOrder, handleSort };
};
