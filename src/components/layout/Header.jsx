import { useApp } from '../../context/AppContext';
import { Icons } from '../icons/Icons';
import { getGreeting } from '../../utils/format';

const Header = () => {
  const {
    activeTab, userProfile, showProfileMenu, setShowProfileMenu, isDarkMode,
    setIsDarkMode, setShowSearchModal, theme, handleLogout,
  } = useApp();
  return (
    <div className={`flex justify-between items-center px-6 pt-7 pb-4 shadow-[0_5px_15px_rgba(0,0,0,0.03)] z-20 ${theme.bgContainer} flex-shrink-0`}>
        <div className="flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#df6a49] mb-0.5">{getGreeting()},</span>
            <h1 className={`text-xl font-black tracking-tight ${theme.textPrimary} line-clamp-1`}>{userProfile?.firstName || 'Pengguna'}</h1>
        </div>

        <div className="flex items-center gap-3 relative">
            {activeTab === 'beranda' && (
                <button className={`relative w-10 h-10 rounded-full ${theme.bgContainer} ${theme.shadowOut} flex items-center justify-center ${theme.textSecondary}`}>
                    <Icons.Bell size={18} />
                    <span className={`absolute top-2.5 right-3 w-2 h-2 bg-[#df6a49] rounded-full border-2 ${isDarkMode ? 'border-[#1e1e24]' : 'border-[#e0e5ec]'}`}></span>
                </button>
            )}

            {activeTab === 'riwayat' && (
                <button onClick={() => setShowSearchModal(true)} className={`w-10 h-10 rounded-full ${theme.bgContainer} ${theme.shadowOut} flex items-center justify-center ${theme.textSecondary} hover:text-[#df6a49] transition-all`}>
                    <Icons.Search size={18} />
                </button>
            )}

            <div className="relative z-50">
                <button onClick={() => setShowProfileMenu(!showProfileMenu)} className={`w-10 h-10 rounded-full ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} flex items-center justify-center ${theme.textSecondary}`}>
                    <Icons.User size={18} />
                </button>

                {showProfileMenu && (
                    <div className={`absolute right-0 mt-3 w-64 ${theme.bgContainer} rounded-2xl ${theme.shadowOut} p-2 border ${theme.border}`}>
                        <div className={`px-4 py-3 border-b ${theme.border} flex flex-col gap-1.5`}>
                            <div className="flex justify-between items-center">
                                <p className={`text-sm font-bold truncate ${theme.textPrimary}`}>{[userProfile?.firstName, userProfile?.lastName].filter(Boolean).join(' ') || 'User'}</p>
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md shadow-sm flex items-center gap-1 ${userProfile?.isAdmin ? 'bg-gradient-to-r from-gray-800 to-black text-white' : 'bg-blue-500 text-white'}`}>
                                    <Icons.Shield size={10} /> {userProfile?.isAdmin ? 'ADMIN' : 'USER'}
                                </span>
                            </div>
                            <p className="text-xs font-semibold text-[#df6a49] flex items-center gap-1.5">
                                <Icons.Home size={11} /> {userProfile?.storeName || 'Store'}
                            </p>
                            <p className={`text-[11px] font-medium flex items-center gap-1.5 ${theme.textSecondary}`}>
                                <Icons.Mail size={11} /> {userProfile?.email || 'email@exkalt.com'}
                            </p>
                        </div>
                        <div className="py-2 flex flex-col gap-1">
                            <div onClick={() => setIsDarkMode(!isDarkMode)} className="px-3 py-2.5 flex items-center justify-between rounded-xl cursor-pointer hover:opacity-70 transition-opacity">
                                <span className={`text-xs font-semibold flex items-center gap-2.5 ${theme.textSecondary}`}>
                                    {isDarkMode ? <Icons.Moon size={15} /> : <Icons.Sun size={15} />} Dark Mode
                                </span>
                                <button className={`w-9 h-5 rounded-full relative ${theme.shadowIn} flex items-center px-0.5 transition-colors duration-300 ${isDarkMode ? 'bg-[#18181c]' : 'bg-[#e0e5ec]'}`}>
                                    <div className={`w-3.5 h-3.5 rounded-full bg-[#df6a49] transform transition-transform duration-300 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                </button>
                            </div>
                            <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-xs font-semibold text-red-500 flex items-center gap-2.5 rounded-xl hover:bg-red-500/10 transition-colors">
                                <Icons.LogOut size={15} /> Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default Header;
