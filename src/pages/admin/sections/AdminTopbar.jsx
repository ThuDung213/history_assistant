import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Topbar({ drawerWidth, activeKey }) {
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
                    Admin Panel | {activeKey === "home" ? "Trang chủ" : "Vlog & Bài viết"}
                </Typography>
                <Button color="inherit" startIcon={<LogoutIcon />}>
                    Đăng xuất
                </Button>
            </Toolbar>
        </AppBar>
    );
}
