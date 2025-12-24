import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * @returns {Promise<import("../../types/location").HistoricalSite[]>}
 */
export const getLocationsList = async () => {
    try {
        // Get admin token from localStorage
        const token = localStorage.getItem("admin_token");

        if (!token) {
            throw new Error("Admin authentication required. Please login first.");
        }

        const res = await axios.get(`${API_URL}/admin/locations`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        return res.data;
    } catch (error) {
        throw error.response?.data || { detail: error.message || "Create location failed" };
    }
};
