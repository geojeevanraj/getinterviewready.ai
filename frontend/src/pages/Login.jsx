import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: localStorage.getItem('rememberedEmail') || '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [rememberMe, setRememberMe] = useState(!!localStorage.getItem('rememberedEmail'));

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await login({ email, password });
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      setAlert({ type: 'success', message: 'Login successful! Redirecting...' });
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  // Email icon
  const EmailIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  // Lock icon
  const LockIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader 
            title="Welcome Back"
            subtitle="Login to your account"
          />

          <CardContent>
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ type: '', message: '' })}
            />

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="you@example.com"
                error={errors.email}
                leftIcon={<EmailIcon />}
                required
              />

              <Input
                label="Password"
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Enter your password"
                error={errors.password}
                leftIcon={<LockIcon />}
                required
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-2 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 rounded transition-colors"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setAlert({ type: 'info', message: 'Please contact the administrator to reset your password.' })}
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  Login
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 w-full">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
              >
                Register here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
