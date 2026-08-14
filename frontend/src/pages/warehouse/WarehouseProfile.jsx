import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadProductImage } from '../../api/upload';
import { updateAvatar, removeAvatar } from '../../api/vendors';
import { Camera, Trash2, User, ShieldCheck, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function WarehouseProfile() {
  const { user, updateUser } = useAuth();
  const avatar = user?.profilePictureUrl || '';
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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
      setTimeout(() => setError(''), 3500);
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
      setTimeout(() => setError(''), 3500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <span className="text-[10px] uppercase font-bold tracking-widest text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-3 py-1 rounded-full">
          Fulfillment Network Staff
        </span>
        <h1 className="gradient-text text-3xl font-extrabold tracking-tight mt-3">My Profile</h1>
        <p className="text-sm text-text-secondary mt-1.5 font-medium">
          View your staff account details and customize your avatar
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Avatar Management Card */}
        <div className="p-6 rounded-2xl border border-glass-border bg-glass/5 flex flex-col gap-4 items-center justify-center shadow-sm">
          <div className="relative group w-24 h-24">
            {avatar ? (
              <img src={avatar} alt="Profile" className="w-full h-full rounded-2xl object-cover border border-glass-border shadow-md" />
            ) : (
              <div className="w-full h-full rounded-2xl bg-gradient-to-br from-accent-primary to-indigo-600 flex items-center justify-center font-display font-extrabold text-2xl text-white shadow-lg shadow-accent-primary/20">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            )}
            <label className="absolute inset-0 bg-black/60 hover:bg-black/75 rounded-2xl flex flex-col items-center justify-center text-white text-[10px] font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
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
          <div className="text-center mt-2">
            <p className="font-bold text-text-primary text-base">{user?.firstName} {user?.lastName}</p>
            <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-accent-primary/10 border border-accent-primary/25 text-accent-primary">
              Warehouse Staff
            </span>
          </div>
        </div>

        {/* Right: Info Card */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl border border-glass-border bg-glass/5 flex flex-col gap-6 shadow-sm">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <User size={18} className="text-accent-primary" />
            Account Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-5 border-b border-glass-border/30">
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1">
                <User size={12} /> First Name
              </span>
              <span className="text-sm font-semibold text-text-primary bg-bg-tertiary/30 px-3.5 py-2.5 rounded-lg border border-glass-border/20">{user?.firstName || '—'}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1">
                <User size={12} /> Last Name
              </span>
              <span className="text-sm font-semibold text-text-primary bg-bg-tertiary/30 px-3.5 py-2.5 rounded-lg border border-glass-border/20">{user?.lastName || '—'}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1">
              <Mail size={12} /> Email Address
            </span>
            <span className="text-sm font-semibold text-text-primary bg-bg-tertiary/30 px-3.5 py-2.5 rounded-lg border border-glass-border/20">{user?.email || '—'}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck size={12} /> Role / Access Permissions
            </span>
            <span className="text-xs font-semibold text-text-primary bg-bg-tertiary/30 px-3.5 py-2.5 rounded-lg border border-glass-border/20">
              WAREHOUSE_STAFF (Fulfillment, Inventory Management, Pick & Pack, Receiving)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
