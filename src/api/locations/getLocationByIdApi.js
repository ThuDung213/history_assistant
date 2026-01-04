import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Get a single location by id (public)
 * @param {string} id
 */
export async function getLocationById(id) {
  try {
    const res = await axios.get(`${API_URL}/locations/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } catch (error) {
    throw (
      error.response?.data || {
        detail: error.message || "Get location failed",
      }
    );
  }
}
