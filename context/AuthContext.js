import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  setAuthToken,
  getCurrentUser,
  loginUser,
} from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");

        if (!storedToken) {
          setLoading(false);
          return;
        }

        setAuthToken(storedToken);
        setToken(storedToken);

        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.log("Auth load failed:", err);
        await AsyncStorage.removeItem("token");
        setAuthToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

  const login = async (credentials) => {
    const res = await loginUser(credentials);

    if (!res?.token) {
      throw new Error("Invalid login response");
    }

    await AsyncStorage.setItem("token", res.token);
    setAuthToken(res.token);
    setToken(res.token);
    if (res.user) {
      setUser(res.user);
    } else {
      const userData = await getCurrentUser();
      setUser(userData);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
