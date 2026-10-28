import { useApp } from '../../context/AppContext';
import { Icons } from '../icons/Icons';

const BottomNav = () => {
  const {
    activeTab, setActiveTab, theme,
  } = useApp();
  return (
    <div className={`absolute bottom-0 left-0 w-full px-6 py-4 ${theme.bgContainer} shadow-[0_-5px_20px_rgba(0,0,0,0.03)] z-20 flex-shrink-0`}>
        <div className={`flex justify-between items-center ${theme.bgContainer} rounded-2xl px-2 py-1.5 ${theme.shadowIn}`}>
            {[
              { id: 'beranda', icon: <Icons.Home size={18} />, label: 'Beranda' },
              { id: 'kalkulator', icon: <Icons.Calculator size={18} />, label: 'Kalkulator' },
              { id: 'menu', icon: <Icons.Package size={18} />, label: 'Menu' },
              { id: 'riwayat', icon: <Icons.Clock size={18} />, label: 'Riwayat' }
            ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center justify-center flex-1 h-11 rounded-xl transition-all duration-300 ${activeTab === tab.id ? `${theme.bgContainer} ${theme.shadowOut} text-[#df6a49]` : `${theme.textSecondary} hover:text-[#df6a49]/70`}`}>
                    <div className={`${activeTab === tab.id ? 'scale-110 mb-0.5' : 'scale-100'} transition-transform duration-300`}>{tab.icon}</div>
                    {activeTab === tab.id && <span className="text-[9px] font-bold tracking-wide">{tab.label}</span>}
                </button>
            ))}
        </div>
    </div>
  );
};

export default BottomNav;
