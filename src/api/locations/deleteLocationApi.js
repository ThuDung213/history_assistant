import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Delete a location by id (admin)
 * @param {string} id
 */
export async function deleteLocationById(id) {
  try {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      throw new Error("Admin authentication required. Please login first.");
    }

    const res = await axios.delete(`${API_URL}/admin/locations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        detail: error.message || "Delete location failed",
      }
    );
  }
}
