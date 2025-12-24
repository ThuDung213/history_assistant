import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * @param {import('../types/location').HistoricalSitePayload} payload
 */
export async function createHistoricalLocation(payload) {
  try {
    // Get admin token from localStorage
    const token = localStorage.getItem("admin_token");

    if (!token) {
      throw new Error("Admin authentication required. Please login first.");
    }

    const res = await axios.post(`${API_URL}/admin/locations/create`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        detail: error.message || "Create location failed",
      }
    );
  }
}
