import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Gắn token vào Header nếu có
axiosClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('ha_token');

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Xử lý phản hồi
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    throw error.response ? error.response.data : error;
  }
);

export default axiosClient;