import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', message: '' });

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      await register({ name, email, password });
      setAlert({ type: 'success', message: 'Registration successful! Redirecting...' });
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  // User icon
  const UserIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

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
            title="Create Account"
            subtitle="Join our AI Interview Platform"
          />

          <CardContent>
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ type: '', message: '' })}
            />

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={name}
                onChange={handleChange}
                placeholder="John Doe"
                error={errors.name}
                leftIcon={<UserIcon />}
                required
              />

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
                placeholder="At least 6 characters"
                error={errors.password}
                leftIcon={<LockIcon />}
                helperText="Must be at least 6 characters"
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                error={errors.confirmPassword}
                leftIcon={<LockIcon />}
                required
              />

              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                  Create Account
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 w-full">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
              >
                Login here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
