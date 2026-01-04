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

import { Filter, RefreshCcw, Search, Shield, Users } from 'lucide-react';

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

const normalizeTotal = (data) => {
  const total = data?.total ?? data?.data?.total ?? data?.count ?? data?.totalCount;
  return Number.isFinite(Number(total)) ? Number(total) : null;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [busyById, setBusyById] = useState({});

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(null);

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

  const load = async (overrides = {}) => {
    const effectiveStatus = overrides.status ?? status;
    const effectivePage = Number.isFinite(Number(overrides.page)) ? Number(overrides.page) : page;
    const effectiveLimit = Number.isFinite(Number(overrides.limit)) ? Number(overrides.limit) : limit;

    setLoading(true);
    setError('');
    try {
      const data = await adminListCommunityPosts({
        status: effectiveStatus,
        limit: effectiveLimit,
        offset: effectivePage * effectiveLimit,
      });
      const items = normalizeItems(data);
      const nextTotal = normalizeTotal(data);

      if (items.length === 0 && effectivePage > 0) {
        setPage(0);
        return;
      }

      setPosts(items);
      setTotal(nextTotal);
      if (nextTotal != null) {
        setHasNext(effectivePage * effectiveLimit + items.length < nextTotal);
      } else {
        setHasNext(items.length === effectiveLimit);
      }
    } catch (e) {
      setError(e?.detail || e?.message || 'Không tải được danh sách bài viết.');
      setPosts([]);
      setHasNext(false);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, limit]);

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

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;

    return (rows || []).filter((r) => {
      const hay = [
        r?.author,
        r?.content,
        r?.link,
        Array.isArray(r?.flags) ? r.flags.join(' ') : '',
        r?.moderationNote,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, searchTerm]);

  return (
    <Box>
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Shield className="text-indigo-600" size={32} />
              Kiểm Duyệt Bài Viết
            </h1>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <RefreshCcw size={18} />
            Làm mới
          </button>
        </header>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm theo tác giả / nội dung / cờ..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="md:col-span-1 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm cursor-pointer"
              value={status}
              onChange={(e) => {
                const next = e.target.value;
                setStatus(next);
                setPage(0);
                load({ status: next, page: 0 });
              }}
            >
              <option value="pending">Chờ duyệt</option>
              <option value="need_edit">Cần chỉnh sửa</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl flex items-center justify-center gap-3 shadow-sm">
            <Users className="text-indigo-600" size={18} />
            <span className="text-sm font-medium text-indigo-700">Tổng:</span>
            <span className="text-xl font-bold text-indigo-800">{total ?? filteredRows.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="text.secondary">Không có bài viết.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((r) => (
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-white">
            <div className="text-sm text-slate-600">Trang {page + 1}</div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Mỗi trang</span>
              <select
                className="pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg appearance-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm cursor-pointer"
                value={String(limit)}
                onChange={(e) => {
                  const next = Number(e.target.value) || 20;
                  setLimit(next);
                  setPage(0);
                  load({ limit: next, page: 0 });
                }}
                disabled={loading}
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>

              <button
                type="button"
                className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || loading}
              >
                Trước
              </button>

              <button
                type="button"
                className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext || loading}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>

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
