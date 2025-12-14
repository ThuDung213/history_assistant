import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuth'; // Sử dụng custom hook
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error, setError } = useAuth(); // Lấy hàm và state từ hook

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null); // Xóa lỗi khi nhập lại
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(formData.email, formData.password);
      // Nếu login thành công thì chuyển trang
      navigate('/map');
      window.location.reload();
    } catch {
      // Lỗi đã được set trong hook, không cần xử lý thêm
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Đăng Nhập</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="auth-input"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            className="auth-input"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>
        <div className="auth-link">
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;