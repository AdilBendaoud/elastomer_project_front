import axios from "axios";
import { useContext, createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token")); // Initialize with the token existence check
  const navigate = useNavigate();
  
  const loginAction = async (code, password) => {
    try {
      const response = await axios.post(process.env.REACT_APP_API_ENDPOINT+"/Auth/login", { code, password });
      if (response) {
        setUser(response.data.user);
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setIsAuthenticated(true);
        navigate("/");
        return;
      }
      throw new Error(response.message);
    } catch (err) {
      console.error(err);
    }
  };

  const isLogedIn = () => {
    const token = localStorage.getItem("token");
    const usr = localStorage.getItem("user");
    setToken(token);
    setUser(JSON.parse(usr));
    if (token) {
      setIsAuthenticated(true);
    }
  }

  const logOut = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Clear user from localStorage
    setIsAuthenticated(false); // Set isAuthenticated to false
    navigate("/login");
  };

  useEffect(() => {
    isLogedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, loginAction, logOut, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
