import { ToastContainer } from 'react-toastify';
import useAuth from "./hooks/useAuth";
import AppRouter from "./routes/AppRouter";
import 'react-toastify/dist/ReactToastify.css';
function App() {
  const { loading } = useAuth();
  return (
   
    <>
    {loading ? (
      <span className="loading loading-bars loading-lg"></span>
    ) : (
      <>
        <ToastContainer 
          position="top-center"
          autoClose={3000}
          limit={1}
          newestOnTop
          closeOnClick
          pauseOnHover={false}
          style={{ zIndex: 999999 }}
        />
        <AppRouter />
      </>
    )}
  </>

  );
}

export default App;
