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
  Typography,
} from '@mui/material';

import { Filter, Flag, RefreshCcw, Search, Users } from 'lucide-react';

import {
  adminDeleteCommunityPost,
  adminDismissCommunityReportsForPost,
  adminListCommunityReports,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsRaw, setRowsRaw] = useState([]);
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

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectPostId, setRejectPostId] = useState(null);

  const setBusy = (postId, val) => setBusyById((s) => ({ ...s, [postId]: val }));

  const load = async (overrides = {}) => {
    const effectiveStatus = overrides.status ?? status;
    const effectivePage = Number.isFinite(Number(overrides.page)) ? Number(overrides.page) : page;
    const effectiveLimit = Number.isFinite(Number(overrides.limit)) ? Number(overrides.limit) : limit;

    setLoading(true);
    setError('');
    try {
      const data = await adminListCommunityReports({
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

      setRowsRaw(items);
      setTotal(nextTotal);
      if (nextTotal != null) {
        setHasNext(effectivePage * effectiveLimit + items.length < nextTotal);
      } else {
        setHasNext(items.length === effectiveLimit);
      }
    } catch (e) {
      setError(
        e?.detail ||
          e?.message ||
          'Không tải được danh sách báo cáo. (BE cần cung cấp GET /admin/community/reports)'
      );
      setRowsRaw([]);
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

  const filteredRows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return rows;

    return (rows || []).filter((r) => {
      const hay = [
        r?.author,
        r?.content,
        r?.link,
        Array.isArray(r?.reasons) ? r.reasons.join(' ') : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, searchTerm]);

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
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Flag className="text-indigo-600" size={32} />
              Báo Cáo Vi Phạm
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
              placeholder="Tìm theo tác giả / nội dung / lý do..."
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
              <option value="open">Đang mở</option>
              <option value="resolved">Đã xử lý</option>
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
                {filteredRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography color="text.secondary">Không có báo cáo.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRows.map((r) => (
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
