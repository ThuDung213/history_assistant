import React from "react";
import {
    Box, Typography, TextField, Button, Grid,
    FormControl, InputLabel, Select, MenuItem,
    FormControlLabel, Checkbox, Card, CardContent
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

// Placeholder cho cấu trúc dữ liệu cơ bản (chỉ để hiển thị, không có tính năng reactivity)
const initialVlogPost = {
    title: "Chủ đề thú vị mới",
    content: "Hôm nay, tôi muốn chia sẻ về trải nghiệm tuyệt vời của mình khi khám phá một địa điểm mới...",
    category: "doi-song",
    thumbnailUrl: "https://placehold.co/400x200/4F46E5/ffffff?text=Video+Thumbnail",
    isDraft: true,
};


/**
 * --- COMPONENT (CHỈ CÓ UI) ---
 * Tất cả hooks, logic xử lý sự kiện và props đã được loại bỏ.
 */
export default function VlogPostEditor() {

    // Sử dụng biến tĩnh để hiển thị dữ liệu ban đầu
    const post = initialVlogPost;

    return (
        <Box sx={{ p: 4, bgcolor: "white", borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                Soạn nội dung / Vlog mới
            </Typography>

            <form>
                <Grid container spacing={3}>
                    {/* Tiêu đề + AI Button */}
                    <Grid size={12}>
                        <Typography sx={{ mb: 1 }}>Tiêu đề</Typography>

                        <Box sx={{ display: "flex", gap: 1 }}>
                            <TextField
                                fullWidth
                                name="title"
                                defaultValue={post.title} // Sử dụng defaultValue cho hiển thị tĩnh
                                placeholder="Nhập tiêu đề..."
                            />

                            <Button
                                variant="contained"
                                color="secondary"
                                startIcon={<StarIcon />}
                                disabled={false} // Luôn bật
                            >
                                AI tạo tiêu đề
                            </Button>
                        </Box>
                    </Grid>

                    {/* Nội dung */}
                    <Grid size={12}>
                        <Typography sx={{ mb: 1 }}>Nội dung</Typography>
                        <TextField
                            fullWidth
                            multiline
                            rows={10}
                            name="content"
                            defaultValue={post.content} // Sử dụng defaultValue cho hiển thị tĩnh
                            placeholder="Nhập nội dung vlog/bài viết..."
                        />
                    </Grid>

                    {/* Thumbnail */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography sx={{ mb: 1 }}>Thumbnail URL</Typography>
                        <TextField
                            fullWidth
                            name="thumbnailUrl"
                            defaultValue={post.thumbnailUrl} // Sử dụng defaultValue cho hiển thị tĩnh
                            placeholder="https://example.com/thumbnail.jpg"
                        />

                        {post.thumbnailUrl && (
                            <Box
                                component="img"
                                src={post.thumbnailUrl}
                                sx={{
                                    mt: 2,
                                    width: "100%",
                                    height: "auto",
                                    borderRadius: 2,
                                    objectFit: 'cover',
                                }}
                            // Loại bỏ onError
                            />
                        )}
                    </Grid>

                    {/* Category + Draft */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl fullWidth>
                            <InputLabel id="category-label">Danh mục</InputLabel>
                            <Select
                                labelId="category-label"
                                name="category"
                                defaultValue={post.category} // Sử dụng defaultValue cho hiển thị tĩnh
                                label="Danh mục"
                            >
                                <MenuItem value="cong-nghe">Công nghệ</MenuItem>
                                <MenuItem value="du-lich">Du lịch</MenuItem>
                                <MenuItem value="am-thuc">Ẩm thực</MenuItem>
                                <MenuItem value="doi-song">Đời sống</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControlLabel
                            sx={{ mt: 2 }}
                            control={
                                <Checkbox
                                    name="isDraft"
                                    defaultChecked={post.isDraft} // Sử dụng defaultChecked cho hiển thị tĩnh
                                />
                            }
                            label="Lưu bản nháp"
                        />

                        <Card variant="outlined" sx={{ mt: 3, p: 2 }}>
                            <CardContent sx={{ p: 0 }}>
                                <Typography variant="caption" color="text.secondary">
                                    Mẹo AI
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    Nhập ít nhất 50 ký tự nội dung trước khi bấm "AI tạo tiêu đề" để nhận gợi ý tốt nhất từ Gemini.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Submit */}
                    <Grid size={12}>
                        <Button
                            variant="contained"
                            type="submit"
                            size="large"
                            sx={{ bgcolor: '#FF6600', '&:hover': { bgcolor: '#E65C00' } }}
                        >
                            Lưu bài đăng
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
}