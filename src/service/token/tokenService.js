// src/api/tokenService.js

export const tokenService = {
  getAccess() {
    return localStorage.getItem("accessToken");
  },

  getRefresh() {
    return localStorage.getItem("refreshToken");
  },

  setTokens({ access, refresh }) {
    if (access) localStorage.setItem("accessToken", access);
    if (refresh) localStorage.setItem("refreshToken", refresh);
  },

  clear() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
};