import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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

  // Only default to JSON content-type when appropriate.
  // For FormData uploads, the browser must set the multipart boundary.
  config.headers = config.headers || {};
  const isFormData =
    typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (isFormData) {
    // If caller set Content-Type explicitly, keep it.
    // Otherwise ensure we don't force application/json.
    if (!('Content-Type' in config.headers) && !('content-type' in config.headers)) {
      // Leave undefined to allow browser to set it.
    }
  } else {
    if (!('Content-Type' in config.headers) && !('content-type' in config.headers)) {
      config.headers['Content-Type'] = 'application/json';
    }
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