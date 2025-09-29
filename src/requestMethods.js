import axios from "axios";

const BASE_URL = "https://ecommerce-backend-60wi.onrender.com/api/";

const getToken = () => {
  try {
    const root = localStorage.getItem("persist:root");
    if (!root) return null;
    const user = JSON.parse(JSON.parse(root).user);
    return user.currentUser?.accessToken || null;
  } catch {
    return null;
  }
};

export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
});

userRequest.interceptors.request.use(config => {
  const token = getToken();
  if (token) config.headers.token = `Bearer ${token}`;
  return config;
});