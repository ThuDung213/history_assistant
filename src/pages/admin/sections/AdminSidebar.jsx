import React from "react";
import {
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

const navItems = [
    { name: "Trang chủ", icon: HomeIcon, key: "home" },
    { name: "Vlog & Bài viết", icon: DescriptionIcon, key: "vlog_posts" },
];

export default function Sidebar({ drawerWidth, activeKey, setActiveKey }) {
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
        </Drawer>
    );
}
