import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }
    
    if (!isLogin && !formData.name) {
      setError('Name is required for signup');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    return true;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  console.log('🔄 Form submitted with data:', { 
    isLogin, 
    email: formData.email, 
    name: formData.name || 'N/A',
    passwordLength: formData.password.length 
  });

  if (!validateForm()) return;

  setLoading(true);

  try {
    console.log('📡 Making API request...');
    const response = isLogin 
      ? await authAPI.login({ email: formData.email, password: formData.password })
      : await authAPI.signup(formData);

    console.log('✅ API response received:', response.data);
    login(response.data.user, response.data.token);
    navigate('/dashboard');
  } catch (error) {
    console.error('❌ API error:', error);
    console.error('Error response:', error.response?.data);
    setError(error.response?.data?.message || 'An error occurred');
  } finally {
    setLoading(false);
  }
};

return (
  <div className="auth-container">
    <div className="auth-card">
      <h2>{isLogin ? 'Welcome back' : 'Create account'}</h2>
      <p>Personal Library Management</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your full name"
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your password"
            />
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>

        <div className="auth-toggle">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ name: '', email: '', password: '' });
            }}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

};

export default Login;
