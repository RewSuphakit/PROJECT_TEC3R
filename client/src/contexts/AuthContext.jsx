import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

const apiUrl = import.meta.env.VITE_REACT_APP_API_URL; // ตรวจสอบว่ามีค่า
if (!apiUrl) {
  console.warn('VITE_REACT_APP_API_URL is undefined. Check your .env file!');
}

const AuthContext = createContext();

function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowedCount, setBorrowedCount] = useState(0);
  const [returnedCount, setReturnedCount] = useState(0);
  const [borrowedBooks, setBorrowedBooks] = useState([]);

  // ดึง token จาก localStorage
  const getToken = () => localStorage.getItem('token');

  // ==========================
  // Fetch User Profile
  // ==========================
  const fetchUserProfile = async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${apiUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      
      // ถ้าได้ 401 error แสดงว่า token หมดอายุหรือไม่ถูกต้อง ให้ล้าง token ออก
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        console.log('Token expired or invalid, removed from localStorage');
      }
      
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Fetch Borrow Items
  // ==========================
  const fetchBorrowItems = async (userId = user?.user_id) => {
    if (!userId) return;

    const token = getToken();
    if (!token) {
      console.error('No token available');
      return;
    }

    try {
      const response = await axios.get(
        `${apiUrl}/api/borrow/all/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { data } = response.data;

      setBorrowedCount(data.borrowed_count || 0);
      setReturnedCount(data.returned_count || 0);

      const borrowedItems = (data.borrow_items || []).filter(
        (item) => item.status !== 'Returned'
      );
      setBorrowedBooks(borrowedItems);
      setBorrowedCount(borrowedItems.length);
    } catch (error) {
      console.error('Error fetching borrow items:', error.message);
      
      // ถ้าได้ 401 error แสดงว่า token หมดอายุหรือไม่ถูกต้อง ให้ล้าง token ออก
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        console.log('Token expired or invalid, removed from localStorage');
        setUser(null);
      }
      
      setBorrowedCount(0);
      setReturnedCount(0);
      setBorrowedBooks([]);
    }
  };

  // ==========================
  // Logout
  // ==========================
  const logout = () => {
    setUser(null);
    setBorrowedBooks([]);
    setBorrowedCount(0);
    setReturnedCount(0);
    localStorage.removeItem('token');
  };

  // ==========================
  // Auto fetch user on mount
  // ==========================
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ==========================
  // Fetch borrow records when user changes
  // ==========================
  useEffect(() => {
    if (user?.user_id) {
      fetchBorrowItems();
    }
  }, [user]);

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
        borrowedBooks,
        fetchBorrowItems,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContextProvider };
export default AuthContext;
