import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * @returns {Promise<import("../../types/galleryImage").Gallery[]>}
 */
export const getGalleryImages = async () => {
  try {
    // Get admin token from localStorage
    const token = localStorage.getItem("admin_token");

    if (!token) {
      throw new Error("Admin authentication required. Please login first.");
    }

    const res = await fetch(`${API_URL}/gallery`);
    return res.json();
  } catch (error) {
    throw (
      error.response?.data || {
        detail: error.message || "Cannot get gallery image",
      }
    );
  }
};
