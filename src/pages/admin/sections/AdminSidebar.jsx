import React from "react";
import {
    Box,
    Drawer,
    Toolbar,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

const navItems = [
    { name: "Trang chủ", icon: HomeIcon, key: "home" },
    { name: "Vlog & Bài viết", icon: DescriptionIcon, key: "vlog_posts" },
    { name: "Kiểm duyệt bài viết", icon: FactCheckIcon, key: "post_moderation" },
    { name: "Báo cáo vi phạm", icon: ReportProblemIcon, key: "post_reports" },
];

export default function Sidebar({ drawerWidth, activeKey, setActiveKey }) {
    const navigate = useNavigate();

    const handleAdminLogout = () => {
        localStorage.removeItem("admin_token");
        navigate("/admin/login", { replace: true });
    };

    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: drawerWidth,
                    boxSizing: "border-box",
                    bgcolor: "#1f2937",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                },
            }}
            variant="permanent"
            anchor="left"
        >
            <Toolbar sx={{ bgcolor: "#1976d2" }}>DANANG HERITAGE</Toolbar>
            <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />

            <List>
                {navItems.map((item) => (
                    <ListItem key={item.key} disablePadding>
                        <ListItemButton
                            selected={activeKey === item.key}
                            onClick={() => setActiveKey(item.key)}
                            sx={{
                                "&.Mui-selected": {
                                    bgcolor: "#1976d2",
                                    "&:hover": { bgcolor: "#1565c0" },
                                },
                                "&:hover": { bgcolor: "#374151" },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: activeKey === item.key ? "white" : "#9ca3af",
                                }}
                            >
                                <item.icon />
                            </ListItemIcon>
                            <ListItemText
                                primary={item.name}
                                primaryTypographyProps={{
                                    fontWeight: activeKey === item.key ? "bold" : "normal",
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ flexGrow: 1 }} />

            <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
            <List>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={handleAdminLogout}
                        sx={{
                            "&:hover": { bgcolor: "#374151" },
                        }}
                    >
                        <ListItemIcon sx={{ color: "#9ca3af" }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Đăng xuất" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
}
