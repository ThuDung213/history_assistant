import React from "react";
import {
    Box, Card, CardContent, Typography, List, ListItem,
    CircularProgress, TextField, Button
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import BookIcon from "@mui/icons-material/Book";

// Dữ liệu giả lập tĩnh để hiển thị giao diện người dùng
const placeholderHistory = [
    {
        type: "user",
        text: "Bạn có thể tóm tắt lịch sử phát triển của React và các tính năng chính của nó không?",
        sources: [],
    },
    {
        type: "ai",
        text: "React, một thư viện JavaScript để xây dựng giao diện người dùng, được Facebook ra mắt lần đầu vào năm 2013. Nó nổi tiếng với việc sử dụng Virtual DOM (V-DOM) để tối ưu hóa hiệu suất và mô hình component-based (dựa trên các thành phần) cho phép tái sử dụng code cao.",
        sources: [
            { title: "React Official Documentation", uri: "https://react.dev" },
            { title: "The History of ReactJS", uri: "https://example.com/history" },
        ],
    },
];

/**
 * --- COMPONENT (CHỈ CÓ UI) ---
 * Tất cả props, hooks, và logic đã được loại bỏ.
 * Sử dụng dữ liệu tĩnh để mô phỏng lịch sử trò chuyện và trạng thái tải.
 */
export default function ChatbotSidebar() {
    return (
        <Card
            elevation={5}
            sx={{
                height: "calc(100vh - 120px)",
                display: "flex",
                flexDirection: "column",
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "#f7f9fc",
            }}
        >
            <CardContent
                sx={{
                    bgcolor: "#1976d2",
                    color: "white",
                    py: 1.5,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <SearchIcon sx={{ mr: 1 }} />
                <Typography variant="h6">AI Websearch Assistant</Typography>
            </CardContent>

            {/* CHAT HISTORY (Sử dụng dữ liệu giả lập) */}
            <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
                {placeholderHistory.map((msg, idx) => (
                    <Box
                        key={idx}
                        sx={{
                            display: "flex",
                            justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
                            mb: 1,
                        }}
                    >
                        <Box
                            sx={{
                                maxWidth: "90%",
                                p: 1.5,
                                borderRadius: 3,
                                bgcolor: msg.type === "user" ? "#1976d2" : "white",
                                color: msg.type === "user" ? "white" : "black",
                            }}
                        >
                            <Typography
                                sx={{ whiteSpace: "pre-wrap" }}
                                // Hardcoding innerHTML for illustration purposes only
                                dangerouslySetInnerHTML={{
                                    __html: msg.text.replace(/\n/g, "<br/>"),
                                }}
                            />

                            {/* citations */}
                            {msg.sources.length > 0 && (
                                <Box sx={{ mt: 1 }}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            fontWeight: 600,
                                            mb: 0.5,
                                        }}
                                    >
                                        <BookIcon fontSize="small" sx={{ mr: 0.5 }} /> Nguồn:
                                    </Typography>

                                    <List dense>
                                        {msg.sources.map((s, i) => (
                                            <ListItem key={i} sx={{ p: 0 }}>
                                                <a
                                                    href={s.uri}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ fontSize: 12, color: "#1976d2" }}
                                                >
                                                    {s.title}
                                                </a>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}
                        </Box>
                    </Box>
                ))}

                {/* Giả lập trạng thái tải */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={16} />
                    <Typography>Đang xử lý...</Typography>
                </Box>

                {/* Loại bỏ div ref */}
            </Box>

            {/* INPUT (Loại bỏ onSubmit) */}
            <Box
                component="div" // Thay thế component="form"
                sx={{
                    p: 2,
                    borderTop: "1px solid #ddd",
                    bgcolor: "white",
                }}
            >
                <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                        fullWidth
                        size="small"
                        defaultValue="Câu hỏi giả lập..." // Dữ liệu tĩnh
                        placeholder="Hỏi AI..."
                        disabled={false} // Luôn bật hoặc tắt để minh họa
                    />

                    <Button
                        type="button" // Thay thế type="submit"
                        variant="contained"
                        disabled={false} // Luôn bật hoặc tắt để minh họa
                        sx={{ borderRadius: "50%" }}
                    >
                        <SendIcon />
                    </Button>
                </Box>
            </Box>
        </Card>
    );
}