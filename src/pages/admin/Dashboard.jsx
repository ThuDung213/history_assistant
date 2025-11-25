import React, { useState } from "react";
import { Box, CssBaseline, Toolbar } from "@mui/material";



import Grid from "@mui/material/Grid";
import VlogPostEditor from "./sections/VlogPostEditor";
import ChatbotSidebar from "./sections/ChatbotSidebar";
import HomePageContent from "./sections/HomePageContent";
import Topbar from "./sections/AdminTopbar";
import Sidebar from "./sections/AdminSidebar";

const drawerWidth = 240;

export default function AdminDashboard() {
    const [activeNavItem, setActiveNavItem] = useState("home");

    const renderContent = () => {
        switch (activeNavItem) {
            case "vlog_posts":
                return (
                    <Grid container spacing={3} sx={{ height: "100%" }}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <VlogPostEditor />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <ChatbotSidebar />
                        </Grid>
                    </Grid>
                );
            case "home":
            default:
                return <HomePageContent />;
        }
    };

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />

            <Topbar drawerWidth={drawerWidth} activeKey={activeNavItem} />

            <Sidebar
                drawerWidth={drawerWidth}
                activeKey={activeNavItem}
                setActiveKey={setActiveNavItem}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: "#f4f6f8",
                    p: 3,
                    height: "100vh",
                    overflowY: "auto",
                }}
            >
                <Toolbar />
                {renderContent()}
            </Box>
        </Box>
    );
}
