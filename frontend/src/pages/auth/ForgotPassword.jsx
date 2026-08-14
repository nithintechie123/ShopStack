import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Inbox } from 'lucide-react';
import { forgotPassword, resetPassword } from '../../api/auth';
import { sendOtpEmail } from '../../api/email';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Request, 2 = Verify & Reset
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [devOtp, setDevOtp] = useState('');

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword(cleanEmail);
      // In development mode, the backend returns the token directly
      const otp = response.data?.resetToken;
      if (otp) {
        setDevOtp(otp);
        try {
          await sendOtpEmail(cleanEmail, otp);
        } catch (emailErr) {
          console.error("Failed to send OTP email via EmailJS:", emailErr);
          // Don't block the UI flow if the email fails, since the devOtp fallback is there
        }
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset link. Please verify your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Please enter the verification code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email.trim(), token.trim(), newPassword);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3500);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 relative overflow-hidden bg-bg-primary">
      {/* Decorative blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-accent-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[35rem] h-[35rem] bg-accent-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-glass-border bg-glass/40 backdrop-blur-xl shadow-2xl p-8 sm:p-10 flex flex-col justify-center">
        {/* Back to Login Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-accent-primary mb-6 transition-colors self-start"
        >
          <ArrowLeft size={14} />
          Back to Login
        </Link>

        {success ? (
          <div className="text-center py-6 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-accent-secondary/10 border border-accent-secondary/20 flex items-center justify-center mx-auto mb-4 text-accent-secondary animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2 font-display">Password Reset Successful!</h2>
            <p className="text-sm text-text-secondary mb-4">
              Your password has been successfully updated.
            </p>
            <p className="text-xs text-text-muted">
              Redirecting you to the login page in a few seconds...
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-1 font-display">
              {step === 1 ? 'Forgot Password' : 'Reset Password'}
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              {step === 1
                ? 'Enter your email address and we will generate a verification code for you.'
                : `We have simulated sending a verification OTP code to ${email}.`}
            </p>

            {error && (
              <div className="flex items-center gap-2.5 p-3.5 mb-6 rounded-lg text-sm bg-accent-danger/10 border border-accent-danger/25 text-accent-danger animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle size={17} className="shrink-0 text-accent-danger" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 pl-11 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full cursor-pointer py-3 rounded-lg bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white font-semibold text-sm shadow-lg shadow-accent-primary/10 hover:shadow-accent-primary/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none mt-2"
                  disabled={loading}
                >
                  {loading ? 'Sending Request...' : 'Send Verification Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="flex flex-col gap-5">
                {/* Simulated Email Intercept Notification */}
                {devOtp && (
                  <div className="p-4 rounded-xl border border-accent-primary/20 bg-accent-primary/10 backdrop-blur-md text-accent-primary mt-1 mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-accent-primary/20 rounded-lg text-accent-primary shrink-0">
                        <Inbox size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold flex items-center gap-1.5 text-text-primary">
                          Intercepted Mail (Local Environment)
                        </h4>
                        <p className="text-xs text-text-secondary mt-1">
                          No real mail server is configured. Copy the OTP generated below:
                        </p>
                        <div className="flex items-center gap-2 mt-2 bg-white/50 px-3 py-1.5 rounded-lg border border-glass-border font-mono text-base font-bold justify-between">
                          <span className="text-text-primary">{devOtp}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setToken(devOtp);
                              navigator.clipboard.writeText(devOtp);
                            }}
                            className="text-xs cursor-pointer py-1 px-2.5 rounded bg-accent-primary text-white font-semibold hover:bg-accent-primary-hover active:scale-95 transition-all"
                          >
                            Copy & Autofill
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="token" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Verification OTP Code
                  </label>
                  <input
                    id="token"
                    name="token"
                    type="text"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow font-mono text-center tracking-widest text-lg"
                    placeholder="123456"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="newPassword" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm py-3 pl-11 pr-10 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-200 focus:outline-none flex items-center justify-center p-1 rounded-md hover:bg-black/5"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmPassword" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm py-3 pl-11 pr-10 outline-none transition-all duration-300 placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary-glow"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors duration-200 focus:outline-none flex items-center justify-center p-1 rounded-md hover:bg-black/5"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full cursor-pointer py-3 rounded-lg bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white font-semibold text-sm shadow-lg shadow-accent-primary/10 hover:shadow-accent-primary/25 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none mt-2"
                  disabled={loading}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                    setDevOtp('');
                  }}
                  className="w-full cursor-pointer py-2 rounded-lg border border-glass-border hover:bg-black/5 text-text-secondary font-semibold text-xs transition-all duration-300"
                >
                  Go Back
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
