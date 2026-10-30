import { createContext, useContext, useEffect, useState } from 'react';
import { KEYS } from '../constants/storageKeys';
import { getTheme } from '../constants/theme';
import { DEFAULT_SETTINGS, DEFAULT_BANNERS, DEFAULT_HOME_PROMOS, EMPTY_AUTH_FORM, EMPTY_PROMO_FORM, EMPTY_HOME_ITEM } from '../constants/defaults';
import { toProfile } from '../services/authService';
import { LS } from '../utils/storage';
import { parseNum } from '../utils/format';
import { calculatePrice } from '../utils/calculatePrice';
import { isImageData } from '../utils/image';
import { safeUrl, resolveMerchantKey, isAddablePromo, buildPromoFromHome, upgradeHomePromos } from '../utils/homeContent';

const AppContext = createContext(null);

// Data awal kalkulator: marketplace default = yang terakhir dipilih (bukan selalu ShopeeFood)
const emptyCalcData = (settings) => {
  const keys = Object.keys(settings?.marketplaces || {});
  const last = LS.get(KEYS.lastMerchant, '');
  const merchant = keys.includes(last) ? last : (keys.includes('shopeefood') ? 'shopeefood' : (keys[0] || 'shopeefood'));
  return { name: '', hargaNet: '', merchant };
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp harus dipakai di dalam <AppProvider>');
  return ctx;
};

