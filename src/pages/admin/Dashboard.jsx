import React, { useState } from "react";
import VlogPostEditor from "./posts/VlogPostEditor";
import HomePageContent from "./sections/HomePageContent";
import Sidebar from "./sections/AdminSidebar";
import Topbar from "./sections/AdminTopbar";
import { Bot } from "lucide-react";
import Chatbot from "./sections/ChatbotSidebar";
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
