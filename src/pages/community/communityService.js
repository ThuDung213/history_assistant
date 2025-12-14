import communityApi from '../../api/auth/communityApi';
import { avatarFallback } from './communityUtils';

const unwrap = (res) => res?.data ?? res;

export async function listPosts({ limit = 20, signal } = {}) {
  const res = await communityApi.listPosts({ limit }, signal ? { signal } : undefined);
  const data = unwrap(res);
  const items = data?.items || [];
  return items.map((p) => ({
    id: p.id,
    authorId: p.authorId ?? p.author_id ?? null,
    author: p.author,
    avatar: p.avatar || avatarFallback(p.author),
    createdAt: p.createdAt,
    content: p.content,
    link: p.link || null,
    images: Array.isArray(p.images) ? p.images : [],
    likes: p.likes ?? 0,
    commentCount: p.commentCount ?? 0,
    isLiked: !!p.isLiked,
  }));
}

export async function uploadImages(files, options) {
  const res = await communityApi.uploadImages(files, options);
  const data = unwrap(res);
  return Array.isArray(data?.images) ? data.images : [];
}

export async function createPost({ content, images }) {
  const res = await communityApi.createPost({ content, images });
  return unwrap(res);
}

export async function updatePost(postId, { content, images }) {
  const res = await communityApi.updatePost(postId, { content, images });
  return unwrap(res);
}

export async function deletePost(postId) {
  const res = await communityApi.deletePost(postId);
  return unwrap(res);
}

export async function likeOrUnlikePost(postId, isCurrentlyLiked) {
  const res = isCurrentlyLiked ? await communityApi.unlikePost(postId) : await communityApi.likePost(postId);
  return unwrap(res);
}

export async function listComments(postId, { limit = 50, signal } = {}) {
  const res = await communityApi.listComments(postId, { limit }, signal ? { signal } : undefined);
  const data = unwrap(res);
  const items = data?.items || [];
  return items.map((c) => ({
    id: c.id,
    parentId: c.parentId ?? c.parent_id ?? null,
    authorId: c.authorId ?? c.author_id ?? null,
    author: c.author,
    avatar: c.avatar || avatarFallback(c.author),
    text: c.text,
    images: Array.isArray(c.images) ? c.images : [],
    createdAt: c.createdAt,
  }));
}

export async function createComment(postId, payload) {
  const res = await communityApi.createComment(postId, payload);
  return unwrap(res);
}

export async function updateComment(postId, commentId, payload) {
  const res = await communityApi.updateComment(postId, commentId, payload);
  return unwrap(res);
}

export async function deleteComment(postId, commentId) {
  const res = await communityApi.deleteComment(postId, commentId);
  return unwrap(res);
}
