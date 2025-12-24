import axiosClient from '../axiosClient';

const URL_PREFIX = '/community';

const communityApi = {
  uploadImages(files, options = {}) {
    const formData = new FormData();
    (files || []).forEach((f) => formData.append('files', f));
    return axiosClient.post(`${URL_PREFIX}/uploads`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      ...options,
    });
  },

  listPosts(params = {}, options = {}) {
    return axiosClient.get(`${URL_PREFIX}/posts`, { params, ...options });
  },

  listMyPosts(params = {}, options = {}) {
    return axiosClient.get(`${URL_PREFIX}/posts/mine`, { params, ...options });
  },

  createPost(data) {
    return axiosClient.post(`${URL_PREFIX}/posts`, data);
  },

  updatePost(postId, data) {
    return axiosClient.patch(`${URL_PREFIX}/posts/${postId}`, data);
  },

  deletePost(postId) {
    return axiosClient.delete(`${URL_PREFIX}/posts/${postId}`);
  },

  likePost(postId) {
    return axiosClient.post(`${URL_PREFIX}/posts/${postId}/like`);
  },

  unlikePost(postId) {
    return axiosClient.delete(`${URL_PREFIX}/posts/${postId}/like`);
  },

  // User report / flag a post for moderation
  reportPost(postId, data) {
    return axiosClient.post(`${URL_PREFIX}/posts/${postId}/report`, data);
  },

  listComments(postId, params = {}, options = {}) {
    return axiosClient.get(`${URL_PREFIX}/posts/${postId}/comments`, { params, ...options });
  },

  createComment(postId, data) {
    return axiosClient.post(`${URL_PREFIX}/posts/${postId}/comments`, data);
  },

  updateComment(postId, commentId, data) {
    return axiosClient.patch(`${URL_PREFIX}/posts/${postId}/comments/${commentId}`, data);
  },

  deleteComment(postId, commentId) {
    return axiosClient.delete(`${URL_PREFIX}/posts/${postId}/comments/${commentId}`);
  },
};

export default communityApi;