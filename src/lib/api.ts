import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL;

export const ACCESS_KEY = "samriva_admin.access_token";
export const REFRESH_KEY = "samriva_admin.refresh_token";

export const api = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;
  try {
    const res = await axios.post(`${BASE}/api/auth/refresh`, { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = res.data.data;
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, newRefreshToken);
    return accessToken as string;
  } catch {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    return null;
  }
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!refreshing) refreshing = doRefresh();
      const token = await refreshing;
      refreshing = null;
      if (!token) throw err;
      original.headers.Authorization = `Bearer ${token}`;
      return api(original);
    }
    throw err;
  }
);
