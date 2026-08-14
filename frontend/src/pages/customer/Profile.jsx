import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCustomerProfile, updateCustomerProfile, updateAvatar, removeAvatar } from '../../api/vendors';
import { uploadProductImage } from '../../api/upload';
import { User, Phone, MapPin, CheckCircle2, AlertCircle, Camera, Trash2 } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  
  const avatar = user?.profilePictureUrl || '';
  const [phone, setPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      setTimeout(() => setSuccess(''), 3000);
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
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error("Failed to remove profile photo:", err);
      setError(err.response?.data?.error || 'Failed to remove profile photo.');
    }
  };

  useEffect(() => {
    let active = true;
    getCustomerProfile()
      .then((res) => {
        if (active) {
          setPhone(res.data.phone || '');
          setShippingAddress(res.data.shippingAddress || '');
          setBillingAddress(res.data.billingAddress || '');
        }
      })
      .catch((err) => {
        console.error("Failed to fetch customer profile:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (phone) {
      const cleanPhone = phone.trim();
      if (!/^\d{1,10}$/.test(cleanPhone)) {
        setError('Phone number must contain only numeric digits and not exceed 10 digits.');
        return;
      }
    }

    setUpdating(true);
    try {
      const data = { phone: phone ? phone.trim() : '', shippingAddress, billingAddress };
      const res = await updateCustomerProfile(data);
      setPhone(res.data.phone || '');
      setShippingAddress(res.data.shippingAddress || '');
      setBillingAddress(res.data.billingAddress || '');
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary py-16 text-center">
        <p className="text-sm text-text-muted">Loading profile details…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-10 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="gradient-text text-3xl font-extrabold tracking-tight">Account Profile</h1>
          <p className="text-sm text-text-secondary mt-1.5 font-medium">Keep your shipping contacts and address info up to date</p>
        </div>

        {/* Feedback alerts */}
        {success && (
          <div className="flex items-center gap-2.5 p-4 mb-6 rounded-xl text-sm bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 animate-in fade-in slide-in-from-top-2 duration-150">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{success}</span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2.5 p-4 mb-6 rounded-xl text-sm bg-accent-danger/10 border border-accent-danger/25 text-accent-danger animate-in fade-in slide-in-from-top-2 duration-150">
            <AlertCircle size={16} className="text-accent-danger shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Profile Picture Card */}
          <div className="flex flex-col gap-5">
            <div className="p-6 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col gap-4 items-center animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="relative group w-24 h-24">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full rounded-full object-cover border border-glass-border shadow-md" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-primary to-indigo-600 flex items-center justify-center font-display font-extrabold text-2xl text-white shadow-md">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                )}
                <label className="absolute inset-0 bg-black/60 hover:bg-black/75 rounded-full flex flex-col items-center justify-center text-white text-[10px] font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                  <Camera size={16} className="mb-1" />
                  <span>Update</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent-danger hover:text-white bg-accent-danger/10 hover:bg-accent-danger border border-accent-danger/20 hover:border-transparent px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
                >
                  <Trash2 size={12} /> Remove Photo
                </button>
              )}
              <div className="text-center">
                <p className="font-bold text-text-primary text-base">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-text-muted mt-0.5">{user?.email}</p>
                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-accent-secondary/10 border border-accent-secondary/25 text-accent-secondary">
                  {user?.role === 'WAREHOUSE_STAFF' ? 'Warehouse Staff' : user?.role?.charAt(0) + user?.role?.slice(1).toLowerCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Edit Profile Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-xl border border-glass-border bg-glass/10 backdrop-blur-md flex flex-col gap-6">
              {/* Read-only User Details */}
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

              {/* Editable Fields */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Phone size={14} className="text-text-muted" /> Phone Number
                </label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="e.g. 9988776655" 
                  className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-colors duration-300 focus:border-accent-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={14} className="text-text-muted" /> Shipping Address
                </label>
                <textarea 
                  value={shippingAddress} 
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Where should your orders be delivered?" 
                  rows={3}
                  className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-colors duration-300 focus:border-accent-primary resize-y"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={14} className="text-text-muted" /> Billing Address
                </label>
                <textarea 
                  value={billingAddress} 
                  onChange={(e) => setBillingAddress(e.target.value)}
                  placeholder="Address for payment billing info (leave empty if same as shipping)" 
                  rows={3}
                  className="w-full bg-bg-tertiary/50 border border-glass-border rounded-lg text-text-primary text-sm px-4 py-3 outline-none transition-colors duration-300 focus:border-accent-primary resize-y"
                />
              </div>

              <div className="pt-2">
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
