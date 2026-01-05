import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const locationApi = {
  uploadImages(files) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file); // 🔥 CỰC KỲ QUAN TRỌNG
    });

    return axios.post(`${API_URL}/admin/locations/uploads`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
      },
    });
  },
  createLocation(payload) {
    const token = localStorage.getItem("admin_token");
    return axios.post(`${API_URL}/admin/locations/create`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  updateLocation(id, payload) {
    const token = localStorage.getItem("admin_token");
    return axios.patch(`${API_URL}/admin/locations/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
