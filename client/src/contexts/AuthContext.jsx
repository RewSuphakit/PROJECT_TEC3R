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
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Fetch Borrow Records
  // ==========================
  const fetchBorrowRecords = async (userId = user?.user_id) => {
    if (!userId) return;

    const token = getToken();
    if (!token) {
      console.error('No token available');
      return;
    }

    try {
      const response = await axios.get(
        `${apiUrl}/api/borrowRecords/all/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { data } = response.data;

      setBorrowedCount(data.borrowed_count || 0);
      setReturnedCount(data.returned_count || 0);

      const borrowedRecords = (data.borrow_records || []).filter(
        (record) => record.status !== 'Returned'
      );
      setBorrowedBooks(borrowedRecords);
      setBorrowedCount(borrowedRecords.length);
    } catch (error) {
      console.error('Error fetching borrow records:', error.message);
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
      fetchBorrowRecords();
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
        fetchBorrowRecords,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContextProvider };
export default AuthContext;