export const AppProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  // [MODIFIED] Restore authentication from the server instead of trusting localStorage.
  const [currentView, setCurrentView] = useState('auth');
  const [activeTab, setActiveTab] = useState('beranda');
  const [userProfile, setUserProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  // [ADDED] Prevent autosave until the server snapshot has been loaded.
  const [cloudDataReady, setCloudDataReady] = useState(false);
  // [ADDED] Shared home content is loaded before admin changes can be saved.
  const [globalContentReady, setGlobalContentReady] = useState(false);
  const [authForm, setAuthForm] = useState(EMPTY_AUTH_FORM);
  const [authError, setAuthError] = useState('');

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => LS.get(KEYS.dark, false));
  // [ADDED] Daily free-plan calculation usage, stored per account and local calendar day.
  const getLocalUsageDate = () => { const now = new Date(); return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-'); };
  const [dailyUsage, setDailyUsage] = useState({ date: getLocalUsageDate(), count: 0 });
  useEffect(() => {
    if (!userProfile?.id) { setDailyUsage({ date: getLocalUsageDate(), count: 0 }); return; }
    const date = getLocalUsageDate();
    const saved = LS.get('aido_daily_usage_' + userProfile.id, { date, count: 0 });
    setDailyUsage(saved?.date === date ? saved : { date, count: 0 });
  }, [userProfile?.id]);

  // Kalkulator Core States
  const [calcData, setCalcData] = useState(() => emptyCalcData(DEFAULT_SETTINGS));
  const [calcResult, setCalcResult] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // History & Filter States
  const [historyLog, setHistoryLog] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [merchantFilter, setMerchantFilter] = useState('all'); 
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [coretFilter, setCoretFilter] = useState('all'); // 'all' | 'coret' | 'nocoret'

  // Daftar menu tersimpan (nama + harga net), per akun
  const [menuItems, setMenuItems] = useState([]);

  // Add Promo States (Single & Multi Package)
  const [isAddingPromo, setIsAddingPromo] = useState(false);
  const [promoMode, setPromoMode] = useState('single'); // 'single' atau 'multi'
  const [subPromos, setSubPromos] = useState([]); // untuk menampung isi paket
  const [promoForm, setPromoForm] = useState(EMPTY_PROMO_FORM);
  const [editingPromoId, setEditingPromoId] = useState(null); // null = sedang membuat promo baru

  const [calcSettings, setCalcSettings] = useState(DEFAULT_SETTINGS);

  const [banners, setBanners] = useState(() => LS.get(KEYS.banners, DEFAULT_BANNERS));
  const [homePromos, setHomePromos] = useState(() => upgradeHomePromos(LS.get(KEYS.homePromos, DEFAULT_HOME_PROMOS)));

  // [ADDED] Restore the authenticated profile from the secure server session.
  useEffect(() => {
    let active = true;
    fetch('/api/auth/me', { credentials: 'same-origin', cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.user) return null;
        return result.user;
      })
      .then((user) => {
        if (!active) return;
        if (user) {
          setUserProfile(user);
          setCurrentView('dashboard');
        }
      })
      .catch((error) => console.error('[Auth] Session restore failed:', error))
      .finally(() => { if (active) setAuthReady(true); });
    return () => { active = false; };
  }, []);

  // [ADDED] Load the account's calculator data from PostgreSQL after session restoration/login.
  useEffect(() => {
    let active = true;
    if (!userProfile?.id) {
      setCloudDataReady(false);
      return () => { active = false; };
    }

    // [ADDED] Clear the previous account's in-memory data before loading this account.
    setCalcSettings(DEFAULT_SETTINGS);
    setHistoryLog([]);
    setMenuItems([]);
    setCalcData(emptyCalcData(DEFAULT_SETTINGS));
    setCalcResult(null);
    setCloudDataReady(false);
    fetch('/api/user/data', { credentials: 'same-origin', cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || 'Gagal memuat data akun.');
        return result.data;
      })
      .then((data) => {
        if (!active || !data) return;
        setCalcSettings(data.calcSettings || DEFAULT_SETTINGS);
        setHistoryLog(Array.isArray(data.historyLog) ? data.historyLog : []);
        setMenuItems(Array.isArray(data.menuItems) ? data.menuItems : []);
      })
      .then(() => { if (active) setCloudDataReady(true); })
      .catch((error) => {
        console.error('[Cloud Data] Load failed:', error);
        if (active) setCloudDataReady(false);
      });

    return () => { active = false; };
  }, [userProfile?.id]);

  // [ADDED] Persist user-owned calculator data to PostgreSQL after changes settle.
  useEffect(() => {
    if (!userProfile?.id || !cloudDataReady) return undefined;
    const timer = setTimeout(() => {
      fetch('/api/user/data', {
        method: 'PUT',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ data: { calcSettings, historyLog, menuItems } }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.error || 'Gagal menyimpan data.');
          }
        })
        .catch((error) => console.error('[Cloud Data] Save failed:', error));
    }, 700);
    return () => clearTimeout(timer);
  }, [calcSettings, historyLog, menuItems, userProfile?.id, cloudDataReady]);

  // [ADDED] Load shared banners and promotions from the backend.
  useEffect(() => {
    let active = true;
    fetch('/api/home-content')
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error || 'Gagal memuat konten beranda.');
        if (active && result.data) {
          setBanners(Array.isArray(result.data.banners) ? result.data.banners : DEFAULT_BANNERS);
          setHomePromos(upgradeHomePromos(Array.isArray(result.data.homePromos) ? result.data.homePromos : DEFAULT_HOME_PROMOS));
        }
        if (active) setGlobalContentReady(true);
      })
      .catch((error) => console.error('[Home Content] Load failed:', error));
    return () => { active = false; };
  }, []);

  // [ADDED] Only admins may publish shared home content to PostgreSQL.
  useEffect(() => {
    if (!userProfile?.isAdmin || !globalContentReady) return undefined;
    const timer = setTimeout(() => {
      fetch('/api/home-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ data: { banners, homePromos } }),
      })
        .then(async (response) => {
          if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.error || 'Gagal menyimpan konten beranda.');
          }
        })
        .catch((error) => console.error('[Home Content] Save failed:', error));
    }, 700);
    return () => clearTimeout(timer);
  }, [banners, homePromos, userProfile?.isAdmin, globalContentReady]);

  // Simpan otomatis ke penyimpanan browser
  useEffect(() => { LS.set(KEYS.dark, isDarkMode); }, [isDarkMode]);
  useEffect(() => { LS.set(KEYS.banners, banners); }, [banners]);
  useEffect(() => { LS.set(KEYS.homePromos, homePromos); }, [homePromos]);
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
    const { name, value } = e.target;
    if (name === 'merchant') LS.set(KEYS.lastMerchant, value); // ingat pilihan terakhir
    // Mengetik manual nama/harga berarti tidak lagi memakai menu tersimpan
    setCalcData(prev => ({ ...prev, [name]: value, ...(name === 'name' || name === 'hargaNet' ? { menuId: '' } : {}) }));
    if (calcResult) setCalcResult(null); 
  };

  // ---- Menu tersimpan
  // [MODIFIED] Kelompokkan menu berdasarkan kategori, lalu urutkan nama di setiap kategori.
  const sortedMenus = [...(menuItems || [])].sort((a, b) => {
    const categoryCompare = String(a.category || 'Lainnya').localeCompare(String(b.category || 'Lainnya'), 'id');
    return categoryCompare || String(a.name).localeCompare(String(b.name), 'id');
  });

  // [MODIFIED] Simpan kategori dan cegah nama menu duplikat tanpa membedakan kapitalisasi.
  const saveMenuItem = ({ id, name, hargaNet, category }) => {
    const n = String(name || '').trim();
    const normalizedName = n.toLocaleLowerCase('id-ID');
    const price = parseNum(hargaNet, 0);
    const normalizedCategory = String(category || 'Lainnya').trim() || 'Lainnya';
    if (!n) { showToast('Isi nama menu.', 'error'); return false; }
    if (price <= 0) { showToast('Isi harga net lebih dari 0.', 'error'); return false; }
    const duplicate = (menuItems || []).find((m) =>
      String(m.name || '').trim().toLocaleLowerCase('id-ID') === normalizedName &&
      String(m.id) !== String(id)
    );
    if (duplicate) {
      showToast('Nama menu sudah tersedia. Pilih menu yang sudah ada.', 'error');
      return false;
    }
    setMenuItems((prev) => (id
      ? (prev || []).map((m) => (String(m.id) === String(id) ? { ...m, name: n, hargaNet: price, category: normalizedCategory } : m))
      : [...(prev || []), { id: Date.now(), name: n, hargaNet: price, category: normalizedCategory }]));
    showToast(id ? 'Menu diperbarui.' : 'Menu ditambahkan.', 'success');
    return true;
  };

  const deleteMenuItem = (id) => {
    setMenuItems((prev) => (prev || []).filter((m) => m.id !== id));
    setCalcData((prev) => (String(prev.menuId) === String(id) ? { ...prev, menuId: '' } : prev));
  };

  // Pilih menu -> nama & harga net kalkulator terisi otomatis
  const selectMenuItem = (id, goToCalc = false) => {
    const m = (menuItems || []).find((x) => String(x.id) === String(id));
    if (!m) { setCalcData((prev) => ({ ...prev, menuId: '' })); return; }
    setCalcData((prev) => ({ ...prev, name: m.name, hargaNet: String(m.hargaNet), menuId: m.id }));
    setCalcResult(null);
    if (goToCalc) setActiveTab('kalkulator');
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
  // [ADDED] Free accounts receive 10 calculations per local day; admin and PRO accounts are unlimited.
  const hasUnlimitedCalculations = !!userProfile?.isAdmin || userProfile?.tier === 'PRO' || userProfile?.tier === 'PREMIUM';
  const usageDate = getLocalUsageDate();
  const currentUsage = dailyUsage?.date === usageDate ? dailyUsage.count : 0;
  if (!hasUnlimitedCalculations && currentUsage >= 10) {
    showToast('Batas 10 kalkulasi harian tercapai. Upgrade ke Premium untuk kalkulasi tanpa batas.', 'error');
    return;
  }
  const netPrice = parseNum(calcData.hargaNet, 0);
  if (netPrice <= 0) return;

  const merchantId = calcData.merchant || 'shopeefood';
  LS.set(KEYS.lastMerchant, merchantId);

  // [MODIFIED] Ambil persentase promo coret yang terpilih.
  const {
    finalPricePerItem,
    breakdown,
    merchantName,
    hasCoret,
    coretDiscountPercent,
  } = calculatePrice(netPrice, merchantId, calcSettings);

  setCalcResult({ finalPricePerItem, breakdown });

  // [ADDED] Save successful calculations to the account's daily usage counter.
  if (!hasUnlimitedCalculations) {
    const nextUsage = { date: usageDate, count: currentUsage + 1 };
    setDailyUsage(nextUsage);
    LS.set('aido_daily_usage_' + userProfile.id, nextUsage);
  }

  const ts = new Date().toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  setHistoryLog((prev) => [
    {
      id: Date.now(),
      name: calcData.name || 'Item Tanpa Nama',
      hargaNet: netPrice,
      finalPrice: finalPricePerItem,
      merchant: merchantId,
      merchantName,
      hasCoret,
      // [ADDED] Simpan persentase untuk kartu Riwayat.
      coretDiscountPercent,
      timestamp: ts,
      rawInputs: { ...calcData },
    },
    ...(prev || []),
  ]);
};


  // ---- Riwayat
  const handleEditHistory = (item) => {
    if(!item) return;
    setCalcData(item.rawInputs || emptyCalcData(calcSettings));
    setCalcResult(null);
    setActiveTab('kalkulator');
  };

  const getProcessedHistory = () => {
    let processed = [...(historyLog || [])];
    if (merchantFilter !== 'all') processed = processed.filter(item => item.merchant === merchantFilter);
    // Riwayat lama belum mencatat diskon coret (hasCoret kosong): hanya tampil di "Semua"
    if (coretFilter === 'coret') processed = processed.filter(item => item.hasCoret === true);
    else if (coretFilter === 'nocoret') processed = processed.filter(item => item.hasCoret === false);
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
    // [MODIFIED] Do not restore account data from browser storage; PostgreSQL is the source of truth.
    setCloudDataReady(false);
    setCalcSettings(DEFAULT_SETTINGS);
    setHistoryLog([]);
    setMenuItems([]);
    setCalcData(emptyCalcData(DEFAULT_SETTINGS));
    setCalcResult(null);
    setUserProfile(toProfile(user));
    // [MODIFIED] The server owns the session; do not store an auth ID in localStorage.
    setActiveTab('beranda');
    setAuthForm(EMPTY_AUTH_FORM);
    setAuthError('');
    setShowPassword(false);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    // [MODIFIED] Revoke the server-side session before clearing local UI state.
    try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }); }
    catch (error) { console.error('[Auth] Logout request failed:', error); }
    // [MODIFIED] The server session is revoked by the logout API; no local auth session is used.
    setShowProfileMenu(false);
    setShowSettings(false);
    setUserProfile(null);
    setCalcSettings(DEFAULT_SETTINGS);
    setHistoryLog([]);
    setMenuItems([]);
    setCalcData(emptyCalcData(DEFAULT_SETTINGS));
    setCalcResult(null);
    setIsLogin(true);
    setCurrentView('auth');
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      // [MODIFIED] Authenticate through the server API; never verify passwords in the browser.
      const response = await fetch(isLogin ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(isLogin
          ? { identifier: authForm.identifier, password: authForm.password }
          : authForm),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setAuthError(result.error || 'Autentikasi gagal. Silakan coba lagi.');
        return;
      }
      startSession(result.user);
    } catch (error) {
      console.error('[Auth] Request failed:', error);
      setAuthError('Tidak dapat terhubung ke server. Periksa koneksi internet.');
    }
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
    authError, setAuthError, showProfileMenu, setShowProfileMenu, isDarkMode, setIsDarkMode, dailyUsage,
    calcData, setCalcData, calcResult, setCalcResult, showSettings, setShowSettings,
    historyLog, setHistoryLog, searchQuery, setSearchQuery, showSearchModal, setShowSearchModal,
    sortOrder, setSortOrder, merchantFilter, setMerchantFilter, showFilterMenu, setShowFilterMenu,
    coretFilter, setCoretFilter, menuItems, setMenuItems, sortedMenus, saveMenuItem, deleteMenuItem, selectMenuItem,
    isAddingPromo, setIsAddingPromo, promoMode, setPromoMode, subPromos, setSubPromos,
    promoForm, setPromoForm, calcSettings, setCalcSettings, banners, setBanners,
    homePromos, setHomePromos, showAddHomeModal, setShowAddHomeModal, homeAddType, setHomeAddType,
    newHomeItem, setNewHomeItem, theme, handleCalcChange, togglePromo, deletePromo,
    handleSavePromo, handleAddSubPromo, editingPromoId, startEditPromo, cancelPromoForm, handleCalculate, handleEditHistory, getProcessedHistory, processedHistory,
    setAuthField, switchAuthMode, startSession, handleLogout, handleAuthSubmit, handleAddHomeItem, toast, setToast, showToast, addHomePromoToMine,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};