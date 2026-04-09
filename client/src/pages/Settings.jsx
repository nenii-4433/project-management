import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import Sidebar from '../components/Sidebar';
import { 
  User, 
  Mail, 
  Lock, 
  Camera, 
  ShieldCheck, 
  Save, 
  Key, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Settings = () => {
  const { user, token, role, login } = useAuth();
  
  // Profile States
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password States
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);
    try {
      const { data } = await axios.put('/api/users/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update global context
      login(token, data);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      alert('Error updating profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    setPasswordError('');
    setPasswordLoading(true);
    setPasswordSuccess(false);

    try {
      await axios.put('/api/users/profile/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Error updating password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0c]">
      <Sidebar role={role} />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <header className="mb-12">
           <h1 className="text-4xl font-black text-white tracking-tight italic">System Settings</h1>
           <p className="text-gray-500 mt-2 font-medium">Manage your personal identity and platform security preferences.</p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
           {/* Profile Information */}
           <motion.section 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="glass rounded-[40px] border border-[#2d2d34] overflow-hidden"
           >
              <div className="p-8 border-b border-[#2d2d34] flex justify-between items-center bg-white/[0.02]">
                 <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <User className="text-blue-500" /> Account Profile
                 </h2>
                 <AnimatePresence>
                   {profileSuccess && (
                     <motion.div 
                       initial={{ opacity: 0, x: 10 }} 
                       animate={{ opacity: 1, x: 0 }} 
                       exit={{ opacity: 0 }}
                       className="text-emerald-500 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"
                     >
                        <CheckCircle2 size={14} /> Profile Synchronized
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>

              <form onSubmit={handleProfileUpdate} className="p-10 space-y-8">
                 <div className="flex flex-col items-center mb-4">
                    <div className="relative group cursor-pointer">
                       <div className="w-28 h-28 rounded-[36px] bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-2 border-dashed border-blue-500/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-500/50">
                          {profileData.avatarUrl ? (
                            <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="text-blue-500/40" size={32} />
                          )}
                       </div>
                       <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2.5 rounded-2xl shadow-xl border-4 border-[#0a0a0c] group-hover:scale-110 transition-transform">
                          <Plus size={16} />
                       </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-4">Avatar Identifier</span>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block px-1">Display Name</label>
                       <div className="relative">
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                          <input 
                            required
                            type="text" 
                            className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl pl-14 pr-6 py-4 text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                            value={profileData.name}
                            onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          />
                       </div>
                    </div>

                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block px-1">Email Connection</label>
                       <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                          <input 
                            required
                            type="email" 
                            className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl pl-14 pr-6 py-4 text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          />
                       </div>
                    </div>

                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block px-1">Avatar Resource URL</label>
                       <input 
                         type="text" 
                         className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-xs font-mono"
                         placeholder="https://images.unsplash.com/..."
                         value={profileData.avatarUrl}
                         onChange={(e) => setProfileData({...profileData, avatarUrl: e.target.value})}
                       />
                    </div>
                 </div>

                 <button 
                   type="submit" 
                   disabled={profileLoading}
                   className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl py-4 font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                 >
                    {profileLoading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Push Profile Updates</>}
                 </button>
              </form>
           </motion.section>

           {/* Security Settings */}
           <motion.section 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="glass rounded-[40px] border border-[#2d2d34] overflow-hidden"
           >
              <div className="p-8 border-b border-[#2d2d34] flex justify-between items-center bg-white/[0.02]">
                 <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <ShieldCheck className="text-purple-500" /> Platform Security
                 </h2>
                 <AnimatePresence>
                   {passwordSuccess && (
                     <motion.div 
                       initial={{ opacity: 0, x: 10 }} 
                       animate={{ opacity: 1, x: 0 }} 
                       exit={{ opacity: 0 }}
                       className="text-emerald-500 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"
                     >
                        <CheckCircle2 size={14} /> Password Rotated
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>

              <form onSubmit={handlePasswordChange} className="p-10 space-y-8">
                 <div className="bg-purple-600/5 p-6 rounded-3xl border border-purple-500/10 flex items-center gap-4">
                    <AlertCircle className="text-purple-400 shrink-0" size={24} />
                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic">
                       Updating your credentials will invalidate current sessions for security. Ensure your new sequence is memorized.
                    </p>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block px-1">Current Password</label>
                       <div className="relative">
                          <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                          <input 
                            required
                            type="password" 
                            className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl pl-14 pr-6 py-4 text-white focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block px-1">New Sequence</label>
                          <div className="relative">
                             <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                             <input 
                               required
                               type="password" 
                               className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl pl-14 pr-6 py-4 text-white focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                               value={passwordData.newPassword}
                               onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                             />
                          </div>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 block px-1">Verify New Sequence</label>
                          <div className="relative">
                             <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                             <input 
                               required
                               type="password" 
                               className="w-full bg-[#16161a] border border-[#2d2d34] rounded-2xl pl-14 pr-6 py-4 text-white focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
                               value={passwordData.confirmPassword}
                               onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                             />
                          </div>
                       </div>
                    </div>

                    {passwordError && (
                      <div className="flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest px-1">
                         <AlertCircle size={14} /> {passwordError}
                      </div>
                    )}
                 </div>

                 <button 
                   type="submit" 
                   disabled={passwordLoading}
                   className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-2xl py-4 font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95 flex items-center justify-center gap-2"
                 >
                    {passwordLoading ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={18} /> Rotate Secure Credentials</>}
                 </button>
              </form>
           </motion.section>
        </div>
      </main>
    </div>
  );
};

export default Settings;
