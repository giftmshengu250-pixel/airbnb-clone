import axios from "axios";

// Reads the backend URL from the .env file so the frontend and backend
// stay linked without hard-coding anything.
const API_URL = import.meta.env.VITE_API_URL || "https://airbnb-clone-w2af.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
});

// Automatically attach the saved JWT (if any) to every request
api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem("airbnb_user");
  if (storedUser) {
    const { token } = JSON.parse(storedUser);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
