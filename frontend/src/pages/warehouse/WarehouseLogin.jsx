import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import styles from './warehouse.module.css';

export default function WarehouseLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    navigate('/warehouse/dashboard');
  };

  return (
    <div className={styles.pageContainer} style={{ padding: '60px 40px' }}>
      <div className={styles.pageHeader} style={{ alignItems: 'center', gap: '12px' }}>
        <div>
          <h1 className={styles.pageTitle}>Warehouse Login</h1>
          <p className={styles.pageSubtitle}>Sign in to access warehouse operations and fulfillment workflows.</p>
        </div>
      </div>

      <div className={styles.formCard} style={{ maxWidth: '520px', margin: '0 auto' }}>
        {error && <div className={styles.alertInfo}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <div className={styles.fieldGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <div style={{ position: 'relative', display: 'flex' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                id="email"
                name="email"
                type="email"
                className={styles.input}
                style={{ paddingLeft: '38px' }}
                value={form.email}
                onChange={handleChange}
                placeholder="warehouse@domain.com"
                required
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div style={{ position: 'relative', display: 'flex' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                style={{ paddingLeft: '38px', paddingRight: '38px' }}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className={`${styles.formActions} ${styles.fullWidth}`}> 
            <button type="submit" className={`${styles.actionButton} ${styles.primaryButton}`}>
              Login
            </button>
            <Link to="/" className={`${styles.actionButton} ${styles.secondaryButton}`}>
              Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
