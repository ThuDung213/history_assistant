import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Update a location by id (admin)
 * @param {string} id
 * @param {Object} payload
 */
export async function updateLocationById(id, payload) {
  try {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      throw new Error("Admin authentication required. Please login first.");
    }

    const res = await axios.patch(`${API_URL}/admin/locations/${id}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        detail: error.message || "Update location failed",
      }
    );
  }
}
