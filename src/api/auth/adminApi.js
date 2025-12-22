import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export async function adminLogin(email, password) {
    try {
        const res = await axios.post(`${API_URL}/admin/login`, {
            email,
            password,
        });

        return res.data;
    } catch (error) {
        throw error.response?.data || { detail: "Login failed" };
    }
}
