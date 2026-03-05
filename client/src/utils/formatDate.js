/**
 * จัดรูปแบบวันที่เป็นภาษาไทย: DD/MM/YYYY HH:mm (พ.ศ.)
 * @param {string} dateString - วันที่ในรูปแบบ ISO string
 * @returns {string} วันที่ในรูปแบบไทย
 */
export const formatThaiDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Fallback

    const year = date.getFullYear() + 543;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};
