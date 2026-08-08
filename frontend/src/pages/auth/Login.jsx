import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ShoppingBag, AlertCircle, ShieldAlert, X, Eye, EyeOff } from 'lucide-react';
import AuthCarousel from '../../components/auth/AuthCarousel';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuspendedModalOpen, setIsSuspendedModalOpen] = useState(false);
  const [suspendedErrorMsg, setSuspendedErrorMsg] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = form.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g. user@example.com).');
      return;
    }

    setLoading(true);
    try {
      const user = await login(cleanEmail, form.password);
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'VENDOR':
          navigate('/vendor');
          break;
        case 'WAREHOUSE_STAFF':
          navigate('/warehouse/dashboard');
          break;
        default:
          navigate('/');
          break;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Invalid email or password.';
      if (err.response?.status === 403) {
        setSuspendedErrorMsg(errorMsg);
        setIsSuspendedModalOpen(true);
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden bg-bg-primary">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-accent-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[35rem] h-[35rem] bg-accent-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl rounded-3xl border border-glass-border bg-glass/40 backdrop-blur-xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[650px] ">

        {/* Left Side: Info (5 cols on lg) */}
        <div className="hidden lg:block lg:col-span-5 relative overflow-hidden min-h-[680px]">
          <AuthCarousel />
        </div>

        {/* Right Side: Form (7 cols on lg) */}
        <div className="lg:col-span-7 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-white/20 backdrop-blur-md">
          {/* Mobile Brand Header */}
          <div className="flex flex-col items-center gap-2 mb-8 text-center lg:hidden">
            <div className="w-12 h-12 rounded-xl bg-accent-primary/10 flex items-center justify-center mb-1">
              <ShoppingBag size={28} className="text-accent-primary" />
            </div>
            <h1 className="gradient-text text-2xl font-extrabold tracking-tight">ShopStack</h1>
            <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Enterprise Multi-Vendor Platform</p>
          </div>

          <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-text-primary mb-1 font-display">Welcome Back</h2>
            <p className="text-sm text-text-secondary mb-6">Sign in to continue to your account</p>

            {error && (
              <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-lg text-sm bg-accent-danger/10 border border-accent-danger/25 text-accent-danger animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle size={17} className="shrink-0 text-accent-danger" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 pl-11 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm py-3 pl-11 pr-10 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-200 focus:outline-none flex items-center justify-center p-1 rounded-md hover:bg-black/5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end -mt-2">
                <Link to="/forgot-password" className="text-xs font-semibold text-accent-primary hover:text-indigo-600 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer py-3 rounded-lg bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white font-semibold text-sm shadow-lg shadow-accent-primary/10 hover:shadow-accent-primary/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none mt-2"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-text-muted mt-6">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-accent-primary hover:text-indigo-600 font-semibold transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>

      </div>

      {/* Account Suspended Modal */}
      {isSuspendedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-bg-primary border border-glass-border rounded-2xl overflow-hidden shadow-2xl text-text-primary p-6 flex flex-col items-center text-center backdrop-blur-md animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsSuspendedModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Warning Icon */}
            <div className="w-16 h-16 rounded-full bg-accent-danger/10 flex items-center justify-center mb-4 text-accent-danger border border-accent-danger/20 animate-bounce">
              <ShieldAlert size={36} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-text-primary mb-2 font-display">
              Account Suspended
            </h3>

            {/* Description */}
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              {suspendedErrorMsg || 'Your account has been suspended. Please contact the administrator.'}
            </p>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2">
              <a
                href="mailto:support@shopstack.com?subject=Account%20Suspension%20Appeal"
                className="w-full cursor-pointer py-2.5 rounded-lg bg-gradient-to-r from-accent-danger to-red-600 hover:from-red-600 hover:to-accent-danger text-white font-semibold text-sm shadow-md transition-all duration-300 transform hover:-translate-y-0.5 text-center"
              >
                Contact Support
              </a>
              <button
                onClick={() => setIsSuspendedModalOpen(false)}
                className="w-full cursor-pointer py-2.5 rounded-lg border border-glass-border hover:bg-black/5 text-text-secondary font-semibold text-sm transition-all duration-300"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
