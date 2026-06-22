import axios from "axios";

const BASE_URL = "URL_HERE";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const registerUser = async (data) => {
  try {
    const res = await api.post("/user/register", data);

    if (res.data.token) {
      setAuthToken(res.data.token);
    }

    return res.data;
  } catch (error) {
    throw error.response?.data || { detail: "Registration failed" };
  }
};


export const loginUser = async (data) => {
  try {
    const res = await api.post("user/login", data);
    if (res.data.token) setAuthToken(res.data.token);
    return res.data;
  } catch (error) {
    throw error.response?.data || { detail: "Login failed" };
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await api.get("/user/me");
    return res.data;
  } catch (error) {
    throw error.response?.data || { detail: "Unable to fetch user" };
  }
};

export const updateUser = async (data) => {
  try {
    const res = await api.patch("/user/update", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { detail: "Update failed" };
  }
};

export const sendForgotPasswordOTP = async (email) => {
  try {
    const res = await api.post("user/forgot-password/send-otp", { email });
    return res.data;
  } catch (error) {
    throw error.response?.data || { detail: "Failed to send OTP" };
  }
};

export const verifyAndResetPassword = async (data) => {
  try {
    const res = await api.post("user/forgot-password/verify", data);
    return res.data;
  } catch (error) {
    throw error.response?.data || { detail: "Reset failed" };
  }
};

export const deleteUser = async () => {
  try {
    const res = await api.delete("/user/delete");
    setAuthToken(null);
    return res.data;
  } catch (error) {
    throw error.response?.data || { detail: "Delete failed" };
  }
};



export const generateDailySummary = async () => {
  try {
    const res = await api.post("/med/med/daily-summary");
    return res.data;
  } catch (error) {
    throw error.response?.data || { detail: "Daily summary failed" };
  }
};

export const getWeeklySummary = async () => {
  try {
    const res = await api.get("/med/med/weekly-summary");
    return res.data;
  } catch (error) {
    throw error.response?.data || { detail: "Weekly summary failed" };
  }
};

export const getWeeklyLLMReport = async () => {
  try {
    const res = await api.get("llm/llm/weekly-report");
    return res.data;
  } catch (error) {
    throw error.response?.data || {
      detail: "Failed to fetch weekly LLM report",
    };
  }
};

