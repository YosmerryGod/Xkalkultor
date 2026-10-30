import { useApp } from '../../context/AppContext';
import { Icons } from '../icons/Icons';
import { getGreeting } from '../../utils/format';
import ProfilePanel from './ProfilePanel';

// [MODIFIED] Header controls use a compact, balanced visual scale.
const Header = () => {
  const {
    activeTab, userProfile, showProfileMenu, setShowProfileMenu, isDarkMode,
    setIsDarkMode, setShowSearchModal, theme,
  } = useApp();

  const fullName = [userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(' ');
  const initials = (fullName || 'U').split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();

  return (
    <div className={`relative z-[100] flex flex-shrink-0 items-center justify-between px-4 pb-3 pt-5 ${theme.bgContainer} transition-colors duration-300`}>
      <div className="flex min-w-0 flex-col">
        <span className="mb-0.5 text-[10px] font-extrabold uppercase tracking-widest text-[#df6a49]">{getGreeting()},</span>
        <h1 className={`line-clamp-1 text-lg font-extrabold tracking-tight ${theme.textPrimary}`}>{userProfile?.firstName || 'Pengguna'}</h1>
      </div>

      <div className="relative flex items-center gap-2">
        {activeTab === 'beranda' && (
          <button
            type="button"
            aria-label="Notifikasi"
            className={`relative flex h-9 w-9 items-center justify-center rounded-full ${theme.bgContainer} ${theme.shadowOut} ${theme.textSecondary}`}
          >
            <Icons.Bell size={16} />
            <span className={`absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 ${isDarkMode ? 'border-[#181D24]' : 'border-[#e0e5ec]'} bg-[#df6a49]`} />
          </button>
        )}

        {activeTab === 'riwayat' && (
          <button
            type="button"
            onClick={() => setShowSearchModal(true)}
            aria-label="Cari riwayat"
            className={`flex h-9 w-9 items-center justify-center rounded-full ${theme.bgContainer} ${theme.shadowOut} ${theme.textSecondary} transition-all hover:text-[#df6a49]`}
          >
            <Icons.Search size={16} />
          </button>
        )}

        {/* [ADDED] Theme toggle sits immediately to the left of the profile button. */}
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label={isDarkMode ? 'Aktifkan light mode' : 'Aktifkan dark mode'}
          aria-pressed={isDarkMode}
          title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all ${isDarkMode ? 'border-[#39424D] bg-[#202832] text-[#F5B18B]' : 'border-white bg-[#e9edf2] text-[#bd5a36]'} ${theme.shadowOut}`}
        >
          {isDarkMode ? <Icons.Sun size={16} /> : <Icons.Moon size={16} />}
        </button>

        <button
          type="button"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          aria-label="Buka profil"
          aria-expanded={showProfileMenu}
          className={`flex h-10 w-10 items-center justify-center rounded-full border text-[11px] font-bold tracking-wide transition-all ${isDarkMode ? 'border-[#39424D] bg-gradient-to-br from-[#303B48] to-[#1A2028] text-[#F5B18B]' : 'border-white bg-gradient-to-br from-white to-[#dfe4eb] text-[#bd5a36]'} ${theme.shadowOut}`}
        >
          {initials}
        </button>
      </div>

      {showProfileMenu && <ProfilePanel />}
    </div>
  );
};

export default Header;
