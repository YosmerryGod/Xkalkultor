import { createContext, useContext, useEffect, useState } from 'react';
import { KEYS } from '../constants/storageKeys';
import { getTheme } from '../constants/theme';
import { DEFAULT_SETTINGS, DEFAULT_BANNERS, DEFAULT_HOME_PROMOS, EMPTY_AUTH_FORM, EMPTY_PROMO_FORM, EMPTY_HOME_ITEM } from '../constants/defaults';
import {
  getInitialSession, getInitialUserData, loadUserData, saveUserData,
  saveSession, clearSession, toProfile, login, register,
} from '../services/authService';
import { LS } from '../utils/storage';
import { parseNum } from '../utils/format';
import { calculatePrice } from '../utils/calculatePrice';
import { isImageData } from '../utils/image';
import { safeUrl, resolveMerchantKey, isAddablePromo, buildPromoFromHome, upgradeHomePromos } from '../utils/homeContent';

const AppContext = createContext(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp harus dipakai di dalam <AppProvider>');
  return ctx;
};

export const AppProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [currentView, setCurrentView] = useState(() => (getInitialSession() ? 'dashboard' : 'auth')); 
  const [activeTab, setActiveTab] = useState('beranda');
  const [userProfile, setUserProfile] = useState(() => getInitialSession());
  const [authForm, setAuthForm] = useState(EMPTY_AUTH_FORM);
  const [authError, setAuthError] = useState('');

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => LS.get(KEYS.dark, false));

  // Kalkulator Core States
  const [calcData, setCalcData] = useState({ name: '', hargaNet: '', merchant: 'shopeefood' });
  const [calcResult, setCalcResult] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // History & Filter States
  const [historyLog, setHistoryLog] = useState(() => getInitialUserData()?.historyLog || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [merchantFilter, setMerchantFilter] = useState('all'); 
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Add Promo States (Single & Multi Package)
  const [isAddingPromo, setIsAddingPromo] = useState(false);
  const [promoMode, setPromoMode] = useState('single'); // 'single' atau 'multi'
  const [subPromos, setSubPromos] = useState([]); // untuk menampung isi paket
  const [promoForm, setPromoForm] = useState(EMPTY_PROMO_FORM);
  const [editingPromoId, setEditingPromoId] = useState(null); // null = sedang membuat promo baru

  const [calcSettings, setCalcSettings] = useState(() => getInitialUserData()?.calcSettings || DEFAULT_SETTINGS);

  const [banners, setBanners] = useState(() => LS.get(KEYS.banners, DEFAULT_BANNERS));
  const [homePromos, setHomePromos] = useState(() => upgradeHomePromos(LS.get(KEYS.homePromos, DEFAULT_HOME_PROMOS)));

  // Simpan otomatis ke penyimpanan browser
  useEffect(() => { LS.set(KEYS.dark, isDarkMode); }, [isDarkMode]);
  useEffect(() => { LS.set(KEYS.banners, banners); }, [banners]);
  useEffect(() => { LS.set(KEYS.homePromos, homePromos); }, [homePromos]);
  useEffect(() => {
    if (userProfile) saveUserData(userProfile.id, { calcSettings, historyLog });
  }, [calcSettings, historyLog, userProfile]);

  const [showAddHomeModal, setShowAddHomeModal] = useState(false);
  const [homeAddType, setHomeAddType] = useState('promo');
  const [newHomeItem, setNewHomeItem] = useState(EMPTY_HOME_ITEM);
  const [toast, setToast] = useState(null); // { message, type, id }
  const showToast = (message, type = 'info') => setToast({ message, type, id: Date.now() });

  const theme = getTheme(isDarkMode);

  // Sinkronkan class "dark" Tailwind dengan tombol Dark Mode di aplikasi
  useEffect(() => { document.documentElement.classList.toggle('dark', isDarkMode); }, [isDarkMode]);

  // ---- Kalkulator & promo
  const handleCalcChange = (e) => {
    setCalcData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (calcResult) setCalcResult(null); 
  };

  const togglePromo = (promoId) => {
    setCalcSettings(prev => ({ ...prev, promos: (prev?.promos || []).map(p => p.id === promoId ? { ...p, enabled: !p.enabled } : p) }));
    if (calcResult) setCalcResult(null);
  };

  const deletePromo = (promoId) => {
    setCalcSettings(prev => ({ ...prev, promos: (prev?.promos || []).filter(p => p.id !== promoId) }));
    if (calcResult) setCalcResult(null);
  };

  const cancelPromoForm = () => {
    setIsAddingPromo(false);
    setEditingPromoId(null);
    setPromoMode('single');
    setSubPromos([]);
    setPromoForm(EMPTY_PROMO_FORM);
  };

  // Buka form dengan data promo yang dipilih untuk diedit
  const startEditPromo = (promo) => {
    const merchant = promo.merchant || 'all'; // promo lama tanpa penanda = semua marketplace
    setEditingPromoId(promo.id);
    setIsAddingPromo(true);
    if (promo.isPackage) {
      setPromoMode('multi');
      setSubPromos([...(promo.subPromos || [])]);
      setPromoForm({ ...EMPTY_PROMO_FORM, name: promo.name, merchant });
    } else {
      setPromoMode('single');
      setSubPromos([]);
      setPromoForm({
        name: promo.name, merchant, category: promo.category || 'marketplace', type: promo.type || 'percentage',
        discount: String(promo.discount ?? ''), minPurchase: String(promo.minPurchase || ''),
        maxDiscount: String(promo.maxDiscount || ''), merchantSubsidy: String(promo.merchantSubsidy ?? 100),
        branch: !!promo.branch, fake: !!promo.fake,
      });
    }
  };

  const handleSavePromo = () => {
    const existing = editingPromoId ? (calcSettings?.promos || []).find((p) => p.id === editingPromoId) : null;
    const base = {
      id: existing ? existing.id : Date.now(),
      enabled: existing ? existing.enabled : true,
      merchant: promoForm.merchant || calcData.merchant || 'shopeefood',
    };

    let saved;
    if (promoMode === 'multi') {
      if ((subPromos || []).length === 0) return; // Mencegah save jika paket kosong
      saved = { ...base, name: promoForm.name || 'Paket Promo Baru', isPackage: true, subPromos: [...(subPromos || [])] };
    } else {
      saved = {
        ...base, name: promoForm.name || 'Promo Baru', category: promoForm.category || 'marketplace',
        type: promoForm.type || 'percentage',
        discount: parseNum(promoForm.discount, 0), minPurchase: parseNum(promoForm.minPurchase, 0),
        maxDiscount: parseNum(promoForm.maxDiscount, 0), merchantSubsidy: parseNum(promoForm.merchantSubsidy, 100),
        branch: promoForm.category === 'marketplace' ? promoForm.branch : false,
        fake: promoForm.category === 'fake' || promoForm.fake,
      };
    }

    setCalcSettings((prev) => ({
      ...prev,
      promos: existing
        ? (prev?.promos || []).map((p) => (p.id === existing.id ? saved : p))
        : [...(prev?.promos || []), saved],
    }));
    cancelPromoForm();
    if (calcResult) setCalcResult(null);
  };


  const handleAddSubPromo = () => {
      const sub = {
          id: Date.now(), category: promoForm.category || 'marketplace',
          type: promoForm.type || 'percentage', discount: parseNum(promoForm.discount, 0),
          minPurchase: parseNum(promoForm.minPurchase, 0), maxDiscount: parseNum(promoForm.maxDiscount, 0),
          merchantSubsidy: parseNum(promoForm.merchantSubsidy, 100), branch: promoForm.category === 'marketplace' ? promoForm.branch : false,
          fake: promoForm.category === 'fake' || promoForm.fake
      };
      setSubPromos(prev => [...(prev || []), sub]);
      setPromoForm(prev => ({ ...prev, category: 'marketplace', type: 'percentage', discount: '', minPurchase: '', maxDiscount: '', merchantSubsidy: '100', branch: false, fake: false }));
  };


  const handleCalculate = () => {
    const netPrice = parseNum(calcData.hargaNet, 0);
    if (netPrice <= 0) return;

    const merchantId = calcData.merchant || 'shopeefood';
    const { finalPricePerItem, breakdown, merchantName } = calculatePrice(netPrice, merchantId, calcSettings);
    setCalcResult({ finalPricePerItem, breakdown });

    const ts = new Date().toLocaleString('id-ID', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    setHistoryLog(prev => [{
      id: Date.now(), name: calcData.name || 'Item Tanpa Nama', hargaNet: netPrice, finalPrice: finalPricePerItem,
      merchant: merchantId, merchantName, timestamp: ts, rawInputs: { ...calcData }
    }, ...(prev || [])]);
  };

  // ---- Riwayat
  const handleEditHistory = (item) => {
    if(!item) return;
    setCalcData(item.rawInputs || { name: '', hargaNet: '', merchant: 'shopeefood' });
    setCalcResult(null);
    setActiveTab('kalkulator');
  };

  const getProcessedHistory = () => {
    let processed = [...(historyLog || [])];
    if (merchantFilter !== 'all') processed = processed.filter(item => item.merchant === merchantFilter);
    if ((searchQuery || '').trim() !== '') {
      const q = searchQuery.toLowerCase();
      processed = processed.filter(item => String(item.name || '').toLowerCase().includes(q) || String(item.merchantName || '').toLowerCase().includes(q));
    }
    processed.sort((a, b) => sortOrder === 'newest' ? b.id - a.id : a.id - b.id);
    return processed;
  };
  const processedHistory = getProcessedHistory();

  // ---- Autentikasi
  const setAuthField = (name) => (e) => {
    setAuthForm((prev) => ({ ...prev, [name]: e.target.value }));
    if (authError) setAuthError('');
  };

  const switchAuthMode = () => {
    setIsLogin((v) => !v);
    setAuthError('');
    setShowPassword(false);
    setAuthForm(EMPTY_AUTH_FORM);
  };

  const startSession = (user) => {
    const data = loadUserData(user.id);
    setCalcSettings(data?.calcSettings || DEFAULT_SETTINGS);
    setHistoryLog(data?.historyLog || []);
    setCalcData({ name: '', hargaNet: '', merchant: 'shopeefood' });
    setCalcResult(null);
    setUserProfile(toProfile(user));
    saveSession(user.id);
    setActiveTab('beranda');
    setAuthForm(EMPTY_AUTH_FORM);
    setAuthError('');
    setShowPassword(false);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    clearSession();
    setShowProfileMenu(false);
    setShowSettings(false);
    setUserProfile(null);
    setCalcSettings(DEFAULT_SETTINGS);
    setHistoryLog([]);
    setCalcData({ name: '', hargaNet: '', merchant: 'shopeefood' });
    setCalcResult(null);
    setIsLogin(true);
    setCurrentView('auth');
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const result = isLogin ? login(authForm.identifier, authForm.password) : register(authForm);
    if (result.error) return setAuthError(result.error);
    startSession(result.user);
  };

  // ---- Konten Beranda (admin)
  const handleAddHomeItem = () => {
    if (homeAddType === 'banner') {
      if (!newHomeItem.title.trim()) return showToast('Isi judul banner.', 'error');
      const url = safeUrl(newHomeItem.url);
      if (newHomeItem.url.trim() && !url) return showToast('Link tidak valid. Pakai alamat http atau https.', 'error');
      const image = isImageData(newHomeItem.image) ? newHomeItem.image : '';
      setBanners((prev) => [...(prev || []), {
        id: Date.now(), title: newHomeItem.title.trim(),
        subtitle: newHomeItem.subtitle.trim() || (image ? '' : 'Promo menarik'),
        bg: 'from-blue-500 to-indigo-600', url, image, showText: newHomeItem.showText !== false,
      }]);
    } else {
      if (!newHomeItem.name.trim()) return showToast('Isi nama promo.', 'error');
      // Isian diskon yang belum sempat ditekan "Tambahkan ke Paket" ikut dihitung
      const pending = parseNum(newHomeItem.discount, 0) > 0 ? [{
        type: newHomeItem.type || 'percentage', discount: parseNum(newHomeItem.discount, 0),
        merchantSubsidy: parseNum(newHomeItem.merchantSubsidy, 100),
        minPurchase: parseNum(newHomeItem.minPurchase, 0), maxDiscount: parseNum(newHomeItem.maxDiscount, 0),
      }] : [];
      const common = {
        id: Date.now(), name: newHomeItem.name.trim(), desc: newHomeItem.desc.trim(),
        merchant: newHomeItem.merchant || 'shopeefood',
      };
      if (newHomeItem.isPackage) {
        const items = [...(newHomeItem.subPromos || []), ...pending];
        if (items.length === 0) return showToast('Tambahkan minimal satu promo ke paket.', 'error');
        setHomePromos((prev) => [...(prev || []), { ...common, isPackage: true, subPromos: items }]);
      } else {
        if (pending.length === 0) return showToast('Isi nilai diskon promo.', 'error');
        setHomePromos((prev) => [...(prev || []), { ...common, ...pending[0] }]);
      }
    }
    setShowAddHomeModal(false);
    setNewHomeItem(EMPTY_HOME_ITEM);
  };


  // Tekan promo di Beranda -> otomatis masuk ke daftar promo marketplace-nya.
  // Ditaruh di urutan paling belakang daftar, jadi dihitung terakhir sebelum diskon coret.
  const addHomePromoToMine = (hp) => {
    if (!isAddablePromo(hp)) return showToast('Promo ini hanya informasi.', 'info');
    const key = resolveMerchantKey(hp.merchant, calcSettings?.marketplaces);
    if (!key) return showToast('Marketplace promo ini tidak dikenali.', 'error');
    if ((calcSettings?.promos || []).some((p) => p.fromHomeId === hp.id)) {
      return showToast('Promo ini sudah ada di daftar promomu.', 'info');
    }
    setCalcSettings((prev) => ({ ...prev, promos: [...(prev?.promos || []), buildPromoFromHome(hp, key)] }));
    if (calcResult) setCalcResult(null);
    showToast(`Ditambahkan ke promo ${calcSettings.marketplaces[key].name}`, 'success');
  };

  const value = {
    isLogin, setIsLogin, showPassword, setShowPassword, currentView, setCurrentView,
    activeTab, setActiveTab, userProfile, setUserProfile, authForm, setAuthForm,
    authError, setAuthError, showProfileMenu, setShowProfileMenu, isDarkMode, setIsDarkMode,
    calcData, setCalcData, calcResult, setCalcResult, showSettings, setShowSettings,
    historyLog, setHistoryLog, searchQuery, setSearchQuery, showSearchModal, setShowSearchModal,
    sortOrder, setSortOrder, merchantFilter, setMerchantFilter, showFilterMenu, setShowFilterMenu,
    isAddingPromo, setIsAddingPromo, promoMode, setPromoMode, subPromos, setSubPromos,
    promoForm, setPromoForm, calcSettings, setCalcSettings, banners, setBanners,
    homePromos, setHomePromos, showAddHomeModal, setShowAddHomeModal, homeAddType, setHomeAddType,
    newHomeItem, setNewHomeItem, theme, handleCalcChange, togglePromo, deletePromo,
    handleSavePromo, handleAddSubPromo, editingPromoId, startEditPromo, cancelPromoForm, handleCalculate, handleEditHistory, getProcessedHistory, processedHistory,
    setAuthField, switchAuthMode, startSession, handleLogout, handleAuthSubmit, handleAddHomeItem, toast, setToast, showToast, addHomePromoToMine,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
