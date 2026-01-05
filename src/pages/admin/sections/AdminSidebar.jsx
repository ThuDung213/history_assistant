import React, { useCallback, useEffect, useState } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldCheck,
  Flag,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  Image,
  Gem,
  MapPinHouse,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Place the provided branding image at: public/branding/vietnam-dongson.jpg
// It will be served at runtime as: /branding/vietnam-dongson.jpg
const BRAND_LOGO_SRC = "/branding/vietnam-dongson.jpg";

const FallbackHistoryVietnamLogo = ({ className = "" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Logo lịch sử Việt Nam"
    >
      {/* Dong Son drum-inspired background (stylized) */}
      <circle
        cx="32"
        cy="32"
        r="30"
        stroke="currentColor"
        strokeOpacity="0.22"
        strokeWidth="2"
      />
      <circle
        cx="32"
        cy="32"
        r="22"
        stroke="currentColor"
        strokeOpacity="0.16"
        strokeWidth="2"
      />
      <circle
        cx="32"
        cy="32"
        r="14"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="2"
      />

      {/* Radial marks */}
      <g
        stroke="currentColor"
        strokeOpacity="0.18"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M32 6v6" />
        <path d="M32 52v6" />
        <path d="M6 32h6" />
        <path d="M52 32h6" />
        <path d="M14 14l4 4" />
        <path d="M46 46l4 4" />
        <path d="M50 14l-4 4" />
        <path d="M18 46l-4 4" />
      </g>

      {/* Vietnam silhouette (fallback, simplified) */}
      <path
        d="M38 8 C34 9,33 12,31 14 C29 16,28 18,29 20 C30 22,29 24,27 26 C25 28,24 30,25 32
                   C26 34,25 36,23 38 C21 40,20 42,21 44 C22 46,21 49,19 51 C17 53,17 56,19 58
                   C22 61,27 59,30 58 C32 57,34 56,35 54 C36 52,35 50,36 48 C37 46,39 44,40 42
                   C41 40,40 38,41 36 C42 34,44 32,44 30 C44 28,42 26,42 24 C42 22,44 20,43 18
                   C42 15,41 12,40 10 C39 9,39 8.5,38 8 Z"
        fill="currentColor"
        fillOpacity="0.88"
      />
    </svg>
  );
};

// ====== MENU CONFIG (DÙNG URL, KHÔNG DÙNG KEY) ======
const navItems = [
  {
    name: "Thống kê",
    icon: LayoutDashboard,
    to: "/admin/dashboard",
  },
  {
    name: "Quản lý người dùng",
    icon: Users,
    to: "/admin/users",
  },
  {
    name: "Quản lý địa điểm",
    icon: MapPinHouse,
    to: "/admin/locations",
  },
  {
    name: "Quản lý Gallery",
    icon: Image,
    to: "/admin/gallery",
  },
  {
    name: "Kiểm duyệt bài viết",
    icon: ShieldCheck,
    to: "/admin/posts/moderation",
  },
  {
    name: "Báo cáo vi phạm",
    icon: Flag,
    to: "/admin/posts/reports",
  },
];

const bottomItems = [
  {
    name: "Cài đặt",
    icon: Settings,
    to: "/admin/settings",
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
        ${
          isActive
            ? "bg-indigo-500 text-white shadow-md"
            : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
        }
      `
      }
    >
      <IconComponent className="w-5 h-5 shrink-0" />
      {!isCollapsed && <span className="ml-3">{item.name}</span>}
    </RouterNavLink>
  );
};

// ====== SIDEBAR ======
export default function Sidebar() {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [brandLogoOk, setBrandLogoOk] = useState(true);

  const handleAdminLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login", { replace: true });
  };

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
        className={`flex items-center h-14 mb-8 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div className="flex items-center overflow-hidden">
          {brandLogoOk ? (
            <img
              src={BRAND_LOGO_SRC}
              alt="Logo bản đồ Việt Nam và trống đồng"
              className="w-10 h-10 shrink-0 rounded-lg object-cover"
              onError={() => setBrandLogoOk(false)}
            />
          ) : (
            <FallbackHistoryVietnamLogo className="w-9 h-9 text-indigo-600 shrink-0" />
          )}
          {!isCollapsed && (
            <h1 className="text-xl font-extrabold text-gray-800 ml-2 whitespace-nowrap">
              Dashboard
            </h1>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition hidden md:block"
          aria-label={isCollapsed ? "Mở rộng Sidebar" : "Thu gọn Sidebar"}
        >
          <ToggleIcon className="w-5 h-5" />
        </button>
      </div>

      {/* ===== MAIN NAV ===== */}
      <nav className="space-y-3 grow">
        {navItems.map((item) => (
          <NavItem key={item.to} item={item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      {/* ===== BOTTOM NAV ===== */}
      <div className="mt-auto pt-4 border-t border-gray-100 space-y-3">
        {bottomItems.map((item) => (
          <NavItem key={item.to} item={item} isCollapsed={isCollapsed} />
        ))}

        <button
          type="button"
          onClick={handleAdminLogout}
          className={`flex items-center p-3 rounded-lg transition-all w-full text-red-500 hover:bg-red-50`}
          aria-label="Đăng xuất"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="ml-3">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
}
