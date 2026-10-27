import { useApp } from '../../context/AppContext';
import { Icons } from '../../components/icons/Icons';

const HistorySearchModal = () => {
  const {
    activeTab, searchQuery, setSearchQuery, showSearchModal, setShowSearchModal,
    theme,
  } = useApp();
  if (!(showSearchModal && activeTab === 'riwayat')) return null;

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4 transition-all">
        <div className={`w-full max-w-sm ${theme.bgContainer} rounded-2xl p-3 ${theme.shadowOut} border ${theme.border} flex items-center gap-3`}>
            <Icons.Search size={18} className={theme.textSecondary} />
            <input 
                type="text" autoFocus placeholder="Cari menu atau platform..." 
                value={searchQuery || ''} onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 h-8 bg-transparent outline-none ${theme.textPrimary} text-sm font-medium`}
            />
            {searchQuery && (
                <button onClick={() => setSearchQuery('')} className={`w-6 h-6 flex items-center justify-center rounded-full ${theme.bgContainer} ${theme.shadowIn} ${theme.textSecondary}`}>
                    <Icons.X size={12} />
                </button>
            )}
            <button onClick={() => setShowSearchModal(false)} className={`text-xs font-bold px-2 text-[#df6a49]`}>Batal</button>
        </div>
    </div>
  );
};

export default HistorySearchModal;
