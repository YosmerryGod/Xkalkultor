import { useApp } from '../../context/AppContext';
import { Icons } from '../icons/Icons';
import { getGreeting } from '../../utils/format';
import ProfilePanel from './ProfilePanel';

// [MODIFIED] Header profile control now opens the dedicated account panel.
const Header = () => {
  const {
    activeTab, userProfile, showProfileMenu, setShowProfileMenu, isDarkMode,
    setShowSearchModal, theme,
  } = useApp();

  const fullName = [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(' ');
  const initials = (fullName || 'U').split(/\\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();

  return (
    <div className={`relative z-[100] flex flex-shrink-0 items-center justify-between px-6 pb-4 pt-7 ${theme.bgContainer} transition-colors duration-300`}>
      <div className="flex min-w-0 flex-col">
        <span className="mb-0.5 text-[10px] font-extrabold uppercase tracking-widest text-[#df6a49]">{getGreeting()},</span>
        <h1 className={`line-clamp-1 text-xl font-black tracking-tight ${theme.textPrimary}`}>{userProfile?.firstName || 'Pengguna'}</h1>
      </div>

      <div className="relative flex items-center gap-3">
        {activeTab === 'beranda' && (
          <button
            type="button"
            aria-label="Notifikasi"
            className={`relative flex h-10 w-10 items-center justify-center rounded-full ${theme.bgContainer} ${theme.shadowOut} ${theme.textSecondary}`}
          >
            <Icons.Bell size={18} />
            <span className={`absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 ${isDarkMode ? 'border-[#181D24]' : 'border-[#e0e5ec]'} bg-[#df6a49]`} />
          </button>
        )}

        {activeTab === 'riwayat' && (
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            aria-label="Cari riwayat"
            className={`flex h-10 w-10 items-center justify-center rounded-full ${theme.bgContainer} ${theme.shadowOut} ${theme.textSecondary} transition-all hover:text-[#df6a49]`}
          >
            <Icons.Search size={18} />
          </button>
        )}

        <button
          type="button"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          aria-label="Buka profil"
          aria-expanded={showProfileMenu}
          className={`flex h-11 w-11 items-center justify-center rounded-full border text-xs font-extrabold tracking-wide transition-all ${isDarkMode ? 'border-[#39424D] bg-gradient-to-br from-[#303B48] to-[#1A2028] text-[#F5B18B]' : 'border-white bg-gradient-to-br from-white to-[#dfe4eb] text-[#bd5a36]'} ${theme.shadowOut}`}
        >
          {initials}
        </button>
      </div>

      {showProfileMenu && <ProfilePanel />}
    </div>
  );
};

export default Header;
