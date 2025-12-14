import { useState } from "react";
import userApi from "../../api/auth/userApi";

function base64UrlToJson(base64Url) {
    if (!base64Url || typeof base64Url !== "string") return null;
    try {
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const pad = base64.length % 4;
        const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
        const binary = atob(padded);
        const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
        const json = new TextDecoder().decode(bytes);
        return JSON.parse(json);
    } catch {
        return null;
    }
}

function extractUserIdFromJwt(token) {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = base64UrlToJson(parts[1]);
    if (!payload || typeof payload !== "object") return null;

    const candidates = [
        payload.user_id,
        payload.userId,
        payload.uid,
        payload.id,
        payload._id,
        payload.sub,
    ];

    for (const v of candidates) {
        if (typeof v === "number") return v;
        if (typeof v === "string") {
            const s = v.trim();
            if (!s) continue;
            // If sub is an email, don't treat it as an id.
            if (s.includes("@")) continue;
            return s;
        }
    }

    return null;
}

export function isAdminLoggedIn() {
    return !!localStorage.getItem("admin_token");
}

// Custom hook cho user đăng ký và đăng nhập
export function useAuth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Đăng ký
    const register = async (username, email, password) => {
        setLoading(true);
        setError(null);
        try {
            await userApi.register({ username, email, password });
        } catch (err) {
            setError(err.detail || "Đăng ký thất bại. Vui lòng thử lại.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Đăng nhập
    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const res = await userApi.login({ email, password });
            if (res.access_token) {
                localStorage.setItem("token", res.access_token);

                // Try to fetch profile to get a stable user id for ownership checks.
                let profile = null;
                try {
                    profile = await userApi.getProfile();
                } catch {
                    // ignore
                }

                const tokenUserId = extractUserIdFromJwt(res.access_token);
                const userId = profile?.id ?? profile?._id ?? profile?.userId ?? tokenUserId ?? null;
                const username = profile?.full_name ?? profile?.fullName ?? res.full_name ?? email;

                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        id: userId,
                        username,
                        email,
                    })
                );
            }
            return res;
        } catch (err) {
            setError(err.detail || "Đăng nhập thất bại. Vui lòng thử lại.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { register, login, loading, error, setError };
}