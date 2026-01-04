import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const galleryApi = {
  getGallery() {
    // Use public gallery listing so admin UI can show existing images
    return axios.get(`${API_URL}/gallery`);
  },

  uploadImages(files, year) {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    if (year !== undefined && year !== null)
      formData.append("year", String(year));
    const token = localStorage.getItem("admin_token");
    return axios.post(`${API_URL}/admin/gallery/uploads`, formData, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  deleteImage(publicId) {
    const token = localStorage.getItem("admin_token");
    return axios.delete(
      `${API_URL}/admin/gallery/${encodeURIComponent(publicId)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },
  updateImage(payload) {
    const token = localStorage.getItem("admin_token");
    return axios.patch(`${API_URL}/admin/gallery/image`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
