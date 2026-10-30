import { useApp } from '../../context/AppContext';
import { Icons } from '../icons/Icons';

// [ADDED] Dedicated profile panel keeps account actions in one place without duplicating theme controls.
const ProfilePanel = () => {
  const {
    userProfile, theme, isDarkMode, dailyUsage, setShowProfileMenu,
    handleLogout, showToast,
  } = useApp();

  if (!userProfile) return null;

  const fullName = [userProfile.firstName, userProfile.lastName].filter(Boolean).join(' ') || 'Pengguna AIDO';
  const initials = fullName.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
  const isAdmin = !!userProfile.isAdmin;
  const isPremium = isAdmin || userProfile.tier === 'PRO' || userProfile.tier === 'PREMIUM';
  const usageCount = dailyUsage?.count || 0;
  const usageLimit = 10;
  const usagePercent = isAdmin ? 100 : Math.min((usageCount / usageLimit) * 100, 100);

  const showUnavailable = (feature) => showToast(`${feature} belum tersedia. Perlu integrasi backend.`, 'info');

  const ActionRow = ({ icon: Icon, title, description, onClick, danger = false }) => (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3.5 text-left transition-all active:scale-[0.99] ${isDarkMode ? 'border-[#28313B] bg-[#1A2028] hover:bg-[#202833]' : 'border-white/70 bg-[#e7ebf0] hover:bg-white'} ${theme.shadowOut}`}
    >
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${danger ? 'bg-red-500/10 text-red-400' : isDarkMode ? 'bg-[#242D37] text-[#C1CAD4]' : 'bg-white/70 text-gray-600'}`}>
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-[13px] font-bold ${danger ? 'text-red-400' : theme.textPrimary}`}>{title}</span>
        <span className={`mt-0.5 block text-[11px] ${theme.textSecondary}`}>{description}</span>
      </span>
      <Icons.ChevronRight size={17} />
    </button>
  );

  return (
    <div className="fixed inset-0 z-[120] flex justify-end">
      <button
        type="button"
        aria-label="Tutup profil"
        onClick={() => setShowProfileMenu(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
      />
      <section className={`relative flex h-full w-full max-w-[440px] flex-col overflow-hidden border-l ${isDarkMode ? 'border-[#2A333E] bg-[#141A21]' : 'border-white bg-[#e8edf3]'} shadow-[-18px_0_55px_rgba(0,0,0,0.35)] animate-in slide-in-from-right duration-300`}>
        <div className="flex items-center justify-between px-5 pb-3 pt-[max(1.25rem,env(safe-area-inset-top))]">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#F07845]">Akun Saya</p>
            <h2 className={`mt-1 text-xl font-black ${theme.textPrimary}`}>Profil</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowProfileMenu(false)}
            aria-label="Tutup"
            className={`flex h-10 w-10 items-center justify-center rounded-full ${theme.bgContainer} ${theme.shadowOut} ${theme.textSecondary}`}
          >
            <Icons.X size={18} />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 space-y-5 overflow-y-auto px-5 pb-7 pt-2">
          {/* [ADDED] Default initials avatar works without requiring an image upload service. */}
          <div className="flex items-center gap-4 py-2">
            <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFAA62] via-[#F07845] to-[#C84427] p-[3px] shadow-[0_0_24px_rgba(240,120,69,0.22)]">
              <div className={`flex h-full w-full items-center justify-center rounded-full text-xl font-black tracking-wide ${isDarkMode ? 'bg-[#202832] text-[#FFE0CB]' : 'bg-[#f8f4ef] text-[#C95732]'}`}>
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#171D24] bg-[#F07845] text-white">
                <Icons.Camera size={13} />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={`max-w-full truncate text-lg font-extrabold ${theme.textPrimary}`}>{fullName}</h3>
                <span className={`rounded-full px-2 py-1 text-[9px] font-extrabold tracking-wider ${isAdmin ? 'bg-violet-500/15 text-violet-300' : isPremium ? 'bg-orange-500/15 text-orange-300' : 'bg-slate-500/15 text-slate-400'}`}>
                  {isAdmin ? 'ADMIN' : isPremium ? 'PREMIUM' : 'FREE'}
                </span>
              </div>
              <p className="mt-1 truncate text-xs font-semibold text-[#F07845]">{userProfile.storeName || 'Merchant AIDO'}</p>
              <p className={`mt-1 truncate text-[11px] ${theme.textSecondary}`}>{userProfile.email || userProfile.username || 'Email belum tersedia'}</p>
            </div>
          </div>

          {/* [ADDED] One plan card combines tier and usage to avoid duplicated plan information. */}
          <div className={`overflow-hidden rounded-[22px] border p-4 ${isDarkMode ? 'border-[#7B432D]/60 bg-gradient-to-br from-[#39271F] via-[#282329] to-[#1C222A]' : 'border-orange-200 bg-gradient-to-br from-orange-50 to-white'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFB36E] to-[#E75B2D] text-white shadow-lg shadow-orange-900/20">
                  <Icons.Sparkles size={20} />
                </span>
                <div>
                  <p className={`text-sm font-extrabold ${theme.textPrimary}`}>{isAdmin ? 'Admin Plan' : isPremium ? 'Premium Plan' : 'Free Plan'}</p>
                  <p className={`mt-0.5 text-[11px] ${theme.textSecondary}`}>{isAdmin ? 'Akses administrator tanpa batas' : isPremium ? 'Akses premium aktif' : 'Paket gratis untuk mulai berjualan'}</p>
                </div>
              </div>
              <span className="rounded-full border border-orange-400/30 bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold text-[#F39A68]">
                {isAdmin ? 'ADMIN' : isPremium ? 'AKTIF' : 'GRATIS'}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className={`text-xs font-semibold ${theme.textPrimary}`}>Penggunaan kalkulasi hari ini</p>
              <p className="text-xs font-bold text-[#F07845]">{isAdmin || isPremium ? '∞' : usageCount} <span className={theme.textSecondary}>/ {isAdmin || isPremium ? '∞' : usageLimit}</span></p>
            </div>
            <div className={`mt-2 h-2 overflow-hidden rounded-full ${isDarkMode ? 'bg-[#11161C]' : 'bg-orange-100'}`}>
              <div className="h-full rounded-full bg-gradient-to-r from-[#FF9B52] to-[#E94D27] transition-all duration-500" style={{ width: `${usagePercent}%` }} />
            </div>
            <p className={`mt-2 text-[10px] ${theme.textSecondary}`}>
              {isAdmin ? 'Akun admin tidak memiliki batas kalkulasi.' : isPremium ? 'Nikmati kalkulasi tanpa batas selama Premium aktif.' : 'Batas 10 kalkulasi per hari. Kuota direset setiap hari.'}
            </p>
          </div>

          {!isAdmin && !isPremium && (
            <button
              type="button"
              onClick={() => showUnavailable('Upgrade Premium')}
              className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#FF984F] to-[#E94D27] px-4 py-4 text-left text-white shadow-[0_8px_22px_rgba(226,83,39,0.22)] transition-all active:scale-[0.99]"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20"><Icons.Sparkles size={20} /></span>
                <span>
                  <span className="block text-sm font-extrabold">Upgrade ke Premium</span>
                  <span className="mt-0.5 block text-[11px] text-white/80">Kalkulasi dan fitur tanpa batas</span>
                </span>
              </span>
              <Icons.ChevronRight size={19} />
            </button>
          )}

          <div className="space-y-2">
            <p className={`px-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${theme.textSecondary}`}>Akun</p>
            <ActionRow icon={Icons.User} title="Edit Profil" description="Ubah nama, email, dan foto profil" onClick={() => showUnavailable('Edit profil')} />
            <ActionRow icon={Icons.Lock} title="Ganti Password" description="Perbarui keamanan akun Anda" onClick={() => showUnavailable('Ganti password')} />
          </div>

          <div className="space-y-2">
            <p className={`px-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${theme.textSecondary}`}>Aplikasi</p>
            <ActionRow icon={Icons.Settings} title="Pengaturan" description="Tema dan preferensi aplikasi" onClick={() => { setShowProfileMenu(false); showToast('Pengaturan tersedia melalui kontrol tema aplikasi.', 'info'); }} />
          </div>

          <div className="space-y-2">
            <p className={`px-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${theme.textSecondary}`}>Dukungan</p>
            <ActionRow icon={Icons.HelpCircle || Icons.Shield} title="Bantuan & Dukungan" description="Informasi dan bantuan penggunaan" onClick={() => showUnavailable('Bantuan & dukungan')} />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl border border-red-500/25 bg-red-500/[0.07] px-3 py-3.5 text-left transition-all hover:bg-red-500/10 active:scale-[0.99]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400"><Icons.LogOut size={18} /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-bold text-red-400">Logout</span>
              <span className="mt-0.5 block text-[11px] text-red-300/70">Keluar dari akun AIDO</span>
            </span>
            <Icons.ChevronRight size={17} className="text-red-400" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default ProfilePanel;
