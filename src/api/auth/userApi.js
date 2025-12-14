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

  logout() {
    // BE: POST /users/logout (yêu cầu Authorization: Bearer <token>)
    return axiosClient.post(`${URL_PREFIX}/logout`);
  },
};

export default userApi;