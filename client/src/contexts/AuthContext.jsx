import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowedCount, setBorrowedCount] = useState(0);
  const [returnedCount, setReturnedCount] = useState(0);
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  // ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setLoading(true);

      const response = await axios.get(`http://localhost:5000/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ฟังก์ชันสำหรับนับจำนวน Borrowed และ Returned
  const fetchBorrowRecords = async () => {
    if (!user || !user.user_id) return;
  
    const token = localStorage.getItem('token'); // ดึง token อีกครั้ง
    if (!token) {
      console.error('No token available');
      return;
    }
  
    try {
      const response = await axios.get(
        `http://localhost:5000/api/borrowRecords/all/${user.user_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const { data } = response.data;
  
      // ตั้งค่า count สำหรับสถานะ Borrowed และ Returned
      setBorrowedCount(data.borrowed_count);
      setReturnedCount(data.returned_count);
  
      // กรองข้อมูลเฉพาะที่สถานะเป็น Borrowed
      const borrowedRecords = data.borrow_records.filter(record => record.status === 'Borrowed');
      setBorrowedBooks(borrowedRecords); // ตั้งค่า borrowedBooks เฉพาะที่สถานะเป็น Borrowed
  
    } catch (error) {
      console.error('Error fetching borrow records:', error.message);
    }
  };
  
  // ดึงข้อมูล Borrow Records เมื่อ user พร้อม
  useEffect(() => {
    if (user) {
      fetchBorrowRecords();
    }
  }, [user]);
  

  // ฟังก์ชันสำหรับ logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        logout,
        fetchUserProfile,
        borrowedCount, 
        returnedCount,
        fetchBorrowRecords,
        borrowedBooks, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContextProvider };
export default AuthContext;
