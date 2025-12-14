import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";

export default function HomePageContent() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                👋 Chào mừng bạn quay lại, Admin!
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
                Đây là trang quản trị hệ thống Bản đồ Lịch sử Đà Nẵng.
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card elevation={4}>
                        <CardContent>
                            <Typography variant="h6">🗺️ Tổng số địa điểm</Typography>
                            <Typography variant="h4" sx={{ mt: 1 }}>
                                23
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card elevation={4}>
                        <CardContent>
                            <Typography variant="h6">📚 Sự kiện lịch sử</Typography>
                            <Typography variant="h4" sx={{ mt: 1 }}>
                                12
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card elevation={4}>
                        <CardContent>
                            <Typography variant="h6">🤖 AI Requests (Today)</Typography>
                            <Typography variant="h4" sx={{ mt: 1 }}>
                                56
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
