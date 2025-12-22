import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const adminClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

adminClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

adminClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        throw error.response?.data || error;
    }
);

export async function adminLogin(email, password) {
    // Không bắt buộc có admin_token khi login.
    return adminClient.post(`/admin/login`, { email, password });
}

const unwrap = (res) => res?.data ?? res;

// --- Community post moderation (Admin) ---
// Suggested BE endpoints:
// GET    /admin/community/posts?status=pending&limit=50&offset=0
// POST   /admin/community/posts/:postId/approve
// POST   /admin/community/posts/:postId/need-edit { feedback: string }
// POST   /admin/community/posts/:postId/reject   { reason?: string }

// --- Community reports (Admin) ---
// Suggested BE endpoints:
// GET /admin/community/reports?status=open&limit=50&offset=0
// Response suggestion: { items: [{ postId, post: { ... }, reportCount, topReasons, lastReportedAt }] }

export async function adminListCommunityReports(params = {}, options = {}) {
    const res = await adminClient.get(`/admin/community/reports`, { params, ...options });
    return unwrap(res);
}

export async function adminListCommunityPosts(params = {}, options = {}) {
    const res = await adminClient.get(`/admin/community/posts`, { params, ...options });
    return unwrap(res);
}

export async function adminApproveCommunityPost(postId) {
    const res = await adminClient.post(`/admin/community/posts/${postId}/approve`);
    return unwrap(res);
}

export async function adminRejectCommunityPost(postId, payload = {}) {
    const res = await adminClient.post(`/admin/community/posts/${postId}/reject`, payload);
    return unwrap(res);
}

export async function adminNeedEditCommunityPost(postId, payload = {}) {
    const res = await adminClient.post(`/admin/community/posts/${postId}/need-edit`, payload);
    return unwrap(res);
}

// --- Community report handling (Admin) ---
// Suggested BE endpoints:
// POST /admin/community/reports/posts/:postId/dismiss  -> dismiss/close reports for a post without changing post visibility
// DELETE /admin/community/posts/:postId               -> hard/soft delete a post (used when confirming violation)

export async function adminDismissCommunityReportsForPost(postId) {
    const res = await adminClient.post(`/admin/community/reports/posts/${postId}/dismiss`);
    return unwrap(res);
}

export async function adminDeleteCommunityPost(postId) {
    const res = await adminClient.delete(`/admin/community/posts/${postId}`);
    return unwrap(res);
}
