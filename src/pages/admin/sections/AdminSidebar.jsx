import React, { useCallback, useEffect, useState } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import {
    LayoutDashboard,
    FolderOpen,
    Settings,
    LogOut,
    Gem,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

// ====== MENU CONFIG (DÙNG URL, KHÔNG DÙNG KEY) ======
const navItems = [
    {
        name: "Thống kê",
        icon: LayoutDashboard,
        to: "/admin",
    },
    {
        name: "Quản lý địa điểm",
        icon: FolderOpen,
        to: "/admin/locations",
    },
];

const bottomItems = [
    {
        name: "Cài đặt",
        icon: Settings,
        to: "/admin/settings",
    },
    {
        name: "Đăng xuất",
        icon: LogOut,
        to: "/logout",
        className: "text-red-500",
    },
];

// ====== NAV ITEM COMPONENT ======
const NavItem = ({ item, isCollapsed }) => {
    const IconComponent = item.icon;

    return (
        <RouterNavLink
            to={item.to}
            end
            className={({ isActive }) =>
                `
        flex items-center p-3 rounded-lg transition-all w-full
        ${item.className || ""}
        ${isActive
                    ? "bg-indigo-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                }
      `
            }
        >
            <IconComponent className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">{item.name}</span>}
        </RouterNavLink>
    );
};

// ====== SIDEBAR ======
export default function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Tự động thu gọn trên desktop
    useEffect(() => {
        if (window.innerWidth >= 768) {
            setIsCollapsed(true);
        }
    }, []);

    // Toggle sidebar
    const toggleSidebar = useCallback(() => {
        setIsCollapsed((prev) => !prev);
    }, []);

    // Responsive
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsCollapsed(false);
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const sidebarWidth = isCollapsed ? "w-20" : "w-64";
    const ToggleIcon = isCollapsed ? ChevronRight : ChevronLeft;

    return (
        <aside
            className={`bg-white shadow-2xl ${sidebarWidth} p-4 flex flex-col transition-all duration-300 ease-in-out`}
            aria-expanded={!isCollapsed}
        >
            {/* ===== LOGO ===== */}
            <div
                className={`flex items-center h-14 mb-8 ${isCollapsed ? "justify-center" : "justify-between"
                    }`}
            >
                {!isCollapsed && (
                    <div className="flex items-center overflow-hidden">
                        <Gem className="w-7 h-7 text-indigo-600 flex-shrink-0" />
                        <h1 className="text-xl font-extrabold text-gray-800 ml-2 whitespace-nowrap">
                            Ứng dụng React
                        </h1>
                    </div>
                )}

                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition hidden md:block"
                    aria-label={isCollapsed ? "Mở rộng Sidebar" : "Thu gọn Sidebar"}
                >
                    <ToggleIcon className="w-5 h-5" />
                </button>
            </div>

            {/* ===== MAIN NAV ===== */}
            <nav className="space-y-3 flex-grow">
                {navItems.map((item) => (
                    <NavItem key={item.to} item={item} isCollapsed={isCollapsed} />
                ))}
            </nav>

            {/* ===== BOTTOM NAV ===== */}
            <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
                {bottomItems.map((item) => (
                    <NavItem key={item.to} item={item} isCollapsed={isCollapsed} />
                ))}
            </div>
        </aside>
    );
}
