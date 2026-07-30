import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User, Store, ShoppingBag, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import AuthCarousel from '../../components/auth/AuthCarousel';

const INITIAL = {
  firstName: '', lastName: '', email: '', password: '',
  role: 'CUSTOMER', storeName: '', storeDescription: '',
  businessLicense: '', taxId: '',
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = form.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g. user@example.com).');
      return;
    }

    setLoading(true);
    try {
      const registrationData = { ...form, email: cleanEmail };
      await register(registrationData);
      setSuccess('Account created! You can now sign in.');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden bg-bg-primary">
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-accent-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[35rem] h-[35rem] bg-accent-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl rounded-3xl border border-glass-border bg-glass/40 backdrop-blur-xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-in fade-in zoom-in-95 duration-500 min-h-[650px]">

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

          <div className="w-full max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-text-primary mb-1 font-display">Create Your Account</h2>
            <p className="text-sm text-text-secondary mb-6 font-medium">Join the enterprise marketplace platform</p>

            {/* Role Selector */}
            <div className="flex gap-3 mb-6">
              {['CUSTOMER', 'VENDOR'].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg border text-sm font-semibold transition-all duration-300 cursor-pointer ${form.role === r
                      ? 'border-accent-primary bg-accent-primary/10 text-accent-primary shadow-sm'
                      : 'border-glass-border bg-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                    }`}
                  onClick={() => setForm((p) => ({ ...p, role: r }))}
                >
                  {r === 'CUSTOMER' ? <User size={16} /> : <Store size={16} />}
                  <span>{r === 'CUSTOMER' ? 'Customer' : 'Vendor / Seller'}</span>
                </button>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-lg text-sm bg-accent-danger/10 border border-accent-danger/25 text-accent-danger animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle size={17} className="shrink-0 text-accent-danger" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-lg text-sm bg-accent-secondary/10 border border-accent-secondary/25 text-accent-secondary animate-in fade-in slide-in-from-top-1 duration-200">
                <CheckCircle size={17} className="shrink-0 text-accent-secondary" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="firstName" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">First Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      id="firstName"
                      name="firstName"
                      className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 pl-11 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow"
                      placeholder="John"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lastName" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Last Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      id="lastName"
                      name="lastName"
                      className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 pl-11 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow"
                      placeholder="Doe"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-email" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 pl-11 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-password" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm py-3 pl-11 pr-10 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-200 focus:outline-none flex items-center justify-center p-1 rounded-md hover:bg-black/5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {form.role === 'VENDOR' && (
                <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-5 flex flex-col gap-4 mt-1">
                  <div className="text-xs font-bold text-accent-primary uppercase tracking-widest">Store Information</div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="storeName" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Store Name *</label>
                    <div className="relative">
                      <Store size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        id="storeName"
                        name="storeName"
                        className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 pl-11 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow"
                        placeholder="My Awesome Store"
                        value={form.storeName}
                        onChange={handleChange}
                        required={form.role === 'VENDOR'}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="storeDescription" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Store Description</label>
                    <textarea
                      id="storeDescription"
                      name="storeDescription"
                      className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow resize-y"
                      placeholder="Tell customers about your store…"
                      rows={3}
                      value={form.storeDescription}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="businessLicense" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Business License</label>
                      <input
                        id="businessLicense"
                        name="businessLicense"
                        className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow"
                        placeholder="License No."
                        value={form.businessLicense}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="taxId" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Tax ID</label>
                      <input
                        id="taxId"
                        name="taxId"
                        className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow"
                        placeholder="TAX-123456"
                        value={form.taxId}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full cursor-pointer py-3.5 rounded-lg bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white font-semibold text-sm shadow-lg shadow-accent-primary/10 hover:shadow-accent-primary/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none mt-2"
                disabled={loading}
              >
                {loading ? 'Creating Account…' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-text-muted mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-primary hover:text-indigo-600 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
