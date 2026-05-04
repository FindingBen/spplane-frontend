import axios from "axios";
import dayjs from "dayjs";
import { jwtDecode } from "jwt-decode";
import { tokenService } from "../token/tokenService";

const API_URL = import.meta.env.VITE_API_URL;

// Create ONE instance
const axiosInstance = axios.create({
  baseURL: API_URL,
});

let isRefreshing = false;
let refreshPromise = null;

// Safe decode
const safeDecode = (token) => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

// 🔄 Refresh token request
const refreshAccessToken = async () => {
  const refresh = tokenService.getRefresh();

  if (!refresh) throw new Error("No refresh token");

  const response = await axios.post(`${API_URL}/api/accounts/token/refresh/`, {
    refresh,
  });

  const newAccess = response.data.access;

  tokenService.setTokens({ access: newAccess });

  return newAccess;
};

// 📤 REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  async (config) => {
    let accessToken = tokenService.getAccess();

    if (!accessToken) return config;

    const decoded = safeDecode(accessToken);

    if (!decoded) return config;

    const now = dayjs();
    const exp = dayjs.unix(decoded.exp);
    const timeLeft = exp.diff(now, "seconds");

    // Refresh if expiring in < 5 minutes
    if (timeLeft < 300) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken().finally(() => {
          isRefreshing = false;
        });
      }

      try {
        accessToken = await refreshPromise;
      } catch (err) {
        tokenService.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 📥 RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccess = await refreshAccessToken();

        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        tokenService.clear();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;