import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

export default function Topbar({ drawerWidth, activeKey }) {
    const navigate = useNavigate();

    const title =
        activeKey === "home"
            ? "Trang chủ"
            : activeKey === "vlog_posts"
                ? "Vlog & Bài viết"
                : activeKey === "post_moderation"
                    ? "Kiểm duyệt bài viết"
                    : activeKey === "post_reports"
                        ? "Báo cáo vi phạm"
                        : "Admin";

    const handleAdminLogout = () => {
        localStorage.removeItem("admin_token");
        navigate("/admin/login", { replace: true });
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                width: `calc(100% - ${drawerWidth}px)`,
                ml: `${drawerWidth}px`,
                bgcolor: "#1976d2",
                zIndex: (theme) => theme.zIndex.drawer + 1,
            }}
        >
            <Toolbar>
                <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
                    Admin Panel | {title}
                </Typography>
                <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleAdminLogout}>
                    Đăng xuất
                </Button>
            </Toolbar>
        </AppBar>
    );
}
