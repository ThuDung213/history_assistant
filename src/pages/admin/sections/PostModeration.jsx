import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import {
  adminApproveCommunityPost,
  adminListCommunityPosts,
  adminNeedEditCommunityPost,
  adminRejectCommunityPost,
} from '../../../api/auth/adminApi';

const normalizeItems = (data) => {
  const items = data?.items ?? data?.data?.items ?? data?.results ?? data ?? [];
  return Array.isArray(items) ? items : [];
};

const formatTime = (value) => {
  if (!value) return '';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  } catch {
    return String(value);
  }
};

export default function PostModeration() {
  const [status, setStatus] = useState('pending');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyById, setBusyById] = useState({});

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerUrls, setImageViewerUrls] = useState([]);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  const [needEditOpen, setNeedEditOpen] = useState(false);
  const [needEditPostId, setNeedEditPostId] = useState(null);
  const [needEditFeedback, setNeedEditFeedback] = useState('');

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectPostId, setRejectPostId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const setBusy = (postId, val) => setBusyById((s) => ({ ...s, [postId]: val }));

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminListCommunityPosts({ status, limit: 50 });
      setPosts(normalizeItems(data));
    } catch (e) {
      setError(e?.detail || e?.message || 'Không tải được danh sách bài viết.');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const onApprove = async (postId) => {
    setBusy(postId, true);
    try {
      await adminApproveCommunityPost(postId);
      setPosts((cur) => cur.filter((p) => (p?.id ?? p?._id) !== postId));
    } catch (e) {
      setError(e?.detail || e?.message || 'Duyệt bài thất bại.');
    } finally {
      setBusy(postId, false);
    }
  };

  const openNeedEdit = (postId) => {
    setNeedEditPostId(postId);
    setNeedEditFeedback('');
    setNeedEditOpen(true);
  };

  const closeNeedEdit = () => {
    setNeedEditOpen(false);
    setNeedEditPostId(null);
    setNeedEditFeedback('');
  };

  const submitNeedEdit = async () => {
    if (!needEditPostId) return;
    const feedback = needEditFeedback.trim();
    if (!feedback) {
      setError('Vui lòng ghi rõ góp ý cho tác giả (Need Edit).');
      return;
    }

    setBusy(needEditPostId, true);
    try {
      await adminNeedEditCommunityPost(needEditPostId, { feedback });
      setPosts((cur) => cur.filter((p) => (p?.id ?? p?._id) !== needEditPostId));
      closeNeedEdit();
    } catch (e) {
      setError(e?.detail || e?.message || 'Gửi yêu cầu chỉnh sửa thất bại.');
    } finally {
      setBusy(needEditPostId, false);
    }
  };

  const openReject = (postId) => {
    setRejectPostId(postId);
    setRejectReason('');
    setRejectOpen(true);
  };

  const closeReject = () => {
    setRejectOpen(false);
    setRejectPostId(null);
    setRejectReason('');
  };

  const submitReject = async () => {
    if (!rejectPostId) return;
    setBusy(rejectPostId, true);
    try {
      await adminRejectCommunityPost(rejectPostId, rejectReason?.trim() ? { reason: rejectReason.trim() } : {});
      setPosts((cur) => cur.filter((p) => (p?.id ?? p?._id) !== rejectPostId));
      closeReject();
    } catch (e) {
      setError(e?.detail || e?.message || 'Từ chối bài thất bại.');
    } finally {
      setBusy(rejectPostId, false);
    }
  };

  const openDetail = (row) => {
    setDetailRow(row || null);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailRow(null);
  };

  const openImageViewer = (urls, startIndex = 0) => {
    const safe = (Array.isArray(urls) ? urls : []).map(String).filter(Boolean);
    if (safe.length === 0) return;
    const idx = Math.max(0, Math.min(Number(startIndex) || 0, safe.length - 1));
    setImageViewerUrls(safe);
    setImageViewerIndex(idx);
    setImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setImageViewerOpen(false);
    setImageViewerUrls([]);
    setImageViewerIndex(0);
  };

  const goPrevImage = () => {
    setImageViewerIndex((i) => (i <= 0 ? 0 : i - 1));
  };

  const goNextImage = () => {
    setImageViewerIndex((i) => {
      const max = (imageViewerUrls || []).length - 1;
      if (max < 0) return 0;
      return i >= max ? max : i + 1;
    });
  };

  const rows = useMemo(() => {
    return (posts || []).map((p) => {
      const id = p?.id ?? p?._id;
      const author = p?.author ?? p?.author_name ?? p?.user?.username ?? p?.user?.email ?? 'Unknown';
      const createdAt = p?.createdAt ?? p?.created_at ?? p?.created ?? p?.timestamp;
      const content = p?.content ?? p?.text ?? '';
      const images = Array.isArray(p?.images) ? p.images : [];
      const link = p?.link ?? null;
      const postStatus = p?.status ?? status;
      const flags = Array.isArray(p?.flags)
        ? p.flags
        : Array.isArray(p?.tags)
          ? p.tags
          : Array.isArray(p?.auto_flags)
            ? p.auto_flags
            : [];
      const moderationNote =
        p?.moderationFeedback ?? p?.moderation_feedback ?? p?.feedback ?? p?.note ?? p?.moderationNote ?? '';
      return {
        id,
        author,
        createdAt,
        content,
        images,
        imagesCount: images.length,
        link,
        status: postStatus,
        flags,
        moderationNote,
      };
    });
  }, [posts, status]);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>
          Kiểm duyệt bài viết
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label="Chờ duyệt"
            color={status === 'pending' ? 'primary' : 'default'}
            onClick={() => setStatus('pending')}
            clickable
          />
          <Chip
            label="Cần chỉnh sửa"
            color={status === 'need_edit' ? 'primary' : 'default'}
            onClick={() => setStatus('need_edit')}
            clickable
          />
          <Chip
            label="Đã duyệt"
            color={status === 'approved' ? 'primary' : 'default'}
            onClick={() => setStatus('approved')}
            clickable
          />
          <Chip
            label="Từ chối"
            color={status === 'rejected' ? 'primary' : 'default'}
            onClick={() => setStatus('rejected')}
            clickable
          />
          <Button variant="outlined" onClick={load} disabled={loading}>
            Tải lại
          </Button>
        </Stack>
      </Stack>

      <Alert severity="info" sx={{ mb: 2 }}>
        Ưu tiên <b>Need Edit</b> (góp ý chỉnh sửa) thay vì từ chối thẳng. Các bài thuộc chủ đề nhạy cảm
        (ví dụ: thời kỳ Pháp thuộc, chiến tranh, nhân vật gây tranh cãi…) sẽ được gắn cờ để kiểm duyệt kỹ.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Tác giả</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Thời gian</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Nội dung</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Cờ</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Ảnh
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="text.secondary">Không có bài viết.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow
                      key={String(r.id)}
                      hover
                      onClick={() => openDetail(r)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.author}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTime(r.createdAt)}</TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography
                            variant="body2"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {r.content}
                          </Typography>
                          {r.link && (
                            <Typography variant="caption" color="primary">
                              {r.link}
                            </Typography>
                          )}
                          {status === 'need_edit' && r.moderationNote ? (
                            <Typography variant="caption" color="text.secondary">
                              Góp ý: {r.moderationNote}
                            </Typography>
                          ) : null}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                          {(r.flags || []).slice(0, 3).map((f) => (
                            <Chip key={String(f)} size="small" label={String(f)} variant="outlined" />
                          ))}
                          {(r.flags || []).length > 3 ? (
                            <Chip size="small" label={`+${(r.flags || []).length - 3}`} variant="outlined" />
                          ) : null}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">{r.imagesCount}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {status === 'pending' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onApprove(r.id);
                                }}
                                disabled={!!busyById[r.id]}
                              >
                                Duyệt
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openNeedEdit(r.id);
                                }}
                                disabled={!!busyById[r.id]}
                              >
                                Need Edit
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReject(r.id);
                                }}
                                disabled={!!busyById[r.id]}
                              >
                                Từ chối
                              </Button>
                            </>
                          )}

                          {status !== 'pending' && (
                            <Chip
                              size="small"
                              label={String(r.status || status)}
                              variant="outlined"
                              color={
                                status === 'approved'
                                  ? 'success'
                                  : status === 'rejected'
                                    ? 'error'
                                    : status === 'need_edit'
                                      ? 'warning'
                                      : 'default'
                              }
                            />
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={detailOpen} onClose={closeDetail} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết bài viết</DialogTitle>
        <DialogContent>
          {detailRow ? (
            <Stack spacing={1.25}>
              <Typography variant="body2" color="text.secondary">
                Post ID: {String(detailRow.id)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tác giả: {detailRow.author}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tạo lúc: {formatTime(detailRow.createdAt)}
              </Typography>

              <Box sx={{ mt: 1 }}>
                <Typography fontWeight={800} sx={{ mb: 0.5 }}>
                  Nội dung
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {detailRow.content || '(Không có nội dung)'}
                </Typography>
              </Box>

              {detailRow.link ? (
                <Box>
                  <Typography fontWeight={800} sx={{ mb: 0.5 }}>
                    Link
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ wordBreak: 'break-all' }}>
                    {String(detailRow.link)}
                  </Typography>
                </Box>
              ) : null}

              {Array.isArray(detailRow.images) && detailRow.images.length > 0 ? (
                <Box>
                  <Typography fontWeight={800} sx={{ mb: 0.5 }}>
                    Ảnh ({detailRow.images.length})
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    {detailRow.images.slice(0, 6).map((img, idx) => {
                      const url = img?.url ?? img?.secure_url ?? img?.src ?? img;
                      if (!url) return null;

                      const allUrls = (detailRow.images || [])
                        .map((x) => x?.url ?? x?.secure_url ?? x?.src ?? x)
                        .filter(Boolean);

                      return (
                        <Box
                          key={`${String(detailRow.id)}:${idx}`}
                          component="img"
                          src={String(url)}
                          alt=""
                          onClick={() => openImageViewer(allUrls, idx)}
                          sx={{
                            width: 96,
                            height: 64,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '1px solid rgba(0,0,0,0.12)',
                            cursor: 'pointer',
                          }}
                        />
                      );
                    })}
                    {detailRow.images.length > 6 ? (
                      <Chip size="small" label={`+${detailRow.images.length - 6}`} variant="outlined" />
                    ) : null}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                    Bấm vào ảnh để xem lớn.
                  </Typography>
                </Box>
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetail}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={imageViewerOpen} onClose={closeImageViewer} maxWidth="lg" fullWidth>
        <DialogTitle>
          Xem ảnh ({imageViewerUrls.length > 0 ? imageViewerIndex + 1 : 0}/{imageViewerUrls.length})
        </DialogTitle>
        <DialogContent>
          {imageViewerUrls.length > 0 ? (
            <Box
              component="img"
              src={imageViewerUrls[imageViewerIndex]}
              alt=""
              sx={{
                width: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: 1,
                border: '1px solid rgba(0,0,0,0.12)',
              }}
            />
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={goPrevImage} disabled={imageViewerIndex <= 0}>
            Trước
          </Button>
          <Button onClick={goNextImage} disabled={imageViewerIndex >= imageViewerUrls.length - 1}>
            Sau
          </Button>
          <Button onClick={closeImageViewer}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={needEditOpen} onClose={closeNeedEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Yêu cầu chỉnh sửa (Need Edit)</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Góp ý cụ thể cho tác giả"
            fullWidth
            multiline
            minRows={3}
            value={needEditFeedback}
            onChange={(e) => setNeedEditFeedback(e.target.value)}
            placeholder="Ví dụ: Vui lòng bổ sung nguồn tư liệu, làm rõ mốc thời gian, và điều chỉnh ngôn từ trung lập hơn…"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeNeedEdit}>Huỷ</Button>
          <Button
            onClick={submitNeedEdit}
            variant="contained"
            disabled={needEditPostId ? !!busyById[needEditPostId] : true}
          >
            Gửi góp ý
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectOpen} onClose={closeReject} maxWidth="sm" fullWidth>
        <DialogTitle>Từ chối bài viết</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Lý do (tuỳ chọn)"
            fullWidth
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Gợi ý: ghi rõ điều khoản vi phạm (xuyên tạc, kích động, công kích…)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReject}>Huỷ</Button>
          <Button
            onClick={submitReject}
            color="error"
            variant="contained"
            disabled={rejectPostId ? !!busyById[rejectPostId] : true}
          >
            Xác nhận từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
