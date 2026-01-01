import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import userApi from '../../api/auth/userApi';
import { getAvatarUrl, getCurrentUser } from '../community/communityUtils';
import './SettingsPage.css';

// --- Icons SVG inline ---
const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
    <polyline points="17 21 17 13 7 13 7 21"></polyline>
    <polyline points="7 3 7 8 15 8"></polyline>
  </svg>
);

// --- Helpers ---
function normalizeProfile(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = raw.id ?? raw._id ?? raw.userId ?? null;
  const email = typeof raw.email === 'string' ? raw.email : null;
  const fullName = typeof raw.full_name === 'string' ? raw.full_name
      : typeof raw.fullName === 'string' ? raw.fullName
      : typeof raw.username === 'string' ? raw.username
      : null;
  const avatar = typeof raw.avatar === 'string' ? raw.avatar
      : typeof raw.avatar_url === 'string' ? raw.avatar_url
      : typeof raw.avatarUrl === 'string' ? raw.avatarUrl
      : typeof raw.photoUrl === 'string' ? raw.photoUrl
      : null;
  return { id, email, full_name: fullName, avatar };
}

function updateLocalUser(patch) {
  try {
    const raw = window.localStorage.getItem('user');
    const existing = raw ? JSON.parse(raw) : {};
    const merged = { ...(existing && typeof existing === 'object' ? existing : {}), ...patch };
    window.localStorage.setItem('user', JSON.stringify(merged));
  } catch { /* ignore */ }
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Ref for hidden file input

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');

  const [fullName, setFullName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewTemp, setAvatarPreviewTemp] = useState(null); // Preview local file

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const currentUser = useMemo(() => getCurrentUser(), []);

  // Compute avatar URL: Priority -> Local Preview -> Profile -> CurrentUser
  const displayAvatarUrl = useMemo(() => {
    if (avatarPreviewTemp) return avatarPreviewTemp;
    
    const mergedUser = {
      ...(currentUser || {}),
      avatar: profile?.avatar || currentUser?.avatar,
    };
    return getAvatarUrl(mergedUser);
  }, [avatarPreviewTemp, profile?.avatar, currentUser]);

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setProfileError('');
      try {
        const res = await userApi.getProfile();
        const normalized = normalizeProfile(res);
        if (!alive) return;
        setProfile(normalized);
        setFullName(normalized?.full_name || currentUser?.username || '');
      } catch (err) {
        if (!alive) return;
        setProfile(null);
        setProfileError(err?.detail || 'Không thể tải thông tin tài khoản.');
        const msg = String(err?.detail || err?.message || '');
        if (msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('token')) {
          navigate('/', { replace: true });
        }
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [navigate, currentUser?.username]);

  // Handle Image Selection
  const onFileSelect = (ev) => {
    const file = ev.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Create local preview
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreviewTemp(objectUrl);
      setProfileMessage('');
    }
  };

  const handleSaveFullName = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    const trimmed = fullName.trim();
    if (!trimmed) return setProfileMessage('Vui lòng nhập họ tên.');

    setSavingProfile(true);
    try {
      const res = await userApi.updateProfile({ full_name: trimmed });
      const normalized = normalizeProfile(res) || { ...(profile || {}), full_name: trimmed };
      setProfile(normalized);
      updateLocalUser({ username: normalized.full_name || trimmed });
      setProfileMessage('Đã cập nhật họ tên.');
    } catch (err) {
      setProfileMessage(err?.detail || 'Cập nhật họ tên thất bại.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUploadAvatar = async () => {
    if (!avatarFile) return;
    setSavingAvatar(true);
    setProfileMessage('');
    try {
      const res = await userApi.uploadAvatar(avatarFile);
      const normalized = normalizeProfile(res);
      const nextAvatar = normalized?.avatar || (typeof res?.avatar === 'string' ? res.avatar : null);
      
      const nextProfile = { ...(profile || {}), ...(normalized || {}) };
      if (nextAvatar) nextProfile.avatar = nextAvatar;

      setProfile(nextProfile);
      if (nextAvatar) updateLocalUser({ avatar: nextAvatar });

      setAvatarFile(null);
      setAvatarPreviewTemp(null); // Clear local preview
      setProfileMessage('Đã cập nhật avatar.');
    } catch (err) {
      setProfileMessage(err?.detail || 'Cập nhật avatar thất bại.');
    } finally {
      setSavingAvatar(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    if (!currentPassword || !newPassword) return setPasswordMessage('Vui lòng nhập đủ thông tin.');
    if (newPassword !== confirmPassword) return setPasswordMessage('Mật khẩu xác nhận không khớp.');

    setSavingPassword(true);
    try {
      await userApi.changePassword({ old_password: currentPassword, new_password: newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Đổi mật khẩu thành công.');
    } catch (err) {
      setPasswordMessage(err?.detail || 'Đổi mật khẩu thất bại.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="ha-settings-page">
      <div className="ha-settings-container">
        
        {/* Header */}
        <header className="ha-settings-header">
          <div className="ha-header-decoration"></div>
          <h2 className="ha-settings-title">Hồ Sơ Cá Nhân</h2>
          <p className="ha-settings-subtitle">Quản lý thông tin và bảo mật</p>
        </header>

        {loading && <div className="ha-loading-state">Đang tải cuộn giấy...</div>}
        
        {!loading && profileError && (
          <div className="ha-error-banner">
            <span>⚠️ {profileError}</span>
          </div>
        )}

        {!loading && !profileError && (
          <div className="ha-settings-grid">
            
            {/* COLUMN 1: PUBLIC INFO & AVATAR */}
            <div className="ha-column ha-column-profile">
              <div className="ha-card ha-card-profile">
                
                {/* Avatar Section */}
                <div className="ha-avatar-section">
                  <div 
                    className="ha-avatar-wrapper" 
                    onClick={() => !savingAvatar && fileInputRef.current?.click()}
                  >
                    <img 
                      className="ha-avatar-img" 
                      src={displayAvatarUrl} 
                      alt="Avatar" 
                    />
                    <div className="ha-avatar-overlay">
                      <CameraIcon />
                      <span>Đổi ảnh</span>
                    </div>
                    {savingAvatar && <div className="ha-avatar-loading"><div className="ha-spinner"></div></div>}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={onFileSelect}
                  />

                  {/* Show Upload Button ONLY if a file is selected */}
                  {avatarFile && !savingAvatar && (
                    <button className="ha-btn-mini-save fade-in" onClick={handleUploadAvatar}>
                      Lưu Avatar
                    </button>
                  )}
                  
                  <div className="ha-user-email">{profile?.email || currentUser?.email}</div>
                </div>

                <hr className="ha-divider" />

                {/* Name Form */}
                <form className="ha-form" onSubmit={handleSaveFullName}>
                  <label className="ha-label">Họ và tên</label>
                  <div className="ha-input-group">
                    <input
                      className="ha-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Tên hiển thị của bạn"
                      disabled={savingProfile}
                    />
                    <button type="submit" className="ha-btn-icon" disabled={savingProfile} title="Lưu tên">
                      <SaveIcon />
                    </button>
                  </div>
                </form>

                {profileMessage && <div className={`ha-status-msg ${profileMessage.includes('thất bại') ? 'error' : 'success'}`}>{profileMessage}</div>}
              </div>
            </div>

            {/* COLUMN 2: SECURITY */}
            <div className="ha-column ha-column-security">
              <div className="ha-card ha-card-security">
                <h3 className="ha-card-title">Bảo Mật</h3>
                
                <form className="ha-form-stack" onSubmit={handleChangePassword}>
                  <div className="ha-field">
                    <label className="ha-label">Mật khẩu hiện tại</label>
                    <input
                      className="ha-input"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={savingPassword}
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="ha-row-field">
                    <div className="ha-field">
                      <label className="ha-label">Mật khẩu mới</label>
                      <input
                        className="ha-input"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={savingPassword}
                      />
                    </div>
                    <div className="ha-field">
                      <label className="ha-label">Xác nhận</label>
                      <input
                        className="ha-input"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={savingPassword}
                      />
                    </div>
                  </div>

                  <button className="ha-btn ha-btn-primary" type="submit" disabled={savingPassword}>
                    {savingPassword ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                  </button>

                  {passwordMessage && <div className={`ha-status-msg ${passwordMessage.includes('thất bại') ? 'error' : 'success'}`}>{passwordMessage}</div>}
                </form>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}