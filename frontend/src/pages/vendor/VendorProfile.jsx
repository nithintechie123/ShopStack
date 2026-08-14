import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getVendorProfile, updateVendorProfile, updateAvatar, removeAvatar } from '../../api/vendors';
import { uploadProductImage } from '../../api/upload';
import {
  Store,
  FileText,
  BadgeCheck,
  Percent,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  CalendarDays,
  ShieldCheck,
  Camera,
  Trash2,
} from 'lucide-react';

const STATUS_META = {
  APPROVED:         { label: 'Approved',         cls: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500',     Icon: CheckCircle2 },
  PENDING_APPROVAL: { label: 'Pending Approval',  cls: 'bg-accent-warning/10 border-accent-warning/25 text-accent-warning', Icon: Clock },
  REJECTED:         { label: 'Rejected',          cls: 'bg-accent-danger/10 border-accent-danger/25 text-accent-danger',  Icon: XCircle },
};

function formatDate(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function VendorProfile() {
  const { user, updateUser } = useAuth();

  const avatar = user?.profilePictureUrl || '';
  const [profile, setProfile]             = useState(null);
  const [storeName, setStoreName]         = useState('');
  const [description, setDescription]     = useState('');
  const [businessLicense, setBusinessLicense] = useState('');
  const [taxId, setTaxId]                 = useState('');

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [updating, setUpdating] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadProductImage(file);
      const url = res.data.imageUrl;
      await updateAvatar(url);
      updateUser({ profilePictureUrl: url });
      setSuccess('Profile picture updated successfully!');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      console.error("Failed to upload profile photo:", err);
      setError('Failed to upload profile photo.');
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar();
      updateUser({ profilePictureUrl: null });
      setSuccess('Profile picture removed successfully!');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      console.error("Failed to remove profile photo:", err);
      setError(err.response?.data?.error || 'Failed to remove profile photo.');
    }
  };

  useEffect(() => {
    let active = true;
    getVendorProfile()
      .then((res) => {
        if (active) {
          const p = res.data;
          setProfile(p);
          setStoreName(p.storeName || '');
          setDescription(p.description || '');
          setBusinessLicense(p.businessLicense || '');
          setTaxId(p.taxId || '');
        }
      })
      .catch((err) => console.error('Failed to fetch vendor profile:', err))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setUpdating(true);
    try {
      const res = await updateVendorProfile({ storeName, description, businessLicense, taxId });
      const p = res.data;
      setProfile(p);
      setStoreName(p.storeName || '');
      setDescription(p.description || '');
      setBusinessLicense(p.businessLicense || '');
      setTaxId(p.taxId || '');
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-text-muted">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium">Loading vendor profile…</p>
        </div>
      </div>
    );
  }

  const statusMeta = STATUS_META[profile?.status] || STATUS_META.PENDING_APPROVAL;
  const StatusIcon = statusMeta.Icon;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-8">
          <h1 className="gradient-text text-3xl font-extrabold tracking-tight">Vendor Profile</h1>
          <p className="text-sm text-text-secondary mt-1.5 font-medium">
            Manage your store details and business information
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="flex items-center gap-2.5 p-4 mb-6 rounded-xl text-sm bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 animate-in fade-in slide-in-from-top-2 duration-150">
            <CheckCircle2 size={16} className="shrink-0" />
            <span className="font-semibold">{success}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2.5 p-4 mb-6 rounded-xl text-sm bg-accent-danger/10 border border-accent-danger/25 text-accent-danger animate-in fade-in slide-in-from-top-2 duration-150">
            <AlertCircle size={16} className="shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Status & Info Cards */}
          <div className="flex flex-col gap-5">

             {/* Account Info Card */}
             <div className="p-5 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col gap-4 items-center">
               <div className="relative group w-20 h-20">
                 {avatar ? (
                   <img src={avatar} alt="Profile" className="w-full h-full rounded-2xl object-cover border border-glass-border shadow-md" />
                 ) : (
                   <div className="w-full h-full rounded-2xl bg-gradient-to-br from-accent-primary to-indigo-600 flex items-center justify-center font-display font-extrabold text-2xl text-white shadow-lg shadow-accent-primary/20">
                     {user?.firstName?.[0]}{user?.lastName?.[0]}
                   </div>
                 )}
                 <label className="absolute inset-0 bg-black/60 hover:bg-black/75 rounded-2xl flex flex-col items-center justify-center text-white text-[9px] font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                   <Camera size={16} className="mb-1" />
                   <span>Update</span>
                   <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                 </label>
               </div>
               {avatar && (
                 <button
                   type="button"
                   onClick={handleRemoveAvatar}
                   className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-accent-danger hover:text-white bg-accent-danger/10 hover:bg-accent-danger border border-accent-danger/20 hover:border-transparent px-2.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
                 >
                   <Trash2 size={11} /> Remove Photo
                 </button>
               )}
               <div className="text-center">
                 <p className="font-bold text-text-primary text-base">{user?.firstName} {user?.lastName}</p>
                 <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
                 <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-accent-primary/10 border border-accent-primary/25 text-accent-primary">
                   Vendor
                 </span>
               </div>
             </div>

            {/* Store Status Card */}
            <div className="p-5 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col gap-3">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Store Status</h3>
              <span className={`inline-flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg border ${statusMeta.cls}`}>
                <StatusIcon size={15} />
                {statusMeta.label}
              </span>
              {profile?.status === 'PENDING_APPROVAL' && (
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Your store is under review. You'll be notified once approved by the admin.
                </p>
              )}
            </div>

            {/* Commission & Dates */}
            <div className="p-5 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col gap-3">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Account Details</h3>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <Percent size={15} className="text-purple-500" />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Commission Rate</p>
                  <p className="text-sm font-bold text-text-primary">
                    {profile?.commissionRate != null
                      ? `${(parseFloat(profile.commissionRate) * 100).toFixed(0)}%`
                      : '—'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent-secondary/10 flex items-center justify-center shrink-0">
                  <CalendarDays size={15} className="text-accent-secondary" />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Member Since</p>
                  <p className="text-sm font-bold text-text-primary">{formatDate(profile?.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck size={15} className="text-accent-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Last Updated</p>
                  <p className="text-sm font-bold text-text-primary">{formatDate(profile?.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Edit Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col gap-6"
            >
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <Store size={18} className="text-accent-primary" />
                Store Information
              </h2>

              {/* Read-only: Account name & email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-glass-border/30">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Full Name</span>
                  <span className="text-sm font-semibold text-text-primary">{user?.firstName} {user?.lastName}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Email Address</span>
                  <span className="text-sm font-semibold text-text-primary">{user?.email}</span>
                </div>
              </div>

              {/* Store Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Store size={13} className="text-text-muted" /> Store Name *
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. TechGadget Store"
                  required
                  className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-colors duration-300 focus:border-accent-primary"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={13} className="text-text-muted" /> Store Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers what your store is about…"
                  rows={4}
                  className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-colors duration-300 focus:border-accent-primary resize-y"
                />
              </div>

              {/* Business License & Tax ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <BadgeCheck size={13} className="text-text-muted" /> Business License
                  </label>
                  <input
                    type="text"
                    value={businessLicense}
                    onChange={(e) => setBusinessLicense(e.target.value)}
                    placeholder="e.g. BL-2024-12345"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-colors duration-300 focus:border-accent-primary"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                    <BadgeCheck size={13} className="text-text-muted" /> Tax ID (GST/PAN)
                  </label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="e.g. GSTIN or PAN number"
                    className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-colors duration-300 focus:border-accent-primary"
                  />
                </div>
              </div>

              {/* Read-only commission info banner */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-accent-primary/5 border border-accent-primary/15">
                <Percent size={15} className="text-accent-primary mt-0.5 shrink-0" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  Your <span className="font-semibold text-text-primary">commission rate</span> and{' '}
                  <span className="font-semibold text-text-primary">store status</span> are managed by the platform admin
                  and cannot be changed here.
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={updating}
                  className="bg-gradient-to-r from-accent-primary to-indigo-600 hover:from-indigo-600 hover:to-accent-primary text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-lg shadow-accent-primary/10 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                >
                  {updating ? 'Saving Changes…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
