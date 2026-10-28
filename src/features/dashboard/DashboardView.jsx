import { useApp } from '../../context/AppContext';
import Header from '../../components/layout/Header';
import BottomNav from '../../components/layout/BottomNav';
import Toast from '../../components/ui/Toast';
import HomeView from '../home/HomeView';
import CalculatorView from '../calculator/CalculatorView';
import MenuView from '../menu/MenuView';
import HistoryView from '../history/HistoryView';
import HistorySearchModal from '../history/HistorySearchModal';

const DashboardView = () => {
  const { theme, activeTab } = useApp();

  return (
    <div className={`flex flex-col w-full h-full ${theme.bgContainer} rounded-none overflow-hidden transition-colors duration-500 relative`}>
      <Header />
      <HistorySearchModal />

      <div className="flex-1 overflow-y-auto px-6 py-4 pb-24 relative z-10 custom-scrollbar">
        {activeTab === 'beranda' && <HomeView />}
        {activeTab === 'kalkulator' && <CalculatorView />}
        {activeTab === 'menu' && <MenuView />}
        {activeTab === 'riwayat' && <HistoryView />}
      </div>

      <BottomNav />
      <Toast />
    </div>
  );
};

export default DashboardView;
