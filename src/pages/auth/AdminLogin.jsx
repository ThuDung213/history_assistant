import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../api/auth/adminApi";


// Component LoadingSpinner để tái sử dụng
const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default function AdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setError("");

        try {
            const data = await adminLogin(email, password);

            // Lưu token vào localStorage
            localStorage.setItem("admin_token", data.access_token);

            // Điều hướng sang dashboard
            navigate("/admin/dashboard");
        } catch (err) {
            setError(err.detail || "Login failed");
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-800 flex items-center justify-center p-4 sm:p-6 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-3xl p-8 sm:p-10 transform transition-all duration-500 hover:scale-105">

                {/* Header Section */}
                <div className="text-center mb-10 animate-fade-in">
                    <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">
                        Chào mừng trở lại!
                    </h2>
                    <p className="mt-2 text-lg text-gray-600">
                        Đăng nhập vào bảng điều khiển Admin
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 text-red-700 px-5 py-3 rounded-lg border border-red-300 animate-shake-x transition-all duration-300">
                            <span className="font-medium">{error}</span>
                        </div>
                    )}

                    {/* Email Input */}
                    <div className="animate-fade-in-up delay-100">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base transition-all duration-300 ease-in-out hover:border-gray-400"
                            placeholder="Địa chỉ email của bạn"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Password Input */}
                    <div className="animate-fade-in-up delay-200">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                            Mật khẩu
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-5 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base transition-all duration-300 ease-in-out hover:border-gray-400"
                            placeholder="Mật khẩu bí mật"
                            disabled={isLoading}
                        />
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-lg text-lg font-bold text-white transition-all duration-300 ease-in-out transform
                            ${isLoading
                                ? 'bg-indigo-400 cursor-not-allowed'
                                : 'bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-3 focus:ring-offset-2 focus:ring-indigo-500 hover:-translate-y-1 hover:shadow-xl'}`
                        }
                    >
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>
                </form>

                {/* Footer Link */}
                <p className="mt-8 text-center text-sm text-gray-500 animate-fade-in delay-300">
                    Bạn gặp khó khăn khi đăng nhập? {" "}
                    <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200">
                        Liên hệ hỗ trợ
                    </a>
                </p>
            </div>
        </div>
    );
}
