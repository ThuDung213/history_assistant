import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/auth/useAuth'; // Dùng custom hook
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error, setError } = useAuth(); // Lấy hàm và state từ hook

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null); // Xóa lỗi khi nhập lại
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      await register(formData.username, formData.email, formData.password);
      navigate('/'); // Chuyển sang trang đăng nhập khi thành công
    } catch {
      // Lỗi đã được set trong hook, không cần xử lý thêm
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Đăng Ký Tài Khoản</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            name="username"
            placeholder="Tên đăng nhập"
            className="auth-input"
            value={formData.username}
            onChange={handleChange}
            required
          />
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
          <input
            type="password"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            className="auth-input"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng Ký'}
          </button>
        </form>
        <div className="auth-link">
          Đã có tài khoản? <Link to="/">Đăng nhập ngay</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;