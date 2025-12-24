import React from "react";
import Sidebar from "./sections/AdminSidebar";
import Topbar from "./sections/AdminTopbar";
import { Outlet } from "react-router-dom";

export default function AdminDashboard() {
    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-grow">
                <Topbar />
                <div className="p-6 overflow-y-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
