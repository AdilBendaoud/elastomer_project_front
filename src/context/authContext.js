import axios from "axios";
import { useContext, createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [isBlocked, setIsBlocked] = useState(localStorage.getItem("isBlocked") === 'true');
  const [mustChangePassword, setMustChangePassword] = useState(localStorage.getItem("mustChangePassword") === 'true');
  const navigate = useNavigate();

  const loginAction = async (code, password) => {
    const response = await axios.post(process.env.REACT_APP_API_ENDPOINT + "/Auth/login", { code, password });
    if (response.status === 200) {
      const { user, token } = response.data;
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      setMustChangePassword(user.needsPasswordChange);
      setIsBlocked(!user.isActive);

      // Save to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("mustChangePassword", user.needsPasswordChange);
      localStorage.setItem("isBlocked", !user.isActive);
      navigate("/");
      return;
    }
    throw new Error(response.message);
  };

  const isLogedIn = () => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const mustChangePassword = localStorage.getItem("mustChangePassword") === 'true';
    const isBlocked = localStorage.getItem("isBlocked") === 'true';

    setToken(token);
    setUser(user);
    setMustChangePassword(mustChangePassword);
    setIsBlocked(isBlocked);

    if (token) {
      setIsAuthenticated(true);
    }
  };

  const logOut = () => {
    setUser(null);
    setToken("");
    setIsAuthenticated(false);
    setMustChangePassword(false);
    setIsBlocked(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("mustChangePassword");
    localStorage.removeItem("isBlocked");
    navigate("/login");
  };

  useEffect(() => {
    isLogedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, loginAction, logOut, isAuthenticated, mustChangePassword, isBlocked }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
