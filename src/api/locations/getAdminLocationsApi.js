import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Admin locations list for dashboard.
 * Expected BE: GET /admin/locations (requires admin auth)
 *
 * @returns {Promise<import("../../types/location").HistoricalSite[]>}
 */
export const getAdminLocationsList = async () => {
  try {
    const token = localStorage.getItem("admin_token");

    if (!token) {
      throw new Error("Admin authentication required. Please login first.");
    }

    const res = await axios.get(`${API_URL}/admin/locations`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        detail: error.message || "Cannot get admin locations",
      }
    );
  }
};
