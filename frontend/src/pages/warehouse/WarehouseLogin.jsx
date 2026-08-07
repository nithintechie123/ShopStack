import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function WarehouseLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(form.email.trim(), form.password);
      if (user.role === 'WAREHOUSE_STAFF') {
        navigate('/warehouse/dashboard');
      } else {
        setError('Unauthorized: Access restricted to warehouse staff.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-bg-primary relative overflow-hidden text-text-primary">
      {/* Ambient background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-glass-border bg-glass/40 backdrop-blur-xl shadow-2xl p-8 sm:p-10 flex flex-col justify-center">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors mb-6 group cursor-pointer">
          <ChevronLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
          <span>Back to Home</span>
        </Link>

        {/* Title */}
        <div className="mb-8">
          <span className="text-[10px] uppercase font-bold tracking-widest text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-3 py-1 rounded-full">
            Staff Portal
          </span>
          <h1 className="gradient-text text-3xl font-extrabold tracking-tight mt-3">
            Warehouse Login
          </h1>
          <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">
            Sign in to access warehouse operations and fulfillment workflows.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-accent-danger/10 border border-accent-danger/20 text-accent-danger text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
              Email
            </label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-text-muted" />
              <input
                id="email"
                name="email"
                type="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors text-text-primary"
                value={form.email}
                onChange={handleChange}
                placeholder="warehouse@domain.com"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-text-muted" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-glass-border bg-glass/5 text-sm placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors text-text-primary"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white font-bold text-sm shadow-md shadow-accent-primary/10 hover:shadow-lg hover:shadow-accent-primary/25 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-98 cursor-pointer disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
