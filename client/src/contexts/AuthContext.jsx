import axios from 'axios';
import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true); 

  
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

  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContextProvider };
export default AuthContext;
