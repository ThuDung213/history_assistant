import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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

import { Filter, RefreshCcw, Search, Users } from 'lucide-react';

import {
  adminGetUser,
  adminListUserAuditLogs,
  adminListUsers,
  adminLockUser,
  adminUnlockUser,
} from '../../../api/auth/adminApi';

const normalizeItems = (data) => {
  const items = data?.items ?? data?.data?.items ?? data?.results ?? data?.data ?? data ?? [];
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

const getUserId = (u) => String(u?.id ?? u?._id ?? '');

const getUserStatus = (u) => {
  const raw = u?.status ?? u?.state;
  if (raw) return String(raw);

  const blocked = u?.block?.isBlocked ?? u?.blocked ?? u?.isBlocked;
  if (blocked === true) return 'blocked';
  if (blocked === false) return 'active';

  return 'active';
};

const getDisplayName = (u) => u?.full_name ?? u?.fullName ?? u?.name ?? '';

const blurActiveElement = () => {
  try {
    const el = document.activeElement;
    if (el && typeof el.blur === 'function') el.blur();
  } catch {
    // ignore
  }
};

export default function UserManagement() {
  const [status, setStatus] = useState('all'); // all | active | blocked
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailUser, setDetailUser] = useState(null);

  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState('');
  const [auditItems, setAuditItems] = useState([]);

  const [lockOpen, setLockOpen] = useState(false);
  const [lockBusy, setLockBusy] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const [lockUntil, setLockUntil] = useState('');
  const [lockMode, setLockMode] = useState('lock'); // lock | unlock

  const load = async (overrides = {}) => {
    const effectiveStatus = overrides.status ?? status;
    const effectivePage = Number.isFinite(Number(overrides.page)) ? Number(overrides.page) : page;
    const effectiveLimit = Number.isFinite(Number(overrides.limit)) ? Number(overrides.limit) : limit;

    setLoading(true);
    setError('');
    try {
      const params = {
        limit: effectiveLimit,
        offset: effectivePage * effectiveLimit,
      };
      if (effectiveStatus !== 'all') params.status = effectiveStatus;
      if (search.trim()) params.search = search.trim();

      const data = await adminListUsers(params);
      const items = normalizeItems(data);
      const nextTotal = normalizeTotal(data);

      // If current page becomes empty (e.g., after deletes), reset back to the first page.
      if (items.length === 0 && effectivePage > 0) {
        setPage(0);
        return;
      }

      setRows(items);
      setTotal(nextTotal);
    } catch (e) {
      setError(e?.detail || e?.message || 'Không tải được danh sách người dùng.');
      setRows([]);
      setTotal(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, limit]);

  const onSubmitSearch = (e) => {
    e?.preventDefault?.();
    setPage(0);
    load({ page: 0 });
  };

  const openDetail = async (row) => {
    const userId = getUserId(row);
    if (!userId) return;

    blurActiveElement();

    setDetailOpen(true);
    setDetailLoading(true);
    setDetailError('');
    setDetailUser(null);

    setAuditLoading(true);
    setAuditError('');
    setAuditItems([]);

    try {
      const data = await adminGetUser(userId);
      const u = data?.data ?? data;
      setDetailUser(u);
    } catch (e) {
      setDetailError(e?.detail || e?.message || 'Không tải được chi tiết user.');
    } finally {
      setDetailLoading(false);
    }

    try {
      const logs = await adminListUserAuditLogs(userId, { limit: 20 });
      setAuditItems(normalizeItems(logs));
    } catch (e) {
      setAuditError(e?.detail || e?.message || 'Không tải được audit log.');
      setAuditItems([]);
    } finally {
      setAuditLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailLoading(false);
    setDetailError('');
    setDetailUser(null);
    setAuditLoading(false);
    setAuditError('');
    setAuditItems([]);
  };

  const openLockDialog = (mode) => {
    blurActiveElement();
    setLockMode(mode);
    setLockReason('');
    setLockUntil('');
    setLockOpen(true);
  };

  const closeLockDialog = () => {
    if (lockBusy) return;
    setLockOpen(false);
    setLockReason('');
    setLockUntil('');
    setLockMode('lock');
  };

  const refreshUserInList = (userId, patch) => {
    setRows((cur) =>
      (cur || []).map((x) => {
        const id = getUserId(x);
        if (String(id) !== String(userId)) return x;
        return { ...x, ...patch };
      })
    );
  };

  const submitLockUnlock = async () => {
    const u = detailUser;
    const userId = getUserId(u);
    if (!userId) return;

    const reason = lockReason.trim();
    if (!reason) {
      setLockReason('');
      setDetailError('Vui lòng nhập lý do.');
      return;
    }

    setLockBusy(true);
    setDetailError('');

    try {
      if (lockMode === 'lock') {
        const payload = { reason };
        if (lockUntil?.trim()) payload.until = lockUntil.trim();
        await adminLockUser(userId, payload);

        // optimistic update
        const next = {
          status: 'blocked',
          block: {
            ...(u?.block || {}),
            isBlocked: true,
            reason,
            blockedAt: new Date().toISOString(),
          },
        };
        setDetailUser((cur) => (cur ? { ...cur, ...next } : cur));
        refreshUserInList(userId, next);
      } else {
        await adminUnlockUser(userId, { reason });

        const next = {
          status: 'active',
          block: {
            ...(u?.block || {}),
            isBlocked: false,
            reason: '',
            blockedAt: null,
            blockedUntil: null,
          },
        };
        setDetailUser((cur) => (cur ? { ...cur, ...next } : cur));
        refreshUserInList(userId, next);
      }

      // refresh audit logs
      try {
        setAuditLoading(true);
        const logs = await adminListUserAuditLogs(userId, { limit: 20 });
        setAuditItems(normalizeItems(logs));
        setAuditError('');
      } catch (e) {
        setAuditError(e?.detail || e?.message || 'Không tải được audit log.');
      } finally {
        setAuditLoading(false);
      }

      closeLockDialog();
    } catch (e) {
      setDetailError(e?.detail || e?.message || 'Thao tác thất bại.');
    } finally {
      setLockBusy(false);
    }
  };

  const viewRows = useMemo(() => {
    return (rows || []).map((u) => {
      const id = getUserId(u);
      const email = u?.email ?? '';
      const fullName = getDisplayName(u);
      const role = u?.role ?? 'user';
      const createdAt = u?.createdAt ?? u?.created_at ?? null;
      const statusValue = getUserStatus(u);
      const avatarUrl = u?.avatarUrl ?? u?.avatar_url ?? u?.avatar ?? '';

      return { id, email, fullName, role, createdAt, status: statusValue, avatarUrl, raw: u };
    });
  }, [rows]);

  const detailStatus = getUserStatus(detailUser);

  const totalCount = total ?? viewRows.length;

  const pageFrom = totalCount === 0 ? 0 : page * limit + 1;
  const pageTo = page * limit + (viewRows?.length || 0);
  const hasPrev = page > 0;
  const hasNext = total != null ? (page + 1) * limit < total : (viewRows?.length || 0) === limit;

  return (
    <Box>
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <Users className="text-indigo-600" size={32} />
              Quản Lý Người Dùng
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
          <form onSubmit={onSubmitSearch} className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm theo email hoặc họ tên..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <div className="relative">
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
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="blocked">Bị khóa</option>
            </select>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl flex items-center justify-center gap-3 shadow-sm">
            <span className="text-sm font-medium text-indigo-700">Tổng cộng:</span>
            <span className="text-xl font-bold text-indigo-800">{totalCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <TableContainer>
            <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Người dùng</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={18} />
                    <Typography variant="body2">Đang tải...</Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : viewRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary">
                    Không có user.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              viewRows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={r.avatarUrl || undefined} alt={r.fullName || r.email} sx={{ width: 28, height: 28 }} />
                      <Typography variant="body2" fontWeight={700}>
                        {r.fullName || '—'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{r.email || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={String(r.role || 'user')}
                      color={String(r.role) === 'admin' ? 'secondary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={r.status === 'blocked' ? 'Bị khóa' : 'Hoạt động'}
                      color={r.status === 'blocked' ? 'error' : 'success'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatTime(r.createdAt) || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button size="small" onClick={() => openDetail(r.raw)}>
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
            </Table>
          </TableContainer>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-white">
            <div className="text-sm text-slate-600">
              {total != null ? `Hiển thị ${pageFrom}-${pageTo} / ${total}` : `Hiển thị ${pageFrom}-${pageTo}`}
            </div>

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
                onClick={() => {
                  if (!hasPrev) return;
                  setPage((p) => Math.max(0, p - 1));
                }}
                disabled={!hasPrev || loading}
              >
                Trước
              </button>

              <button
                type="button"
                className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                onClick={() => {
                  if (!hasNext) return;
                  setPage((p) => p + 1);
                }}
                disabled={!hasNext || loading}
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Detail */}
      <Dialog open={detailOpen} onClose={closeDetail} maxWidth="md" fullWidth>
        <DialogTitle>Chi tiết người dùng</DialogTitle>
        <DialogContent dividers>
          {detailError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {detailError}
            </Alert>
          )}

          {detailLoading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography>Đang tải chi tiết...</Typography>
            </Stack>
          ) : !detailUser ? (
            <Typography color="text.secondary">Không có dữ liệu.</Typography>
          ) : (
            <Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                <Avatar
                  src={detailUser?.avatarUrl || undefined}
                  alt={getDisplayName(detailUser) || detailUser?.email}
                  sx={{ width: 56, height: 56 }}
                />

                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight={800}>
                    {getDisplayName(detailUser) || '—'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {detailUser?.email || '—'}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={detailStatus === 'blocked' ? 'Bị khóa' : 'Hoạt động'}
                    color={detailStatus === 'blocked' ? 'error' : 'success'}
                    variant="outlined"
                  />
                  <Chip
                    label={String(detailUser?.role || 'user')}
                    color={String(detailUser?.role) === 'admin' ? 'secondary' : 'default'}
                    size="small"
                  />
                </Stack>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    ID
                  </Typography>
                  <Typography variant="body2">{getUserId(detailUser) || '—'}</Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Ngày tạo
                  </Typography>
                  <Typography variant="body2">
                    {formatTime(detailUser?.createdAt ?? detailUser?.created_at) || '—'}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Lần đăng nhập gần nhất
                  </Typography>
                  <Typography variant="body2">{formatTime(detailUser?.lastLoginAt) || '—'}</Typography>
                </Box>
              </Stack>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Thông tin khóa
                </Typography>

                {detailStatus === 'blocked' ? (
                  <Typography variant="body2">
                    Lý do: {detailUser?.block?.reason || detailUser?.blockedReason || '—'}
                    {detailUser?.block?.blockedUntil || detailUser?.blockedUntil ? (
                      <>
                        <br />
                        Đến: {formatTime(detailUser?.block?.blockedUntil || detailUser?.blockedUntil)}
                      </>
                    ) : null}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Không bị khóa.
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
                Audit log
              </Typography>

              {auditError && (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  {auditError}
                </Alert>
              )}

              {auditLoading ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={18} />
                  <Typography>Đang tải log...</Typography>
                </Stack>
              ) : auditItems.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Chưa có log.
                </Typography>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Thời gian</TableCell>
                      <TableCell>Hành động</TableCell>
                      <TableCell>Admin</TableCell>
                      <TableCell>Lý do</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditItems.map((x) => {
                      const id = String(x?.id ?? x?._id ?? Math.random());
                      const at = x?.createdAt ?? x?.created_at ?? x?.time;
                      const action = x?.action ?? x?.type ?? x?.event ?? '';
                      const actor =
                        x?.actorEmail ??
                        x?.actor?.email ??
                        x?.actorId ??
                        x?.adminId ??
                        x?.performedBy ??
                        '';
                      const reason = x?.reason ?? x?.note ?? '';

                      return (
                        <TableRow key={id}>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {formatTime(at) || '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{String(action || '—')}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{String(actor || '—')}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{String(reason || '—')}</Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {detailUser && (
            <>
              {detailStatus === 'blocked' ? (
                <Button color="success" variant="contained" onClick={() => openLockDialog('unlock')}>
                  Mở khóa
                </Button>
              ) : (
                <Button color="error" variant="contained" onClick={() => openLockDialog('lock')}>
                  Khóa
                </Button>
              )}
            </>
          )}
          <Button onClick={closeDetail}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Lock/Unlock */}
      <Dialog open={lockOpen} onClose={closeLockDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{lockMode === 'lock' ? 'Khóa người dùng' : 'Mở khóa người dùng'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Lý do"
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
              multiline
              minRows={3}
              required
            />

            {lockMode === 'lock' && (
              <TextField
                label="Khóa đến (tùy chọn)"
                type="datetime-local"
                value={lockUntil}
                onChange={(e) => setLockUntil(e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText="Nếu bỏ trống: khóa vô thời hạn"
              />
            )}

          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLockDialog} disabled={lockBusy}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color={lockMode === 'lock' ? 'error' : 'success'}
            onClick={submitLockUnlock}
            disabled={lockBusy}
          >
            {lockBusy ? 'Đang xử lý...' : lockMode === 'lock' ? 'Khóa' : 'Mở khóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
