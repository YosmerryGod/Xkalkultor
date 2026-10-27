import './viewport';
import { AppProvider, useApp } from './context/AppContext';
import AuthView from './features/auth/AuthView';
import DashboardView from './features/dashboard/DashboardView';

const Shell = () => {
  const { theme, currentView } = useApp();

  return (
    <div className={`w-full app-vh ${theme.bgApp} flex items-center justify-center p-0 font-sans transition-colors duration-500 overflow-hidden`}>
      <div className={`relative w-full h-full ${theme.bgContainer} shadow-2xl overflow-hidden transition-all duration-500 flex flex-col`}>
        {currentView === 'auth' ? <AuthView /> : <DashboardView />}
      </div>
    </div>
  );
};

const AppRoot = () => (
  <AppProvider>
    <Shell />
  </AppProvider>
);

export default AppRoot;
