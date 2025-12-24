import { Bell, Menu, Search, UserCircle } from "lucide-react";

export default function Topbar({ onToggleSidebar }) {
    return (
        <header className="flex-shrink-0 h-16 bg-white shadow-md border-b border-gray-200 sticky top-0 z-10 flex items-center justify-between px-6">
            {/* Thanh Tìm kiếm */}
            <div className="relative flex items-center w-full max-w-lg hidden md:flex">
                <Search className="absolute left-3 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="w-full py-2 pl-10 pr-4 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-sm"
                />
            </div>

            {/* Nút Menu Mobile (chỉ hiện trên mobile) */}
            <button
                onClick={onToggleSidebar}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 md:hidden transition duration-150"
                aria-label="Mở Menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Các biểu tượng bên phải */}
            <div className="flex items-center space-x-4">
                {/* Thông báo */}
                <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 relative transition duration-150">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
                </button>

                {/* Hồ sơ Người dùng */}
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition duration-150">
                    <UserCircle className="w-8 h-8 text-indigo-500" />
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">Xin chào, Admin</span>
                </div>
            </div>
        </header>
    );
}
