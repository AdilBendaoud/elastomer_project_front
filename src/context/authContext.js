import axios from "axios";
import { useContext, createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem("user"));
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const navigate = useNavigate();
  
  const loginAction = async (code, password) => {
    const response = await axios.post(process.env.REACT_APP_API_ENDPOINT+"/Auth/login", { code, password });
    if (response.status === 200) {
      setUser(response.data.user);
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setIsAuthenticated(true);
      navigate("/");
      return;
    }
    throw new Error(response.message);
  };

  const isLogedIn = () => {
    const token = localStorage.getItem("token");
    setToken(token);
    setUser(JSON.parse(localStorage.getItem("user")));
    if (token) {
      setIsAuthenticated(true);
    }
  }

  const logOut = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
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
