import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerApi } from '../api/auth.api';
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name || name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password || password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      // All self-registered accounts are sales users by default
      const data = await registerApi({ name, email, password, role: 'sales' });
      login(data.token, data.user);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0D0D0D] p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#2AB0A6]/5 blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#2AB0A6]/5 blur-3xl" />

      <div className="glass-card w-full max-w-md p-8 md:p-10 animate-scale-in relative">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-[#2AB0A6] flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            SmartLeads
          </h1>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
            Create your account
          </h2>
          <p className="text-sm text-[#64748B] dark:text-[#CBD5E1]">
            Start managing your sales pipeline today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium mb-1.5">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
              className={`input ${errors.name ? 'input-error' : ''}`}
              placeholder="John Doe"
              autoComplete="name"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium mb-1.5">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
              className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@company.com"
              autoComplete="email"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: '' })); }}
                className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                placeholder="Min 8 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-3 text-base mt-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#64748B] dark:text-[#CBD5E1] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2AB0A6] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
