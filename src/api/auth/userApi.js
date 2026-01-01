import axiosClient from '../axiosClient';

const URL_PREFIX = '/users'; 

const userApi = {
  register(data) {
    // Backend yêu cầu: email, password, full_name
    // Frontend form đang có: username, email, password
    // -> Cần map 'username' thành 'full_name'
    return axiosClient.post(`${URL_PREFIX}/register`, {
      email: data.email,
      password: data.password,
      full_name: data.username 
    });
  },

  login(data) {
    // Backend yêu cầu JSON: { email, password }
    return axiosClient.post(`${URL_PREFIX}/login`, {
      email: data.email,
      password: data.password
    });
  },

  getProfile() {
    return axiosClient.get(`${URL_PREFIX}/me`);
  },

  updateProfile(data) {
    // Expected BE: PATCH /users/me (Authorization required)
    // Accepts: { full_name } (can be extended later)
    return axiosClient.patch(`${URL_PREFIX}/me`, data);
  },

  uploadAvatar(file) {
    // Expected BE: POST /users/me/avatar (multipart/form-data, Authorization required)
    // Form field: avatar
    const form = new FormData();
    form.append('avatar', file);
    return axiosClient.post(`${URL_PREFIX}/me/avatar`, form, {
      headers: {
        // Let browser set boundary
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  changePassword(data) {
    // Expected BE: POST /users/me/change-password (Authorization required)
    // Accepts: { old_password, new_password }
    return axiosClient.post(`${URL_PREFIX}/me/change-password`, data);
  },

  logout() {
    // BE: POST /users/logout (yêu cầu Authorization: Bearer <token>)
    return axiosClient.post(`${URL_PREFIX}/logout`);
  },
};

export default userApi;