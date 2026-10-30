import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../icons/Icons';

// [MODIFIED] Profile drawer keeps its 75% width with a more compact, professional visual scale.
const ProfilePanel = () => {
  const {
    userProfile, theme, isDarkMode, dailyUsage, setShowProfileMenu,
    handleLogout, setUserProfile, showToast,
  } = useApp();

  const [activeDialog, setActiveDialog] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    storeName: userProfile?.storeName || '',
    email: userProfile?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (!userProfile) return null;

  const fullName = [userProfile.firstName, userProfile.lastName].filter(Boolean).join(' ') || 'Pengguna AIDO';
  const initials = fullName.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
  const isAdmin = !!userProfile.isAdmin;
  const isPremium = isAdmin || userProfile.tier === 'PRO' || userProfile.tier === 'PREMIUM';
  const usageCount = dailyUsage?.count || 0;
  const usageLimit = 10;
  const usagePercent = isPremium ? 100 : Math.min((usageCount / usageLimit) * 100, 100);
  const inputClass = `w-full rounded-xl border px-3 py-2.5 text-[13px] outline-none transition focus:ring-2 ${isDarkMode ? 'border-[#303A46] bg-[#11171E] text-[#F1F3F5] placeholder:text-[#77818D] focus:ring-[#F07845]/30' : 'border-gray-200 bg-white text-gray-800 placeholder:text-gray-400 focus:ring-[#df6a49]/20'}`;

  const closeDialog = () => {
    setActiveDialog('');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(profileForm),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Gagal memperbarui profil.');
      setUserProfile(result.user);
      setActiveDialog('');
      showToast('Profil berhasil diperbarui.', 'success');
    } catch (error) {
      showToast(error.message || 'Gagal memperbarui profil.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Konfirmasi password baru tidak sama.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showToast('Password baru minimal 8 karakter.', 'error');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Gagal mengganti password.');
      closeDialog();
      showToast('Password berhasil diperbarui.', 'success');
    } catch (error) {
      showToast(error.message || 'Gagal mengganti password.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const ActionRow = ({ icon: Icon, title, description, onClick, danger = false }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all active:scale-[0.99] ${isDarkMode ? 'border-[#28313B] bg-[#1A2028] hover:bg-[#202833]' : 'border-white/70 bg-[#e7ebf0] hover:bg-white'} ${theme.shadowOut}`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${danger ? 'bg-red-500/10 text-red-400' : isDarkMode ? 'bg-[#242D37] text-[#C1CAD4]' : 'bg-white/70 text-gray-600'}`}>
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-xs font-bold ${danger ? 'text-red-400' : theme.textPrimary}`}>{title}</span>
        <span className={`mt-0.5 block text-[10px] ${theme.textSecondary}`}>{description}</span>
      </span>
      <Icons.ChevronRight size={15} />
    </button>
  );

  const Dialog = ({ title, subtitle, children, onSubmit }) => (
    <div className="absolute inset-0 z-[130] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className={`w-full max-w-[390px] rounded-2xl border p-4 shadow-2xl ${isDarkMode ? 'border-[#303A46] bg-[#1A2028]' : 'border-white bg-[#edf1f6]'}`}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className={`text-sm font-extrabold ${theme.textPrimary}`}>{title}</h3>
            <p className={`mt-1 text-[11px] ${theme.textSecondary}`}>{subtitle}</p>
          </div>
          <button type="button" onClick={closeDialog} aria-label="Tutup dialog" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${theme.bgContainer} ${theme.shadowOut} ${theme.textSecondary}`}>
            <Icons.X size={16} />
          </button>
        </div>
        {onSubmit ? <form onSubmit={onSubmit} className="space-y-3">{children}</form> : <div className="space-y-4">{children}</div>}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      <button
        type="button"
        aria-label="Tutup profil"
        onClick={() => setShowProfileMenu(false)}
        className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
      />
      <section className={`relative flex h-full w-[75vw] max-w-[520px] flex-col overflow-hidden border-l ${isDarkMode ? 'border-[#2A333E] bg-[#141A21]' : 'border-white bg-[#e8edf3]'} shadow-[-18px_0_55px_rgba(0,0,0,0.30)] animate-in slide-in-from-right duration-300`}>
        <div className="flex items-center justify-between px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#F07845]">Akun Saya</p>
            <h2 className={`mt-1 text-lg font-black ${theme.textPrimary}`}>Profil</h2>
          </div>
          <button type="button" onClick={() => setShowProfileMenu(false)} aria-label="Tutup" className={`flex h-9 w-9 items-center justify-center rounded-full ${theme.bgContainer} ${theme.shadowOut} ${theme.textSecondary}`}>
            <Icons.X size={18} />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-4 pb-5 pt-2">
          {/* [MODIFIED] Avatar initials are a working visual fallback; profile details are editable below. */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFAA62] via-[#F07845] to-[#C84427] p-[3px] shadow-[0_0_24px_rgba(240,120,69,0.22)]">
              <div className={`flex h-full w-full items-center justify-center rounded-full text-lg font-black tracking-wide ${isDarkMode ? 'bg-[#202832] text-[#FFE0CB]' : 'bg-[#f8f4ef] text-[#C95732]'}`}>{initials}</div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={`max-w-full truncate text-base font-extrabold ${theme.textPrimary}`}>{fullName}</h3>
                <span className={`rounded-full px-2 py-1 text-[9px] font-extrabold tracking-wider ${isAdmin ? 'bg-violet-500/15 text-violet-300' : isPremium ? 'bg-orange-500/15 text-orange-300' : 'bg-slate-500/15 text-slate-400'}`}>{isAdmin ? 'ADMIN' : isPremium ? 'PREMIUM' : 'FREE'}</span>
              </div>
              <p className="mt-1 truncate text-xs font-semibold text-[#F07845]">{userProfile.storeName || 'Merchant AIDO'}</p>
              <p className={`mt-1 truncate text-[11px] ${theme.textSecondary}`}>{userProfile.email || userProfile.username || 'Email belum tersedia'}</p>
            </div>
          </div>

          {/* [ADDED] Membership and usage overview. */}
          <div className={`overflow-hidden rounded-2xl border p-3.5 ${isDarkMode ? 'border-[#7B432D]/60 bg-gradient-to-br from-[#39271F] via-[#282329] to-[#1C222A]' : 'border-orange-200 bg-gradient-to-br from-orange-50 to-white'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFB36E] to-[#E75B2D] text-white shadow-lg shadow-orange-900/20"><Icons.Sparkles size={20} /></span>
                <div>
                  <p className={`text-sm font-extrabold ${theme.textPrimary}`}>{isAdmin ? 'Admin Plan' : isPremium ? 'Premium Plan' : 'Free Plan'}</p>
                  <p className={`mt-0.5 text-[11px] ${theme.textSecondary}`}>{isAdmin ? 'Akses administrator tanpa batas' : isPremium ? 'Akses premium aktif' : 'Paket gratis untuk mulai berjualan'}</p>
                </div>
              </div>
              <span className="rounded-full border border-orange-400/30 bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold text-[#F39A68]">{isAdmin ? 'ADMIN' : isPremium ? 'AKTIF' : 'GRATIS'}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <p className={`text-xs font-semibold ${theme.textPrimary}`}>Penggunaan kalkulasi hari ini</p>
              <p className="text-xs font-bold text-[#F07845]">{isPremium ? '∞' : usageCount} <span className={theme.textSecondary}>/ {isPremium ? '∞' : usageLimit}</span></p>
            </div>
            <div className={`mt-2 h-1.5 overflow-hidden rounded-full ${isDarkMode ? 'bg-[#11161C]' : 'bg-orange-100'}`}>
              <div className="h-full rounded-full bg-gradient-to-r from-[#FF9B52] to-[#E94D27] transition-all duration-500" style={{ width: `${usagePercent}%` }} />
            </div>
            <p className={`mt-2 text-[10px] ${theme.textSecondary}`}>{isPremium ? 'Akun ini memiliki akses kalkulasi tanpa batas.' : 'Batas 10 kalkulasi per hari. Kuota direset setiap hari.'}</p>
          </div>

          {!isPremium && (
            <button type="button" onClick={() => setActiveDialog('upgrade')} className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-[#FF984F] to-[#E94D27] px-3.5 py-3 text-left text-white shadow-[0_8px_22px_rgba(226,83,39,0.22)] transition-all active:scale-[0.99]">
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20"><Icons.Sparkles size={20} /></span>
                <span><span className="block text-[13px] font-bold">Upgrade ke Premium</span><span className="mt-0.5 block text-[10px] text-white/80">Lihat informasi paket Premium</span></span>
              </span>
              <Icons.ChevronRight size={19} />
            </button>
          )}

          <div className="space-y-1.5">
            <p className={`px-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${theme.textSecondary}`}>Akun</p>
            <ActionRow icon={Icons.User} title="Edit Profil" description="Ubah nama, email, dan nama toko" onClick={() => setActiveDialog('profile')} />
            <ActionRow icon={Icons.Lock} title="Ganti Password" description="Perbarui keamanan akun Anda" onClick={() => setActiveDialog('password')} />
          </div>

          <div className="space-y-1.5">
            <p className={`px-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${theme.textSecondary}`}>Dukungan</p>
            <ActionRow icon={Icons.Shield} title="Bantuan & Dukungan" description="Panduan singkat penggunaan AIDO" onClick={() => setActiveDialog('help')} />
          </div>

          <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl border border-red-500/25 bg-red-500/[0.07] px-3 py-2.5 text-left transition-all hover:bg-red-500/10 active:scale-[0.99]">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400"><Icons.LogOut size={18} /></span>
            <span className="min-w-0 flex-1"><span className="block text-xs font-bold text-red-400">Logout</span><span className="mt-0.5 block text-[10px] text-red-300/70">Keluar dari akun AIDO</span></span>
            <Icons.ChevronRight size={17} className="text-red-400" />
          </button>
        </div>

        {/* [ADDED] Functional profile, password, help, and upgrade dialogs. */}
        {activeDialog === 'profile' && (
          <Dialog title="Edit Profil" subtitle="Perubahan akan disimpan ke akun Anda." onSubmit={saveProfile}>
            <label className={`block text-xs font-semibold ${theme.textSecondary}`}>Nama depan<input className={`${inputClass} mt-1`} value={profileForm.firstName} onChange={(event) => setProfileForm((prev) => ({ ...prev, firstName: event.target.value }))} maxLength={100} required /></label>
            <label className={`block text-xs font-semibold ${theme.textSecondary}`}>Nama belakang<input className={`${inputClass} mt-1`} value={profileForm.lastName} onChange={(event) => setProfileForm((prev) => ({ ...prev, lastName: event.target.value }))} maxLength={100} /></label>
            <label className={`block text-xs font-semibold ${theme.textSecondary}`}>Nama toko<input className={`${inputClass} mt-1`} value={profileForm.storeName} onChange={(event) => setProfileForm((prev) => ({ ...prev, storeName: event.target.value }))} maxLength={150} /></label>
            <label className={`block text-xs font-semibold ${theme.textSecondary}`}>Email<input type="email" className={`${inputClass} mt-1`} value={profileForm.email} onChange={(event) => setProfileForm((prev) => ({ ...prev, email: event.target.value }))} maxLength={255} required /></label>
            <button disabled={saving} className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#FF984F] to-[#E94D27] px-3.5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60">{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
          </Dialog>
        )}

        {activeDialog === 'password' && (
          <Dialog title="Ganti Password" subtitle="Masukkan password lama dan password baru." onSubmit={changePassword}>
            <label className={`block text-xs font-semibold ${theme.textSecondary}`}>Password saat ini<input type="password" autoComplete="current-password" className={`${inputClass} mt-1`} value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))} required /></label>
            <label className={`block text-xs font-semibold ${theme.textSecondary}`}>Password baru<input type="password" autoComplete="new-password" className={`${inputClass} mt-1`} value={passwordForm.newPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))} minLength={8} maxLength={128} required /></label>
            <label className={`block text-xs font-semibold ${theme.textSecondary}`}>Konfirmasi password baru<input type="password" autoComplete="new-password" className={`${inputClass} mt-1`} value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} minLength={8} maxLength={128} required /></label>
            <button disabled={saving} className="mt-2 w-full rounded-xl bg-gradient-to-r from-[#FF984F] to-[#E94D27] px-3.5 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60">{saving ? 'Memproses...' : 'Perbarui Password'}</button>
          </Dialog>
        )}

        {activeDialog === 'help' && (
          <Dialog title="Bantuan AIDO" subtitle="Panduan singkat penggunaan aplikasi.">
            <div className={`space-y-3 text-xs leading-relaxed ${theme.textSecondary}`}>
              <div><p className={`font-bold ${theme.textPrimary}`}>Kalkulator</p><p>Masukkan harga net, pilih marketplace, lalu jalankan kalkulasi untuk melihat harga jual.</p></div>
              <div><p className={`font-bold ${theme.textPrimary}`}>Menu tersimpan</p><p>Simpan nama menu dan harga agar bisa dipakai kembali tanpa mengetik ulang.</p></div>
              <div><p className={`font-bold ${theme.textPrimary}`}>Riwayat</p><p>Hasil kalkulasi tersimpan otomatis pada akun dan dapat dicari kembali.</p></div>
              <div><p className={`font-bold ${theme.textPrimary}`}>Akun</p><p>Ubah detail akun atau password dari menu profil. Jaga password Anda dan jangan membagikan kode akses.</p></div>
            </div>
            <button type="button" onClick={closeDialog} className="w-full rounded-xl bg-[#E96A3D] px-3.5 py-2.5 text-[13px] font-semibold text-white">Mengerti</button>
          </Dialog>
        )}

        {activeDialog === 'upgrade' && (
          <Dialog title="AIDO Premium" subtitle="Informasi paket berlangganan.">
            <div className={`rounded-2xl p-4 ${isDarkMode ? 'bg-[#11171E]' : 'bg-white'}`}>
              <p className={`text-sm font-extrabold ${theme.textPrimary}`}>Kalkulasi tanpa batas</p>
              <p className={`mt-1 text-[11px] leading-relaxed ${theme.textSecondary}`}>Paket Premium akan membuka penggunaan kalkulator tanpa batas. Aktivasi pembayaran belum dihubungkan, jadi akun belum akan berubah menjadi Premium dari tombol ini.</p>
            </div>
            <button type="button" onClick={closeDialog} className="w-full rounded-xl bg-[#E96A3D] px-3.5 py-2.5 text-[13px] font-semibold text-white">Tutup</button>
          </Dialog>
        )}
      </section>
    </div>
  );
};

export default ProfilePanel;
