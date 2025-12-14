export function getCurrentUser(storage = window.localStorage) {
  try {
    const token = storage.getItem('token') || storage.getItem('access_token') || storage.getItem('ha_token');
    let tokenUserId = null;
    if (token && typeof token === 'string') {
      const parts = token.split('.');
      if (parts.length >= 2) {
        try {
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const pad = base64.length % 4;
          const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
          const binary = atob(padded);
          const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
          const json = new TextDecoder().decode(bytes);
          const payload = JSON.parse(json);
          const candidates = [payload?.user_id, payload?.userId, payload?.uid, payload?.id, payload?._id, payload?.sub];
          for (const v of candidates) {
            if (typeof v === 'number') {
              tokenUserId = v;
              break;
            }
            if (typeof v === 'string') {
              const s = v.trim();
              if (!s || s.includes('@')) continue;
              tokenUserId = s;
              break;
            }
          }
        } catch {
          // ignore
        }
      }
    }

    const raw = storage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const parsedId =
      typeof parsed.id === 'string' || typeof parsed.id === 'number'
        ? parsed.id
        : typeof parsed.userId === 'string' || typeof parsed.userId === 'number'
          ? parsed.userId
          : null;

    const parsedAvatar =
      typeof parsed.avatar === 'string'
        ? parsed.avatar
        : typeof parsed.avatarUrl === 'string'
          ? parsed.avatarUrl
          : typeof parsed.photoUrl === 'string'
            ? parsed.photoUrl
            : null;

    return {
      id: parsedId ?? tokenUserId,
      username: typeof parsed.username === 'string' ? parsed.username : null,
      email: typeof parsed.email === 'string' ? parsed.email : null,
      avatar: parsedAvatar,
    };
  } catch {
    return null;
  }
}

export function parseTimestamp(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);

  if (typeof value === 'string') {
    const trimmed = value.trim();
    // If backend returns ISO-like strings without timezone (e.g. "2025-12-14T03:00:00"),
    // browsers interpret it as local time. That causes a ~7h shift in VN (UTC+7).
    // Treat "no timezone" strings as UTC by appending "Z".
    const hasTimezone = /Z$|[+-]\d{2}:?\d{2}$/.test(trimmed);
    const isoLike = trimmed.includes('T') || trimmed.includes(' ');
    const normalized = !hasTimezone && isoLike ? `${trimmed.replace(' ', 'T')}Z` : trimmed;
    return new Date(normalized);
  }

  return new Date(value);
}

export function timeAgo(value) {
  if (!value) return '';
  const d = parseTimestamp(value);
  if (!d || Number.isNaN(d.getTime())) return '';
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'Vừa xong';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} phút trước`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} giờ trước`;
  const day = Math.floor(hr / 24);
  return `${day} ngày trước`;
}

export function avatarFallback(name) {
  const safe = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${safe}&background=5d4037&color=fff&font-size=0.5`;
}

export function getDisplayName(user) {
  return user?.username || user?.email || 'User';
}

export function getAvatarUrl(user) {
  if (user?.avatar && typeof user.avatar === 'string') return user.avatar;
  return avatarFallback(getDisplayName(user));
}
