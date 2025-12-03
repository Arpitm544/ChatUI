import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "https://chatui-1-ffr2.onrender.com",
  withCredentials: true,
});

export default axiosInstance;
