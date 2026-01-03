import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  MessageCircle,
  Share2,
  Heart,
  Send,
  Loader2,
  MoreHorizontal,
  Feather,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import './CommunityPage.css';
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  likeOrUnlikePost,
  listComments,
  listPosts,
  listMyPosts,
  reportPost,
  updateComment,
  updatePost,
  uploadImages,
} from './communityService';

import Lightbox from './Lightbox';
import ImagesGrid from './ImagesGrid';
import EditImagesGrid from './EditImagesGrid';
import { avatarFallback, getAvatarUrl, getCurrentUser, timeAgo } from './communityUtils';

const CommunityPage = () => {
  const [posts, setPosts] = useState([]); // items từ BE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const REPORT_REASONS = useMemo(
    () => [
      { value: 'spam', label: 'Spam / quảng cáo' },
      { value: 'misinfo', label: 'Thông tin sai lệch' },
      { value: 'harassment', label: 'Quấy rối / công kích' },
      { value: 'adult', label: 'Nội dung phản cảm' },
      { value: 'copyright', label: 'Vi phạm bản quyền' },
      { value: 'other', label: 'Khác' },
    ],
    []
  );

  const [feedMode, setFeedMode] = useState('all'); // 'all' | 'mine'

  const [composerContent, setComposerContent] = useState('');
  const [commentDrafts, setCommentDrafts] = useState({}); // { [postId]: text }
  const [commentsByPost, setCommentsByPost] = useState({}); // { [postId]: items[] }
  const [commentsOpen, setCommentsOpen] = useState({}); // { [postId]: boolean }
  const [replyDrafts, setReplyDrafts] = useState({}); // { ["postId:commentId"]: text }
  const [replyOpen, setReplyOpen] = useState({}); // { ["postId:commentId"]: boolean }
  const [commentImages, setCommentImages] = useState({}); // { [postId]: [{file, previewUrl}] }
  const [replyImages, setReplyImages] = useState({}); // { ["postId:commentId"]: [{file, previewUrl}] }
  const [activeCommentImagePostId, setActiveCommentImagePostId] = useState(null);
  const [activeReplyImageKey, setActiveReplyImageKey] = useState(null);
  const [commentMenuOpen, setCommentMenuOpen] = useState({}); // { ["postId:commentId"]: boolean }
  const [editingCommentKey, setEditingCommentKey] = useState(null); // "postId:commentId"
  const [editCommentDraft, setEditCommentDraft] = useState('');
  const [busy, setBusy] = useState({}); // { [key]: boolean } key like "like:<id>" "comment:<id>" "createPost"

  const [menuOpenPostId, setMenuOpenPostId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editDraft, setEditDraft] = useState('');

  const [reportOpenPostId, setReportOpenPostId] = useState(null);
  const [reportDrafts, setReportDrafts] = useState({}); // { [postId]: { reason: string, note: string } }
  const [reportedByMe, setReportedByMe] = useState({}); // { [postId]: true }

  const getReporterId = () => {
    const u = getCurrentUser();
    const id = u?.id;
    return typeof id === 'string' || typeof id === 'number' ? String(id) : null;
  };

  const getReportStorageKey = (reporterId) => `ha_reported_posts:${reporterId}`;

  const loadReportedByMe = () => {
    const reporterId = getReporterId();
    if (!reporterId) return {};
    try {
      const raw = window.localStorage.getItem(getReportStorageKey(reporterId));
      const arr = raw ? JSON.parse(raw) : [];
      const next = {};
      (Array.isArray(arr) ? arr : []).forEach((id) => {
        if (id === null || id === undefined) return;
        next[String(id)] = true;
      });
      return next;
    } catch {
      return {};
    }
  };

  const persistReportedByMe = (nextMap) => {
    const reporterId = getReporterId();
    if (!reporterId) return;
    try {
      const ids = Object.keys(nextMap || {}).filter((k) => !!nextMap?.[k]);
      window.localStorage.setItem(getReportStorageKey(reporterId), JSON.stringify(ids));
    } catch {
      // ignore
    }
  };

  const editPostFileInputRef = useRef(null);
  const [editPostKeptImages, setEditPostKeptImages] = useState([]); // existing images kept during edit
  const [editPostNewImages, setEditPostNewImages] = useState([]); // [{file, previewUrl}] new images to upload

  const fileInputRef = useRef(null);
  const [selectedImages, setSelectedImages] = useState([]); // [{ file: File, previewUrl: string }]

  const commentFileInputRef = useRef(null);
  const replyFileInputRef = useRef(null);

  const editCommentFileInputRef = useRef(null);
  const [editCommentKeptImages, setEditCommentKeptImages] = useState([]); // existing images kept during edit
  const [editCommentNewImages, setEditCommentNewImages] = useState([]); // [{file, previewUrl}] new images to upload

  const commentImagesRef = useRef(commentImages);
  const replyImagesRef = useRef(replyImages);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]); // [{url, publicId?}]
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [postModalPostId, setPostModalPostId] = useState(null);

  const canPost = useMemo(() => composerContent.trim().length > 0, [composerContent]);

  const setBusyKey = (key, val) => setBusy((s) => ({ ...s, [key]: val }));

  const revokePreviewItems = (items) => {
    (items || []).forEach((it) => {
      if (!it?.previewUrl) return;
      try {
        URL.revokeObjectURL(it.previewUrl);
      } catch {
        // ignore
      }
    });
  };

  useEffect(() => {
    const hasCommentMenuOpen = Object.values(commentMenuOpen || {}).some(Boolean);
    const hasAnyMenuOpen = !!menuOpenPostId || hasCommentMenuOpen;
    if (!hasAnyMenuOpen) return;

    const onPointerDown = (e) => {
      const target = e.target;
      if (target && typeof target.closest === 'function') {
        if (target.closest('.post-menu')) return;
      }
      setMenuOpenPostId(null);
      setCommentMenuOpen({});
    };

    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      setMenuOpenPostId(null);
      setCommentMenuOpen({});
    };

    window.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpenPostId, commentMenuOpen]);

  const loadPosts = async (signal) => {
    setLoading(true);
    setError('');
    try {
      const items =
        feedMode === 'mine'
          ? await listMyPosts({ limit: 20, signal })
          : await listPosts({ limit: 20, signal });
      setPosts(items);
      setReportedByMe(loadReportedByMe());
    } catch (e) {
      if (e?.name === 'CanceledError' || e?.code === 'ERR_CANCELED') return;
      setError(e?.response?.data?.detail || 'Không tải được bài viết (có thể bạn chưa đăng nhập).');
    } finally {
      setLoading(false);
    }
  };

  const openReport = (postId) => {
    const reporterId = getReporterId();
    if (!reporterId) {
      window.alert('Bạn cần đăng nhập để báo cáo bài viết.');
      return;
    }

    const pid = String(postId);
    if (reportedByMe?.[pid]) {
      window.alert('Bạn đã báo cáo bài viết này rồi.');
      return;
    }

    setReportDrafts((s) => ({
      ...s,
      [pid]: s?.[pid] || { reason: '', note: '' },
    }));
    setReportOpenPostId(pid);
  };

  const closeReport = () => {
    setReportOpenPostId(null);
  };

  const submitReport = async (postId) => {
    const reporterId = getReporterId();
    if (!reporterId) {
      window.alert('Bạn cần đăng nhập để báo cáo bài viết.');
      return;
    }

    const pid = String(postId);
    if (reportedByMe?.[pid]) {
      window.alert('Bạn đã báo cáo bài viết này rồi.');
      return;
    }

    const draft = reportDrafts?.[pid] || { reason: '', note: '' };
    const reason = (draft.reason || '').trim();
    const note = (draft.note || '').trim();

    if (!reason) {
      window.alert('Vui lòng chọn lý do báo cáo.');
      return;
    }
    if (reason === 'other' && !note) {
      window.alert('Vui lòng nhập mô tả cho mục “Khác”.');
      return;
    }

    const busyKey = `reportPost:${pid}`;
    setBusyKey(busyKey, true);
    try {
      await reportPost(pid, { reason, note: note || undefined });
      setReportedByMe((cur) => {
        const next = { ...(cur || {}), [pid]: true };
        persistReportedByMe(next);
        return next;
      });
      window.alert('Đã gửi báo cáo. Cảm ơn bạn!');
      setMenuOpenPostId(null);
      setReportOpenPostId(null);
    } catch (e) {
      const msg =
        (typeof e?.detail === 'string' && e.detail) ||
        (typeof e?.message === 'string' && e.message) ||
        'Không gửi được báo cáo. Vui lòng thử lại.';
      window.alert(msg);
    } finally {
      setBusyKey(busyKey, false);
    }
  };

  useEffect(() => {
    return () => {
      selectedImages.forEach((it) => {
        try {
          URL.revokeObjectURL(it.previewUrl);
        } catch {
          // ignore
        }
      });
    };
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      revokePreviewItems(editPostNewImages);
    };
  }, [editPostNewImages]);

  useEffect(() => {
    return () => {
      revokePreviewItems(editCommentNewImages);
    };
  }, [editCommentNewImages]);

  useEffect(() => {
    commentImagesRef.current = commentImages;
  }, [commentImages]);

  useEffect(() => {
    replyImagesRef.current = replyImages;
  }, [replyImages]);

  useEffect(() => {
    return () => {
      try {
        Object.values(commentImagesRef.current || {})
          .flat()
          .forEach((it) => it?.previewUrl && URL.revokeObjectURL(it.previewUrl));
      } catch {
        // ignore
      }
      try {
        Object.values(replyImagesRef.current || {})
          .flat()
          .forEach((it) => it?.previewUrl && URL.revokeObjectURL(it.previewUrl));
      } catch {
        // ignore
      }
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadPosts(controller.signal);
    return () => controller.abort();
  }, [feedMode]);

  const handleCreatePost = async () => {
    if (!canPost) return;
    const key = 'createPost';
    setBusyKey(key, true);

    const content = composerContent.trim();
    const currentUser = getCurrentUser();
    const optimisticAuthor = currentUser?.username || currentUser?.email || 'Bạn';

    const files = selectedImages.map((x) => x.file);

    try {
      let uploadedImages = [];
      if (files.length > 0) {
        const uploadKey = 'uploadImages';
        setBusyKey(uploadKey, true);
        try {
          uploadedImages = await uploadImages(files);
        } finally {
          setBusyKey(uploadKey, false);
        }
      }

      const data = await createPost({ content, images: uploadedImages });
      const newId = data?.id;

      if (newId) {
        setPosts((cur) => [
          {
            id: newId,
            authorId: currentUser?.id ?? null,
            author: optimisticAuthor,
            avatar: avatarFallback(optimisticAuthor),
            createdAt: new Date().toISOString(),
            content,
            link: null,
            images: uploadedImages,
            likes: 0,
            commentCount: 0,
            isLiked: false,
            status: 'pending',
            flags: [],
            moderationFeedback: null,
            rejectedReason: null,
          },
          ...cur,
        ]);
      }

      setComposerContent('');
      setSelectedImages((cur) => {
        cur.forEach((it) => {
          try {
            URL.revokeObjectURL(it.previewUrl);
          } catch {
            // ignore
          }
        });
        return [];
      });

      // Đồng bộ lại từ server
      loadPosts();
    } catch (e) {
      setError(e?.response?.data?.detail || 'Đăng bài thất bại.');
    } finally {
      setBusyKey(key, false);
    }
  };

  const startEditPost = (post) => {
    setMenuOpenPostId(null);
    setEditingPostId(post.id);
    setEditDraft(post.content || '');

    // reset image editing state
    revokePreviewItems(editPostNewImages);
    setEditPostNewImages([]);
    setEditPostKeptImages(Array.isArray(post.images) ? post.images.filter((x) => x && x.url) : []);
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditDraft('');

    revokePreviewItems(editPostNewImages);
    setEditPostNewImages([]);
    setEditPostKeptImages([]);
  };

  const pickEditPostImages = () => {
    if (editPostFileInputRef.current) editPostFileInputRef.current.click();
  };

  const handleSelectEditPostImages = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    const MAX_FILES = 10;
    const MAX_SIZE = 5 * 1024 * 1024;

    const filtered = files
      .filter((f) => (f.type || '').startsWith('image/'))
      .filter((f) => f.size <= MAX_SIZE);

    if (filtered.length !== files.length) {
      setError('Chỉ chấp nhận ảnh, tối đa 5MB mỗi ảnh.');
    }

    setEditPostNewImages((cur) => {
      const remaining = Math.max(0, MAX_FILES - (editPostKeptImages.length + cur.length));
      if (remaining <= 0) {
        setError(`Tối đa ${MAX_FILES} ảnh mỗi bài.`);
        return cur;
      }
      const next = filtered.slice(0, remaining).map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
      return [...cur, ...next];
    });
  };

  const removeEditPostKeptImage = (idx) => {
    setEditPostKeptImages((cur) => cur.filter((_, i) => i !== idx));
  };

  const removeEditPostNewImage = (idx) => {
    setEditPostNewImages((cur) => {
      const item = cur[idx];
      if (item?.previewUrl) {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch {
          // ignore
        }
      }
      return cur.filter((_, i) => i !== idx);
    });
  };

  const handleUpdatePost = async (postId) => {
    const nextContent = (editDraft || '').trim();
    if (!nextContent) {
      setError('Nội dung không được để trống.');
      return;
    }

    const key = `updatePost:${postId}`;
    if (busy[key]) return;
    setBusyKey(key, true);

    const prev = posts;
    const keptImages = Array.isArray(editPostKeptImages) ? editPostKeptImages.filter((x) => x && x.url) : [];
    const newFiles = (editPostNewImages || []).map((x) => x.file).filter(Boolean);

    // optimistic update (content + keep-removed existing images; new uploads will be applied after upload)
    // If the post is already approved, editing should send it back to pending (BE should enforce this too).
    setPosts((cur) =>
      cur.map((p) => {
        if (p.id !== postId) return p;
        const currentStatus = String(p.status || '').toLowerCase();
        const nextStatus = currentStatus === 'approved' ? 'pending' : p.status;
        return { ...p, content: nextContent, images: keptImages, status: nextStatus };
      })
    );

    try {
      let uploadedImages = [];
      if (newFiles.length > 0) {
        const uploadKey = `uploadEditPostImages:${postId}`;
        setBusyKey(uploadKey, true);
        try {
          uploadedImages = await uploadImages(newFiles);
        } finally {
          setBusyKey(uploadKey, false);
        }
      }

      const mergedImages = [...keptImages, ...uploadedImages];
      const data = await updatePost(postId, { content: nextContent, images: mergedImages });
      const item = data?.item;

      if (item) {
        let nextStatusLower = '';
        setPosts((cur) => {
          const next = cur.map((p) => {
            if (p.id !== postId) return p;
            const merged = {
              id: item.id ?? p.id,
              authorId: item.authorId ?? p.authorId ?? null,
              author: item.author ?? p.author,
              avatar: item.avatar || p.avatar || avatarFallback(item.author ?? p.author),
              createdAt: item.createdAt ?? p.createdAt,
              content: item.content ?? nextContent,
              link: item.link ?? p.link ?? null,
              images: Array.isArray(item.images) ? item.images : p.images ?? [],
              likes: item.likes ?? p.likes ?? 0,
              commentCount: item.commentCount ?? p.commentCount ?? 0,
              isLiked: typeof item.isLiked === 'boolean' ? item.isLiked : !!p.isLiked,
              approvedAt:
                item.approvedAt ?? item.approved_at ?? item.publishedAt ?? item.published_at ?? p.approvedAt ?? null,
              moderatedAt: item.moderatedAt ?? item.moderated_at ?? p.moderatedAt ?? null,
              status: item.status ?? p.status ?? null,
              flags: Array.isArray(item.flags) ? item.flags : Array.isArray(item.tags) ? item.tags : p.flags ?? [],
              moderationFeedback:
                item.moderationFeedback ?? item.moderation_feedback ?? item.feedback ?? p.moderationFeedback ?? null,
              rejectedReason: item.rejectedReason ?? item.rejected_reason ?? p.rejectedReason ?? null,
            };
            nextStatusLower = String(merged.status || '').toLowerCase();
            return merged;
          });

          // If the post is no longer approved, it should disappear from the public feed.
          if (feedMode === 'all' && nextStatusLower && nextStatusLower !== 'approved') {
            return next.filter((p) => p.id !== postId);
          }
          return next;
        });
      } else {
        loadPosts();
      }
      setEditingPostId(null);
      setEditDraft('');

      revokePreviewItems(editPostNewImages);
      setEditPostNewImages([]);
      setEditPostKeptImages([]);
    } catch (e) {
      setPosts(prev);
      setError(e?.response?.data?.detail || 'Sửa bài thất bại.');
    } finally {
      setBusyKey(key, false);
    }
  };

  const handleDeletePost = async (postId) => {
    setMenuOpenPostId(null);
    const ok = window.confirm('Xóa bài viết này?');
    if (!ok) return;

    const key = `deletePost:${postId}`;
    if (busy[key]) return;
    setBusyKey(key, true);

    const prev = posts;
    setPosts((cur) => cur.filter((p) => p.id !== postId));

    try {
      const data = await deletePost(postId);
      if (data?.deleted === false) {
        setPosts(prev);
        setError('Xóa bài thất bại.');
        return;
      }
      if (editingPostId === postId) {
        setEditingPostId(null);
        setEditDraft('');
      }
    } catch (e) {
      setPosts(prev);
      setError(e?.response?.data?.detail || 'Xóa bài thất bại.');
    } finally {
      setBusyKey(key, false);
    }
  };

  const handlePickImagesClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleSelectImages = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    const MAX_FILES = 10;
    const MAX_SIZE = 5 * 1024 * 1024;

    const filtered = files
      .filter((f) => (f.type || '').startsWith('image/'))
      .filter((f) => f.size <= MAX_SIZE);

    if (filtered.length !== files.length) {
      setError('Chỉ chấp nhận ảnh, tối đa 5MB mỗi ảnh.');
    }

    setSelectedImages((cur) => {
      const remaining = Math.max(0, MAX_FILES - cur.length);
      if (remaining <= 0) {
        setError(`Tối đa ${MAX_FILES} ảnh mỗi bài.`);
        return cur;
      }
      const next = filtered.slice(0, remaining).map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
      return [...cur, ...next];
    });
  };

  const removeSelectedImage = (idx) => {
    setSelectedImages((cur) => {
      const item = cur[idx];
      if (item?.previewUrl) {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch {
          // ignore
        }
      }
      return cur.filter((_, i) => i !== idx);
    });
  };

  const pickCommentImages = (postId) => {
    setActiveCommentImagePostId(postId);
    if (commentFileInputRef.current) commentFileInputRef.current.click();
  };

  const pickReplyImages = (replyKey) => {
    setActiveReplyImageKey(replyKey);
    if (replyFileInputRef.current) replyFileInputRef.current.click();
  };

  const appendSelectedImages = (prev, files) => {
    const MAX_FILES = 10;
    const MAX_SIZE = 5 * 1024 * 1024;

    const filtered = (files || [])
      .filter((f) => (f.type || '').startsWith('image/'))
      .filter((f) => f.size <= MAX_SIZE);

    if (filtered.length !== (files || []).length) {
      setError('Chỉ chấp nhận ảnh, tối đa 5MB mỗi ảnh.');
    }

    const remaining = Math.max(0, MAX_FILES - prev.length);
    if (remaining <= 0) {
      setError(`Tối đa ${MAX_FILES} ảnh mỗi bình luận.`);
      return prev;
    }

    const next = filtered
      .slice(0, remaining)
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    return [...prev, ...next];
  };

  const handleSelectCommentImages = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    const postId = activeCommentImagePostId;
    if (!postId || !files.length) return;
    setCommentImages((s) => ({ ...s, [postId]: appendSelectedImages(s[postId] || [], files) }));
  };

  const handleSelectReplyImages = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    const key = activeReplyImageKey;
    if (!key || !files.length) return;
    setReplyImages((s) => ({ ...s, [key]: appendSelectedImages(s[key] || [], files) }));
  };

  const removeCommentSelectedImage = (postId, idx) => {
    setCommentImages((s) => {
      const cur = s[postId] || [];
      const item = cur[idx];
      if (item?.previewUrl) {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch {
          // ignore
        }
      }
      const nextArr = cur.filter((_, i) => i !== idx);
      if (!nextArr.length) {
        const next = { ...s };
        delete next[postId];
        return next;
      }
      return { ...s, [postId]: nextArr };
    });
  };

  const removeReplySelectedImage = (replyKey, idx) => {
    setReplyImages((s) => {
      const cur = s[replyKey] || [];
      const item = cur[idx];
      if (item?.previewUrl) {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch {
          // ignore
        }
      }
      const nextArr = cur.filter((_, i) => i !== idx);
      if (!nextArr.length) {
        const next = { ...s };
        delete next[replyKey];
        return next;
      }
      return { ...s, [replyKey]: nextArr };
    });
  };

  const toggleComments = async (postId) => {
    const nextOpen = !commentsOpen[postId];
    setCommentsOpen((s) => ({ ...s, [postId]: nextOpen }));
    if (!nextOpen) return;

    if (!commentsByPost[postId]) {
      const key = `loadComments:${postId}`;
      setBusyKey(key, true);
      try {
        const items = await listComments(postId, { limit: 50 });
        setCommentsByPost((s) => ({ ...s, [postId]: items }));
      } catch (e) {
        setError(e?.response?.data?.detail || 'Không tải được bình luận.');
      } finally {
        setBusyKey(key, false);
      }
    }
  };

  const ensureCommentsLoaded = async (postId) => {
    if (commentsByPost[postId]) return;
    const key = `loadComments:${postId}`;
    setBusyKey(key, true);
    try {
      const items = await listComments(postId, { limit: 50 });
      setCommentsByPost((s) => ({ ...s, [postId]: items }));
    } catch (e) {
      setError(e?.response?.data?.detail || 'Không tải được bình luận.');
    } finally {
      setBusyKey(key, false);
    }
  };

  const handleLike = async (postId) => {
    const key = `like:${postId}`;
    if (busy[key]) return;
    setBusyKey(key, true);

    const prev = posts;
    setPosts((cur) =>
      cur.map((p) => {
        if (p.id !== postId) return p;
        const nextLiked = !p.isLiked;
        return { ...p, isLiked: nextLiked, likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1) };
      })
    );

    try {
      const current = prev.find((p) => p.id === postId);
      const data = await likeOrUnlikePost(postId, !!current?.isLiked);
      const likes = data?.likes;
      const isLiked = data?.isLiked;

      if (typeof likes === 'number') {
        setPosts((cur) => cur.map((p) => (p.id === postId ? { ...p, likes, isLiked: !!isLiked } : p)));
      }
    } catch (e) {
      setPosts(prev);
      setError(e?.response?.data?.detail || 'Thao tác like thất bại (có thể bạn chưa đăng nhập).');
    } finally {
      setBusyKey(key, false);
    }
  };

  const handleSendComment = async (postId) => {
    const text = (commentDrafts[postId] || '').trim();
    const files = (commentImages[postId] || []).map((x) => x.file);
    if (!text && files.length === 0) return;

    const key = `comment:${postId}`;
    if (busy[key]) return;
    setBusyKey(key, true);

    try {
      let uploadedImages = [];
      if (files.length > 0) {
        const uploadKey = `uploadCommentImages:${postId}`;
        setBusyKey(uploadKey, true);
        try {
          uploadedImages = await uploadImages(files);
        } finally {
          setBusyKey(uploadKey, false);
        }
      }

      await createComment(postId, { text, images: uploadedImages });
      setCommentDrafts((s) => ({ ...s, [postId]: '' }));
      setCommentImages((s) => {
        const cur = s[postId] || [];
        cur.forEach((it) => {
          try {
            URL.revokeObjectURL(it.previewUrl);
          } catch {
            // ignore
          }
        });
        const next = { ...s };
        delete next[postId];
        return next;
      });

      // reload comments của post đó để đồng bộ
      const items = await listComments(postId, { limit: 50 });
      setCommentsByPost((s) => ({ ...s, [postId]: items }));

      // tăng commentCount trên card (nhanh)
      setPosts((cur) => cur.map((p) => (p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p)));
    } catch (e) {
      setError(e?.response?.data?.detail || 'Gửi bình luận thất bại.');
    } finally {
      setBusyKey(key, false);
    }
  };

  const currentUser = getCurrentUser();
  const currentUserAvatar = getAvatarUrl(currentUser);

  const openPostModal = async (postId) => {
    setPostModalPostId(postId);
    await ensureCommentsLoaded(postId);
  };

  const closePostModal = () => {
    setPostModalPostId(null);
  };

  useEffect(() => {
    if (!postModalPostId) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closePostModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [postModalPostId]);

  const renderCommentsForPost = (post) => {
    if (!post) return null;
    const postId = post.id;
    const cmts = commentsByPost[postId] || [];
    const draft = commentDrafts[postId] || '';
    const myId = currentUser?.id;
    const loadingKey = `loadComments:${postId}`;

    return (
      <div className="comments-container">
        <input
          ref={commentFileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelectCommentImages}
          style={{ display: 'none' }}
        />

        <input
          ref={replyFileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelectReplyImages}
          style={{ display: 'none' }}
        />

        <input
          ref={editCommentFileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelectEditCommentImages}
          style={{ display: 'none' }}
        />

        {!!busy[loadingKey] && !cmts.length ? (
          <div style={{ color: '#5d4037', fontWeight: 700 }}>Đang tải bình luận…</div>
        ) : (
          buildCommentThread(cmts).map((c) => {
            const renderNode = (node, depth) => {
              const rootId = depth === 0 ? node.id : node.rootId || node.id;
              const replyKey = `${postId}:${node.id}`;
              const isReplying = !!replyOpen[replyKey];
              const replyText = replyDrafts[replyKey] || '';
              const replyBusyKey = `reply:${replyKey}`;
              const replySelected = replyImages[replyKey] || [];

              const commentAuthorId = node.authorId;
              const isCommentOwner =
                (typeof myId === 'string' || typeof myId === 'number') &&
                  (typeof commentAuthorId === 'string' || typeof commentAuthorId === 'number')
                  ? String(myId) === String(commentAuthorId)
                  : false;

              const isEditingComment = editingCommentKey === replyKey;
              const updateKey = `updateComment:${postId}:${node.id}`;
              const deleteKey = `deleteComment:${postId}:${node.id}`;
              const uploadEditKey = `uploadEditCommentImages:${postId}:${node.id}`;

              const parentIdForReply = depth === 0 ? node.id : rootId;
              const mentionName = depth === 0 ? null : node.author;

              return (
                <div
                  key={node.id}
                  className={`comment-item ${depth > 0 ? 'reply' : ''}`}
                  style={depth > 0 ? { marginLeft: Math.min(56, depth * 28) } : undefined}
                >
                  <img src={node.avatar} className="avatar" style={{ width: 32, height: 32 }} alt="" />
                  <div style={{ flex: 1 }}>
                    <div className="comment-row">
                      <div className="comment-bubble" style={{ flex: 1 }}>
                        <span className="comment-author">{node.author}</span>
                        <span className="comment-time">{timeAgo(node.createdAt)}</span>

                        {isEditingComment ? (
                          <>
                            <textarea
                              className="comment-edit-textarea"
                              rows={3}
                              value={editCommentDraft}
                              onChange={(e) => setEditCommentDraft(e.target.value)}
                            />

                            <div className="comment-edit-media">
                              <button
                                type="button"
                                className="comment-image-btn"
                                onClick={pickEditCommentImages}
                                disabled={!!busy[updateKey] || !!busy[uploadEditKey]}
                                aria-label="Add image"
                              >
                                <ImageIcon size={18} />
                              </button>
                            </div>

                            <EditImagesGrid
                              keptImages={editCommentKeptImages}
                              newImages={editCommentNewImages}
                              onRemoveKept={removeEditCommentKeptImage}
                              onRemoveNew={removeEditCommentNewImage}
                            />
                          </>
                        ) : (
                          <>
                            {node.text && <span style={{ fontSize: '0.95rem' }}>{node.text}</span>}

                            <ImagesGrid images={node.images} variant="comment" onOpen={openLightbox} />
                          </>
                        )}
                      </div>

                      {isCommentOwner && (
                        <div className="post-menu">
                          <button
                            className="post-menu-trigger"
                            type="button"
                            onClick={() => setCommentMenuOpen((s) => ({ ...s, [replyKey]: !s[replyKey] }))}
                            aria-label="Comment menu"
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {commentMenuOpen[replyKey] && (
                            <div className="post-menu-dropdown" role="menu">
                              <button
                                type="button"
                                className="post-menu-item"
                                onClick={() => startEditComment(postId, node)}
                                disabled={!!busy[updateKey] || !!busy[deleteKey]}
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                className="post-menu-item danger"
                                onClick={() => handleDeleteComment(postId, node.id)}
                                disabled={!!busy[deleteKey]}
                              >
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {isEditingComment ? (
                      <div className="comment-edit-actions">
                        <button
                          type="button"
                          className="post-edit-btn primary"
                          onClick={() => handleUpdateComment(postId, node.id)}
                          disabled={!!busy[updateKey] || !!busy[uploadEditKey]}
                        >
                          Lưu
                        </button>
                        <button
                          type="button"
                          className="post-edit-btn"
                          onClick={cancelEditComment}
                          disabled={!!busy[updateKey] || !!busy[uploadEditKey]}
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <div className="comment-actions">
                        <button type="button" className="comment-reply-btn" onClick={() => toggleReply(postId, node.id, mentionName)}>
                          Trả lời
                        </button>
                      </div>
                    )}

                    {isReplying && (
                      <>
                        <div className="reply-input-row">
                          <button
                            type="button"
                            className="comment-image-btn"
                            onClick={() => pickReplyImages(replyKey)}
                            disabled={!!busy[replyBusyKey] || !!busy[`uploadReplyImages:${replyKey}`]}
                            aria-label="Add image"
                          >
                            <ImageIcon size={18} />
                          </button>

                          <input
                            type="text"
                            className="reply-input"
                            placeholder="Trả lời..."
                            value={replyText}
                            onChange={(e) => setReplyDrafts((s) => ({ ...s, [replyKey]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter')
                                handleSendReply({ postId, parentId: parentIdForReply, draftKey: replyKey, mentionName });
                            }}
                          />

                          <button
                            type="button"
                            className="reply-send"
                            onClick={() => handleSendReply({ postId, parentId: parentIdForReply, draftKey: replyKey, mentionName })}
                            disabled={!!busy[replyBusyKey] || !!busy[`uploadReplyImages:${replyKey}`]}
                          >
                            {busy[replyBusyKey] || busy[`uploadReplyImages:${replyKey}`] ? (
                              <Loader2 size={18} className="icon-spin" />
                            ) : (
                              <Send size={18} />
                            )}
                          </button>
                        </div>

                        {replySelected.length > 0 && (
                          <div className="comment-draft-images">
                            {replySelected.map((it, idx) => (
                              <div key={`${it.file.name}-${it.file.size}-${idx}`} className="comment-draft-thumb">
                                <img src={it.previewUrl} alt="" />
                                <button
                                  type="button"
                                  className="comment-draft-remove"
                                  onClick={() => removeReplySelectedImage(replyKey, idx)}
                                  aria-label="Remove image"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {Array.isArray(node.children) && node.children.length > 0 && (
                      <div className="reply-thread">
                        {node.children.map((child) => renderNode({ ...child, rootId: depth === 0 ? node.id : rootId }, depth + 1))}
                      </div>
                    )}
                  </div>
                </div>
              );
            };

            return renderNode(c, 0);
          })
        )}

        <div className="comment-input-wrapper">
          <img src={currentUserAvatar} className="avatar" style={{ width: 32, height: 32 }} alt="" />

          <button
            type="button"
            className="comment-image-btn"
            onClick={() => pickCommentImages(postId)}
            disabled={!!busy[`comment:${postId}`] || !!busy[`uploadCommentImages:${postId}`]}
            aria-label="Add image"
          >
            <ImageIcon size={18} />
          </button>

          <input
            type="text"
            className="comment-input"
            placeholder="Viết lời bình..."
            value={draft}
            onChange={(e) => setCommentDrafts((s) => ({ ...s, [postId]: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendComment(postId);
            }}
          />
          <button
            style={{ background: 'none', border: 'none', color: '#9a2a2a', cursor: 'pointer' }}
            onClick={() => handleSendComment(postId)}
            disabled={!!busy[`comment:${postId}`] || !!busy[`uploadCommentImages:${postId}`]}
            type="button"
          >
            {busy[`comment:${postId}`] || busy[`uploadCommentImages:${postId}`] ? (
              <Loader2 size={20} className="icon-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>

        {(commentImages[postId] || []).length > 0 && (
          <div className="comment-draft-images">
            {(commentImages[postId] || []).map((it, idx) => (
              <div key={`${it.file.name}-${it.file.size}-${idx}`} className="comment-draft-thumb">
                <img src={it.previewUrl} alt="" />
                <button
                  type="button"
                  className="comment-draft-remove"
                  onClick={() => removeCommentSelectedImage(postId, idx)}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const openLightbox = (images, index) => {
    const safeImages = Array.isArray(images) ? images.filter((x) => x && x.url) : [];
    if (!safeImages.length) return;
    const safeIndex = Math.min(Math.max(0, index || 0), safeImages.length - 1);
    setLightboxImages(safeImages);
    setLightboxIndex(safeIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const showPrevLightbox = () => {
    setLightboxIndex((i) => {
      const len = lightboxImages.length || 0;
      if (len <= 1) return 0;
      return (i - 1 + len) % len;
    });
  };

  const showNextLightbox = () => {
    setLightboxIndex((i) => {
      const len = lightboxImages.length || 0;
      if (len <= 1) return 0;
      return (i + 1) % len;
    });
  };

  const ensureMentionPrefix = (text, authorName) => {
    const name = (authorName || '').trim();
    if (!name) return text;
    const mention = `@${name}`;
    const trimmed = (text || '').trimStart();
    if (trimmed.toLowerCase().startsWith(mention.toLowerCase())) return (text || '').trim();
    return `${mention} ${(text || '').trim()}`.trim();
  };

  const toggleReply = (postId, commentId, mentionName) => {
    const key = `${postId}:${commentId}`;
    setReplyOpen((s) => ({ ...s, [key]: !s[key] }));
    if (mentionName) {
      setReplyDrafts((s) => ({
        ...s,
        [key]: ensureMentionPrefix(s[key] || '', mentionName) + (s[key] ? '' : ' '),
      }));
    }
  };

  const handleSendReply = async ({ postId, parentId, draftKey, mentionName }) => {
    const raw = replyDrafts[draftKey] || '';
    const files = (replyImages[draftKey] || []).map((x) => x.file);
    const text = mentionName ? ensureMentionPrefix(raw, mentionName) : raw.trim();
    if (!text.trim() && files.length === 0) return;

    const busyKey = `reply:${draftKey}`;
    if (busy[busyKey]) return;
    setBusyKey(busyKey, true);

    try {
      let uploadedImages = [];
      if (files.length > 0) {
        const uploadKey = `uploadReplyImages:${draftKey}`;
        setBusyKey(uploadKey, true);
        try {
          uploadedImages = await uploadImages(files);
        } finally {
          setBusyKey(uploadKey, false);
        }
      }

      await createComment(postId, { text, parentId, images: uploadedImages });
      setReplyDrafts((s) => ({ ...s, [draftKey]: '' }));
      setReplyOpen((s) => ({ ...s, [draftKey]: false }));
      setReplyImages((s) => {
        const cur = s[draftKey] || [];
        cur.forEach((it) => {
          try {
            URL.revokeObjectURL(it.previewUrl);
          } catch {
            // ignore
          }
        });
        const next = { ...s };
        delete next[draftKey];
        return next;
      });

      // reload comments của post đó để đồng bộ
      const items = await listComments(postId, { limit: 50 });
      setCommentsByPost((s) => ({ ...s, [postId]: items }));

      setPosts((cur) => cur.map((p) => (p.id === postId ? { ...p, commentCount: (p.commentCount || 0) + 1 } : p)));
    } catch (e) {
      setError(e?.response?.data?.detail || 'Gửi trả lời thất bại.');
    } finally {
      setBusyKey(busyKey, false);
    }
  };

  const buildCommentThread = (items) => {
    const byId = new Map();
    const ordered = Array.isArray(items) ? items : [];

    for (const c of ordered) {
      byId.set(c.id, { ...c, children: [] });
    }

    const roots = [];
    for (const c of ordered) {
      const node = byId.get(c.id);
      const parentId = c.parentId;

      // Clamp to max 2 levels:
      // - If parent is a root -> attach as child (level 2)
      // - If parent itself already has a parent -> flatten to that parent's parent (still level 2)
      if (parentId && byId.has(parentId)) {
        const parent = byId.get(parentId);
        const grandParentId = parent?.parentId;
        if (grandParentId && byId.has(grandParentId)) {
          byId.get(grandParentId).children.push(node);
        } else {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    }

    return roots;
  };

  const startEditComment = (postId, comment) => {
    const key = `${postId}:${comment.id}`;
    setCommentMenuOpen((s) => ({ ...s, [key]: false }));
    setEditingCommentKey(key);
    setEditCommentDraft(comment.text || '');

    revokePreviewItems(editCommentNewImages);
    setEditCommentNewImages([]);
    setEditCommentKeptImages(Array.isArray(comment.images) ? comment.images.filter((x) => x && x.url) : []);
  };

  const cancelEditComment = () => {
    setEditingCommentKey(null);
    setEditCommentDraft('');

    revokePreviewItems(editCommentNewImages);
    setEditCommentNewImages([]);
    setEditCommentKeptImages([]);
  };

  const pickEditCommentImages = () => {
    if (editCommentFileInputRef.current) editCommentFileInputRef.current.click();
  };

  const handleSelectEditCommentImages = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;

    const MAX_FILES = 10;
    const MAX_SIZE = 5 * 1024 * 1024;

    const filtered = files
      .filter((f) => (f.type || '').startsWith('image/'))
      .filter((f) => f.size <= MAX_SIZE);

    if (filtered.length !== files.length) {
      setError('Chỉ chấp nhận ảnh, tối đa 5MB mỗi ảnh.');
    }

    setEditCommentNewImages((cur) => {
      const remaining = Math.max(0, MAX_FILES - (editCommentKeptImages.length + cur.length));
      if (remaining <= 0) {
        setError(`Tối đa ${MAX_FILES} ảnh mỗi bình luận.`);
        return cur;
      }
      const next = filtered.slice(0, remaining).map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
      return [...cur, ...next];
    });
  };

  const removeEditCommentKeptImage = (idx) => {
    setEditCommentKeptImages((cur) => cur.filter((_, i) => i !== idx));
  };

  const removeEditCommentNewImage = (idx) => {
    setEditCommentNewImages((cur) => {
      const item = cur[idx];
      if (item?.previewUrl) {
        try {
          URL.revokeObjectURL(item.previewUrl);
        } catch {
          // ignore
        }
      }
      return cur.filter((_, i) => i !== idx);
    });
  };

  const reloadComments = async (postId) => {
    const key = `loadComments:${postId}`;
    setBusyKey(key, true);
    try {
      const items = await listComments(postId, { limit: 50 });

      const prevItems = commentsByPost[postId] || [];
      const prevById = new Map(prevItems.map((c) => [c.id, c]));
      setCommentsByPost((s) => ({
        ...s,
        [postId]: items.map((c) => ({ ...c, images: Array.isArray(c.images) ? c.images : prevById.get(c.id)?.images ?? [] })),
      }));
    } catch (e) {
      setError(e?.response?.data?.detail || 'Không tải được bình luận.');
    } finally {
      setBusyKey(key, false);
    }
  };

  const handleUpdateComment = async (postId, commentId) => {
    const nextText = (editCommentDraft || '').trim();
    const keptImages = Array.isArray(editCommentKeptImages) ? editCommentKeptImages.filter((x) => x && x.url) : [];
    const newFiles = (editCommentNewImages || []).map((x) => x.file).filter(Boolean);
    if (!nextText && keptImages.length === 0 && newFiles.length === 0) {
      setError('Nội dung không được để trống.');
      return;
    }

    const key = `updateComment:${postId}:${commentId}`;
    if (busy[key]) return;
    setBusyKey(key, true);

    const prevPostComments = commentsByPost[postId] || [];
    try {
      let uploadedImages = [];
      if (newFiles.length > 0) {
        const uploadKey = `uploadEditCommentImages:${postId}:${commentId}`;
        setBusyKey(uploadKey, true);
        try {
          uploadedImages = await uploadImages(newFiles);
        } finally {
          setBusyKey(uploadKey, false);
        }
      }

      const mergedImages = [...keptImages, ...uploadedImages];

      // optimistic UI update
      setCommentsByPost((s) => {
        const cur = s[postId] || [];
        return {
          ...s,
          [postId]: cur.map((c) => (c.id === commentId ? { ...c, text: nextText, images: mergedImages } : c)),
        };
      });

      await updateComment(postId, commentId, { text: nextText, images: mergedImages });
      await reloadComments(postId);
      setEditingCommentKey(null);
      setEditCommentDraft('');

      revokePreviewItems(editCommentNewImages);
      setEditCommentNewImages([]);
      setEditCommentKeptImages([]);
    } catch (e) {
      // rollback
      setCommentsByPost((s) => ({ ...s, [postId]: prevPostComments }));
      setError(e?.response?.data?.detail || 'Sửa bình luận thất bại.');
    } finally {
      setBusyKey(key, false);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const ok = window.confirm('Xóa bình luận này?');
    if (!ok) return;

    const key = `deleteComment:${postId}:${commentId}`;
    if (busy[key]) return;
    setBusyKey(key, true);
    try {
      await deleteComment(postId, commentId);
      if (editingCommentKey === `${postId}:${commentId}`) {
        setEditingCommentKey(null);
        setEditCommentDraft('');
      }
      await reloadComments(postId);
      // refresh counts (backend is source of truth)
      loadPosts();
    } catch (e) {
      setError(e?.response?.data?.detail || 'Xóa bình luận thất bại.');
    } finally {
      setBusyKey(key, false);
    }
  };

  return (
    <div className="container">
      <header className="page-header">
        <h1 className="brand-title">Thiên Hạ Luận Đàm</h1>
        <div className="brand-subtitle">Nơi tao nhân mặc khách hội ngộ</div>

        <div className="ha-feed-tabs" role="tablist" aria-label="Chế độ hiển thị bài viết">
          <button
            type="button"
            className={`ha-feed-tab ${feedMode === 'all' ? 'is-active' : ''}`}
            onClick={() => setFeedMode('all')}
            aria-selected={feedMode === 'all'}
          >
            Tất cả
          </button>
          <button
            type="button"
            className={`ha-feed-tab ${feedMode === 'mine' ? 'is-active' : ''}`}
            onClick={() => setFeedMode('mine')}
            aria-selected={feedMode === 'mine'}
          >
            Bài của tôi
          </button>
        </div>
      </header>

      {error && (
        <div style={{ marginBottom: 12, color: '#9a2a2a', fontWeight: 700 }}>
          {error}
        </div>
      )}

      <div className="composer-box">
        <div className="corner-decor tl"></div>
        <div className="corner-decor tr"></div>
        <div className="corner-decor bl"></div>
        <div className="corner-decor br"></div>

        <div className="composer-input-group">
          <img className="avatar" src={currentUserAvatar} alt="Me" />
          <textarea
            className="composer-textarea"
            placeholder="Các hạ đang có tâm sự gì?"
            rows={2}
            value={composerContent}
            onChange={(e) => setComposerContent(e.target.value)}
          />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelectImages}
          style={{ display: 'none' }}
        />

        <input
          ref={editPostFileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleSelectEditPostImages}
          style={{ display: 'none' }}
        />

        {selectedImages.length > 0 && (
          <div className="composer-images">
            {selectedImages.map((it, idx) => (
              <div key={`${it.file.name}-${it.file.size}-${idx}`} className="composer-image-thumb">
                <img src={it.previewUrl} alt="" className="composer-image" />
                <button
                  type="button"
                  className="composer-image-remove"
                  onClick={() => removeSelectedImage(idx)}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="composer-footer">
          <div style={{ display: 'flex', gap: '15px', color: '#5d4037' }}>
            <button
              type="button"
              className="composer-action"
              onClick={handlePickImagesClick}
              disabled={!!busy.createPost || !!busy.uploadImages}
            >
              <ImageIcon size={18} /> Ảnh
            </button>
          </div>

          <button className="btn-seal" onClick={handleCreatePost} disabled={!canPost || !!busy.createPost || !!busy.uploadImages}>
            <Send size={16} /> {busy.createPost || busy.uploadImages ? 'Đang gửi…' : 'Gửi Bài'}
          </button>
        </div>
      </div>

      <div className="feed">
        {loading ? (
          <div style={{ color: '#5d4037', fontWeight: 700 }}>Đang tải…</div>
        ) : (
          posts.map((post) => {
            const myId = currentUser?.id;
            const authorId = post.authorId;
            const isOwner =
              (typeof myId === 'string' || typeof myId === 'number') &&
                (typeof authorId === 'string' || typeof authorId === 'number')
                ? String(myId) === String(authorId)
                : false;
            const isEditing = editingPostId === post.id;

            const myStatus = (post.status || '').toLowerCase();
            const showModeration = isOwner && myStatus && myStatus !== 'approved';
            const publishedTime =
              myStatus === 'approved'
                ? post.approvedAt || post.publishedAt || post.moderatedAt || post.createdAt
                : post.createdAt;
            const statusLabel =
              myStatus === 'pending'
                ? 'Chờ duyệt'
                : myStatus === 'need_edit'
                  ? 'Cần chỉnh sửa'
                  : myStatus === 'rejected'
                    ? 'Từ chối'
                    : myStatus;

            return (
              <article key={post.id} className="post-card">
                <div className="post-header">
                  <img src={post.avatar} alt={post.author} className="avatar" style={{ width: 40, height: 40 }} />
                  <div style={{ flex: 1 }}>
                    <div className="author-name">
                      {post.author}
                      {showModeration && (
                        <span className={`ha-status-badge ha-status-${myStatus}`}>{statusLabel}</span>
                      )}
                    </div>
                    <div className="post-meta">{timeAgo(publishedTime)}</div>

                    {showModeration && myStatus === 'need_edit' && post.moderationFeedback ? (
                      <div className="ha-moderation-note">
                        <div className="ha-moderation-title">Góp ý từ admin</div>
                        <div className="ha-moderation-text">{post.moderationFeedback}</div>
                      </div>
                    ) : null}

                    {showModeration && myStatus === 'rejected' && post.rejectedReason ? (
                      <div className="ha-moderation-note ha-moderation-note--rejected">
                        <div className="ha-moderation-title">Lý do từ chối</div>
                        <div className="ha-moderation-text">{post.rejectedReason}</div>
                      </div>
                    ) : null}
                  </div>
                  <div className="post-menu">
                    <button
                      className="post-menu-trigger"
                      type="button"
                      onClick={() => {
                        const pid = String(post.id);
                        setMenuOpenPostId((cur) => (String(cur) === pid ? null : pid));
                        setReportOpenPostId(null);
                      }}
                      aria-label="Post menu"
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {String(menuOpenPostId) === String(post.id) && (
                      <div className="post-menu-dropdown" role="menu">
                        {isOwner ? (
                          <>
                            <button
                              type="button"
                              className="post-menu-item"
                              onClick={() => startEditPost(post)}
                              disabled={!!busy[`updatePost:${post.id}`] || !!busy[`deletePost:${post.id}`]}
                            >
                              Sửa bài
                            </button>
                            <button
                              type="button"
                              className="post-menu-item danger"
                              onClick={() => handleDeletePost(post.id)}
                              disabled={!!busy[`deletePost:${post.id}`]}
                            >
                              Xóa bài
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="post-menu-item"
                              onClick={() => openReport(post.id)}
                              disabled={!!busy[`reportPost:${post.id}`] || !!reportedByMe?.[String(post.id)]}
                            >
                              {reportedByMe?.[String(post.id)] ? 'Đã báo cáo' : 'Báo cáo'}
                            </button>

                            {String(reportOpenPostId) === String(post.id) && !reportedByMe?.[String(post.id)] ? (
                              <div className="post-report-panel">
                                <select
                                  className="post-report-select"
                                  value={reportDrafts?.[String(post.id)]?.reason || ''}
                                  onChange={(e) =>
                                    setReportDrafts((s) => ({
                                      ...s,
                                      [String(post.id)]: {
                                        reason: e.target.value,
                                        note: s?.[String(post.id)]?.note || '',
                                      },
                                    }))
                                  }
                                >
                                  <option value="">Chọn…</option>
                                  {REPORT_REASONS.map((r) => (
                                    <option key={r.value} value={r.value}>
                                      {r.label}
                                    </option>
                                  ))}
                                </select>

                                <div className="post-report-label" style={{ marginTop: 10 }}>
                                  Ghi chú (tuỳ chọn)
                                </div>
                                <textarea
                                  className="post-report-textarea"
                                  rows={3}
                                  value={reportDrafts?.[String(post.id)]?.note || ''}
                                  onChange={(e) =>
                                    setReportDrafts((s) => ({
                                      ...s,
                                      [String(post.id)]: {
                                        reason: s?.[String(post.id)]?.reason || '',
                                        note: e.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="Mô tả thêm (nếu cần)…"
                                />

                                <div className="post-report-actions">
                                  <button
                                    type="button"
                                    className="post-edit-btn"
                                    onClick={closeReport}
                                    disabled={!!busy[`reportPost:${post.id}`]}
                                  >
                                    Huỷ
                                  </button>
                                  <button
                                    type="button"
                                    className="post-edit-btn primary"
                                    onClick={() => submitReport(post.id)}
                                    disabled={!!busy[`reportPost:${post.id}`]}
                                  >
                                    Gửi
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="post-edit">
                    <textarea
                      className="post-edit-textarea"
                      rows={4}
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                    />

                    <div className="post-edit-media">
                      <button
                        type="button"
                        className="composer-action"
                        onClick={pickEditPostImages}
                        disabled={!!busy[`updatePost:${post.id}`] || !!busy[`uploadEditPostImages:${post.id}`]}
                      >
                        <ImageIcon size={18} /> Ảnh
                      </button>
                    </div>

                    <EditImagesGrid
                      keptImages={editPostKeptImages}
                      newImages={editPostNewImages}
                      onRemoveKept={removeEditPostKeptImage}
                      onRemoveNew={removeEditPostNewImage}
                    />

                    <div className="post-edit-actions">
                      <button
                        type="button"
                        className="post-edit-btn primary"
                        onClick={() => handleUpdatePost(post.id)}
                        disabled={!!busy[`updatePost:${post.id}`] || !!busy[`uploadEditPostImages:${post.id}`]}
                      >
                        Lưu
                      </button>
                      <button
                        type="button"
                        className="post-edit-btn"
                        onClick={cancelEditPost}
                        disabled={!!busy[`updatePost:${post.id}`] || !!busy[`uploadEditPostImages:${post.id}`]}
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="post-content">{post.content}</div>
                )}

                {!isEditing && <ImagesGrid images={post.images} variant="post" onOpen={openLightbox} />}

                {post.link && (
                  <a href="#" className="link-block" onClick={(e) => e.preventDefault()}>
                    {post.link.img && <img src={post.link.img} alt="link cover" className="link-img" />}
                    <div className="link-info">
                      <div className="link-title">{post.link.title}</div>
                      <div className="link-source">{post.link.source}</div>
                    </div>
                  </a>
                )}

                <div className="action-bar">
                  <button
                    className={`action-btn ${post.isLiked ? 'active' : ''}`}
                    onClick={() => handleLike(post.id)}
                    disabled={!!busy[`like:${post.id}`]}
                  >
                    <Heart size={18} fill={post.isLiked ? 'currentColor' : 'none'} />
                    {post.isLiked ? 'Đã thích' : 'Tán thưởng'} ({post.likes})
                  </button>

                  <button className="action-btn" onClick={() => openPostModal(post.id)}>
                    <MessageCircle size={18} /> Đàm đạo ({post.commentCount || 0})
                  </button>

                  {/* <button className="action-btn" onClick={() => setError('Share chưa được tích hợp.')}>
                    <Share2 size={18} /> Chia sẻ
                  </button> */}
                </div>

              </article>
            );
          })
        )}
      </div>

      {postModalPostId && (
        (() => {
          const activePost = posts.find((p) => p.id === postModalPostId);
          if (!activePost) return null;
          const activeStatus = String(activePost.status || '').toLowerCase();
          const activePublishedTime =
            activeStatus === 'approved'
              ? activePost.approvedAt || activePost.publishedAt || activePost.moderatedAt || activePost.createdAt
              : activePost.createdAt;
          const myId = currentUser?.id;
          const authorId = activePost.authorId;
          const isOwner =
            (typeof myId === 'string' || typeof myId === 'number') &&
              (typeof authorId === 'string' || typeof authorId === 'number')
              ? String(myId) === String(authorId)
              : false;
          const isEditing = editingPostId === activePost.id;

          return (
            <div className="post-modal-overlay" role="dialog" aria-modal="true" onClick={closePostModal}>
              <div className="post-modal" onClick={(e) => e.stopPropagation()}>
                <div className="post-modal-header">
                  <div className="post-modal-title">Bình luận</div>
                  <button type="button" className="post-modal-close" onClick={closePostModal} aria-label="Close">
                    <X size={20} />
                  </button>
                </div>

                <div className="post-modal-body">
                  <article className="post-card post-modal-card">
                    <div className="post-header">
                      <img src={activePost.avatar} alt={activePost.author} className="avatar" style={{ width: 40, height: 40 }} />
                      <div style={{ flex: 1 }}>
                        <div className="author-name">{activePost.author}</div>
                        <div className="post-meta">{timeAgo(activePublishedTime)}</div>
                      </div>
                      <div className="post-menu">
                        <button
                          className="post-menu-trigger"
                          type="button"
                          onClick={() => {
                            const pid = String(activePost.id);
                            setMenuOpenPostId((cur) => (String(cur) === pid ? null : pid));
                            setReportOpenPostId(null);
                          }}
                          aria-label="Post menu"
                        >
                          <MoreHorizontal size={20} />
                        </button>

                        {String(menuOpenPostId) === String(activePost.id) && (
                          <div className="post-menu-dropdown" role="menu">
                            {isOwner ? (
                              <>
                                <button
                                  type="button"
                                  className="post-menu-item"
                                  onClick={() => startEditPost(activePost)}
                                  disabled={!!busy[`updatePost:${activePost.id}`] || !!busy[`deletePost:${activePost.id}`]}
                                >
                                  Sửa bài
                                </button>
                                <button
                                  type="button"
                                  className="post-menu-item danger"
                                  onClick={() => handleDeletePost(activePost.id)}
                                  disabled={!!busy[`deletePost:${activePost.id}`]}
                                >
                                  Xóa bài
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="post-menu-item"
                                  onClick={() => openReport(activePost.id)}
                                  disabled={!!busy[`reportPost:${activePost.id}`] || !!reportedByMe?.[String(activePost.id)]}
                                >
                                  {reportedByMe?.[String(activePost.id)] ? 'Đã báo cáo' : 'Báo cáo'}
                                </button>

                                {String(reportOpenPostId) === String(activePost.id) && !reportedByMe?.[String(activePost.id)] ? (
                                  <div className="post-report-panel">
                                    <div className="post-report-label">Lý do</div>
                                    <select
                                      className="post-report-select"
                                      value={reportDrafts?.[String(activePost.id)]?.reason || ''}
                                      onChange={(e) =>
                                        setReportDrafts((s) => ({
                                          ...s,
                                          [String(activePost.id)]: {
                                            reason: e.target.value,
                                            note: s?.[String(activePost.id)]?.note || '',
                                          },
                                        }))
                                      }
                                    >
                                      <option value="">Chọn…</option>
                                      {REPORT_REASONS.map((r) => (
                                        <option key={r.value} value={r.value}>
                                          {r.label}
                                        </option>
                                      ))}
                                    </select>

                                    <div className="post-report-label" style={{ marginTop: 10 }}>
                                      Ghi chú (tuỳ chọn)
                                    </div>
                                    <textarea
                                      className="post-report-textarea"
                                      rows={3}
                                      value={reportDrafts?.[String(activePost.id)]?.note || ''}
                                      onChange={(e) =>
                                        setReportDrafts((s) => ({
                                          ...s,
                                          [String(activePost.id)]: {
                                            reason: s?.[String(activePost.id)]?.reason || '',
                                            note: e.target.value,
                                          },
                                        }))
                                      }
                                      placeholder="Mô tả thêm (nếu cần)…"
                                    />

                                    <div className="post-report-actions">
                                      <button
                                        type="button"
                                        className="post-edit-btn"
                                        onClick={closeReport}
                                        disabled={!!busy[`reportPost:${activePost.id}`]}
                                      >
                                        Huỷ
                                      </button>
                                      <button
                                        type="button"
                                        className="post-edit-btn primary"
                                        onClick={() => submitReport(activePost.id)}
                                        disabled={!!busy[`reportPost:${activePost.id}`]}
                                      >
                                        Gửi
                                      </button>
                                    </div>
                                  </div>
                                ) : null}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="post-edit">
                        <textarea
                          className="post-edit-textarea"
                          rows={4}
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                        />

                        <div className="post-edit-media">
                          <button
                            type="button"
                            className="composer-action"
                            onClick={pickEditPostImages}
                            disabled={!!busy[`updatePost:${activePost.id}`] || !!busy[`uploadEditPostImages:${activePost.id}`]}
                          >
                            <ImageIcon size={18} /> Ảnh
                          </button>
                        </div>

                        <EditImagesGrid
                          keptImages={editPostKeptImages}
                          newImages={editPostNewImages}
                          onRemoveKept={removeEditPostKeptImage}
                          onRemoveNew={removeEditPostNewImage}
                        />

                        <div className="post-edit-actions">
                          <button
                            type="button"
                            className="post-edit-btn primary"
                            onClick={() => handleUpdatePost(activePost.id)}
                            disabled={!!busy[`updatePost:${activePost.id}`] || !!busy[`uploadEditPostImages:${activePost.id}`]}
                          >
                            Lưu
                          </button>
                          <button
                            type="button"
                            className="post-edit-btn"
                            onClick={cancelEditPost}
                            disabled={!!busy[`updatePost:${activePost.id}`] || !!busy[`uploadEditPostImages:${activePost.id}`]}
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="post-content">{activePost.content}</div>
                    )}

                    {!isEditing && <ImagesGrid images={activePost.images} variant="post" onOpen={openLightbox} />}

                    <div className="action-bar">
                      <button
                        className={`action-btn ${activePost.isLiked ? 'active' : ''}`}
                        onClick={() => handleLike(activePost.id)}
                        disabled={!!busy[`like:${activePost.id}`]}
                      >
                        <Heart size={18} fill={activePost.isLiked ? 'currentColor' : 'none'} />
                        {activePost.isLiked ? 'Đã thích' : 'Tán thưởng'} ({activePost.likes})
                      </button>

                      <button className="action-btn" type="button" onClick={() => { }}>
                        <MessageCircle size={18} /> Đàm đạo ({activePost.commentCount || 0})
                      </button>
                    </div>

                    {renderCommentsForPost(activePost)}
                  </article>
                </div>
              </div>
            </div>
          );
        })()
      )}

      <Lightbox
        open={lightboxOpen}
        images={lightboxImages}
        index={lightboxIndex}
        setIndex={setLightboxIndex}
        onClose={closeLightbox}
        onPrev={showPrevLightbox}
        onNext={showNextLightbox}
      />
    </div>
  );
};

export default CommunityPage;