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
  Typography,
} from '@mui/material';

import {
  adminDeleteCommunityPost,
  adminDismissCommunityReportsForPost,
  adminListCommunityReports,
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


const summarizeReasons = (item) => {
  const direct = item?.topReasons ?? item?.top_reasons ?? item?.reasons ?? item?.reasonSummary;
  if (Array.isArray(direct)) return direct.map(String).filter(Boolean);

  const reports = item?.reports;
  if (!Array.isArray(reports)) return [];

  const counts = new Map();
  for (const r of reports) {
    const reason = (r?.reason ?? r?.type ?? '').toString().trim();
    if (!reason) continue;
    counts.set(reason, (counts.get(reason) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k, v]) => `${k} (${v})`);
};

const normalizeActionString = (value) => {
  if (!value) return '';
  return String(value).trim().toLowerCase();
};

const getResolvedActionLabel = (row) => {
  const raw =
    row?.resolvedAction ??
    row?.resolution ??
    row?.action ??
    row?.decision ??
    row?.result ??
    row?.handledAction ??
    row?.status ??
    '';

  const s = normalizeActionString(raw);

  if (
    s === 'approve' ||
    s === 'approved' ||
    s === 'delete' ||
    s === 'deleted' ||
    s === 'remove' ||
    s === 'removed' ||
    s === 'deleted_post'
  ) {
    return 'Duyệt';
  }

  if (
    s === 'reject' ||
    s === 'rejected' ||
    s === 'dismiss' ||
    s === 'dismissed' ||
    s === 'ignore' ||
    s === 'ignored' ||
    s === 'dismiss_report'
  ) {
    return 'Từ chối';
  }

  if (s === 'resolved') return 'Đã xử lý';

  return raw ? String(raw) : 'Đã xử lý';
};

const getResolvedActionColor = (label) => {
  if (label === 'Duyệt') return 'success';
  if (label === 'Từ chối') return 'error';
  return 'default';
};

export default function PostReports() {
  const [status, setStatus] = useState('open'); // open | resolved (depends on BE)
  const [rowsRaw, setRowsRaw] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyById, setBusyById] = useState({});

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [imageViewerUrls, setImageViewerUrls] = useState([]);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectPostId, setRejectPostId] = useState(null);

  const setBusy = (postId, val) => setBusyById((s) => ({ ...s, [postId]: val }));

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminListCommunityReports({ status, limit: 50 });
      setRowsRaw(normalizeItems(data));
    } catch (e) {
      setError(
        e?.detail ||
          e?.message ||
          'Không tải được danh sách báo cáo. (BE cần cung cấp GET /admin/community/reports)'
      );
      setRowsRaw([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const rows = useMemo(() => {
    return (rowsRaw || []).map((x) => {
      const post = x?.post ?? x?.postData ?? x?.item ?? null;

      const postId = x?.postId ?? x?.post_id ?? post?.id ?? post?._id ?? x?.id ?? x?._id;
      const author =
        post?.author ??
        post?.author_name ??
        post?.user?.username ??
        post?.user?.email ??
        x?.author ??
        x?.author_name ??
        'Unknown';
      const createdAt = post?.createdAt ?? post?.created_at ?? x?.createdAt ?? x?.created_at ?? null;
      const content = post?.content ?? post?.text ?? x?.content ?? '';

      const reportCount =
        x?.reportCount ??
        x?.report_count ??
        x?.count ??
        (Array.isArray(x?.reports) ? x.reports.length : 0);

      const lastReportedAt = x?.lastReportedAt ?? x?.last_reported_at ?? x?.updatedAt ?? x?.updated_at ?? null;
      const reasons = summarizeReasons(x);

      const resolvedAction =
        x?.resolvedAction ??
        x?.resolved_action ??
        x?.resolution ??
        x?.action ??
        x?.decision ??
        x?.result ??
        x?.handledAction ??
        x?.handled_action ??
        null;

      return {
        postId,
        author,
        createdAt,
        content,
        post,
        link: post?.link ?? x?.link ?? null,
        images: Array.isArray(post?.images) ? post.images : Array.isArray(x?.images) ? x.images : [],
        reportCount: Number(reportCount) || 0,
        lastReportedAt,
        reasons,
        resolvedAction,
      };
    });
  }, [rowsRaw]);

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

  const removeRow = (postId) => {
    setRowsRaw((cur) => cur.filter((x) => {
      const pid = x?.postId ?? x?.post_id ?? x?.post?.id ?? x?.post?._id ?? x?.id ?? x?._id;
      return String(pid) !== String(postId);
    }));
  };

  const onApprove = async (postId) => {
    setBusy(postId, true);
    try {
      // Requirement: approving a report deletes the post (regardless of age).
      await adminDeleteCommunityPost(postId);
      removeRow(postId);
    } catch (e) {
      setError(e?.detail || e?.message || 'Duyệt bài thất bại.');
    } finally {
      setBusy(postId, false);
    }
  };

  const openReject = (postId) => {
    setRejectPostId(postId);
    setRejectOpen(true);
  };

  const closeReject = () => {
    setRejectOpen(false);
    setRejectPostId(null);
  };

  const submitReject = async () => {
    if (!rejectPostId) return;
    setBusy(rejectPostId, true);
    try {
      // Requirement: rejecting the report should keep the post visible as normal.
      // So we only dismiss/close the report entry, without changing post status.
      await adminDismissCommunityReportsForPost(rejectPostId);
      removeRow(rejectPostId);
      closeReject();
    } catch (e) {
      setError(e?.detail || e?.message || 'Từ chối báo cáo thất bại.');
    } finally {
      setBusy(rejectPostId, false);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={800}>
          Báo cáo vi phạm
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label="Đang mở"
            color={status === 'open' ? 'primary' : 'default'}
            onClick={() => setStatus('open')}
            clickable
          />
          <Chip
            label="Đã xử lý"
            color={status === 'resolved' ? 'primary' : 'default'}
            onClick={() => setStatus('resolved')}
            clickable
          />
          <Button variant="outlined" onClick={load} disabled={loading}>
            Tải lại
          </Button>
        </Stack>
      </Stack>

      <Alert severity="info" sx={{ mb: 2 }}>
        Màn hình này hiển thị các bài bị người dùng báo cáo. Admin có thể <b>Duyệt</b> (xóa bài) hoặc{' '}
        <b>Từ chối</b> (bác báo cáo, giữ bài) trực tiếp.
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
                  <TableCell sx={{ fontWeight: 800 }}>Tạo lúc</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Nội dung</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Số report
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Lý do</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Report mới nhất</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography color="text.secondary">Không có báo cáo.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((r) => (
                    <TableRow
                      key={String(r.postId)}
                      hover
                      onClick={() => openDetail(r)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.author}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTime(r.createdAt)}</TableCell>
                      <TableCell>
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
                        <Typography variant="caption" color="text.secondary">
                          Post ID: {String(r.postId)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip size="small" label={String(r.reportCount)} color={r.reportCount >= 3 ? 'error' : 'default'} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
                          {(r.reasons || []).slice(0, 3).map((f) => (
                            <Chip key={String(f)} size="small" label={String(f)} variant="outlined" />
                          ))}
                          {(r.reasons || []).length > 3 ? (
                            <Chip size="small" label={`+${(r.reasons || []).length - 3}`} variant="outlined" />
                          ) : null}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTime(r.lastReportedAt)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {status === 'open' ? (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onApprove(r.postId);
                                }}
                                disabled={!!busyById[r.postId]}
                              >
                                Duyệt
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReject(r.postId);
                                }}
                                disabled={!!busyById[r.postId]}
                              >
                                Từ chối
                              </Button>
                            </>
                          ) : (
                            <Chip
                              size="small"
                              label={getResolvedActionLabel(r)}
                              variant="outlined"
                              color={getResolvedActionColor(getResolvedActionLabel(r))}
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
                Post ID: {String(detailRow.postId)}
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
                          key={`${String(detailRow.postId)}:${idx}`}
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

              <Box sx={{ mt: 1 }}>
                <Typography fontWeight={800} sx={{ mb: 0.5 }}>
                  Tóm tắt báo cáo
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                  <Chip size="small" label={`Số report: ${String(detailRow.reportCount)}`} />
                  {detailRow.lastReportedAt ? (
                    <Chip size="small" variant="outlined" label={`Mới nhất: ${formatTime(detailRow.lastReportedAt)}`} />
                  ) : null}
                </Stack>
                {Array.isArray(detailRow.reasons) && detailRow.reasons.length > 0 ? (
                  <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap' }}>
                    {detailRow.reasons.map((r) => (
                      <Chip key={String(r)} size="small" label={String(r)} variant="outlined" />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    (Chưa có dữ liệu lý do từ BE)
                  </Typography>
                )}
              </Box>
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

      <Dialog open={rejectOpen} onClose={closeReject} maxWidth="sm" fullWidth>
        <DialogTitle>Xác nhận từ chối báo cáo</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Bạn có chắc muốn <b>từ chối</b> báo cáo này không? Hành động này sẽ gỡ báo cáo khỏi danh sách,
            và <b>bài viết vẫn hiển thị bình thường</b>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeReject}>Huỷ</Button>
          <Button
            onClick={submitReject}
            color="error"
            variant="contained"
            disabled={rejectPostId ? !!busyById[rejectPostId] : true}
          >
            Từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
