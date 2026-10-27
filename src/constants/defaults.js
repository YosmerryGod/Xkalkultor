export const DEFAULT_SETTINGS = {
  marketplaces: {
    shopeefood: { fee: 20, fixed: 0, name: 'ShopeeFood' },
    grabfood: { fee: 25, fixed: 0, name: 'GrabFood' },
    gofood: { fee: 20, fixed: 1000, name: 'GoFood' },
  },
  promos: [],
};

export const DEFAULT_BANNERS = [
  { id: 1, title: 'Promo Spesial Kemerdekaan', subtitle: 'Diskon merchant hingga 50%', bg: 'from-orange-500 to-amber-600' },
  { id: 2, title: 'Cashback GoFood & GrabFood', subtitle: 'Maksimalkan cuan tokomu hari ini', bg: 'from-emerald-500 to-teal-600' },
];

export const DEFAULT_HOME_PROMOS = [
  { id: 1, name: 'Flash Sale Toko', desc: 'Diskon 30% untuk menu pilihan', merchant: 'shopeefood', type: 'percentage', discount: 30, merchantSubsidy: 100, minPurchase: 0, maxDiscount: 0 },
  { id: 2, name: 'Voucher Kilat', desc: 'Potongan Rp5.000 min belanja Rp30rb', merchant: 'grabfood', type: 'nominal', discount: 5000, merchantSubsidy: 100, minPurchase: 30000, maxDiscount: 0 },
];

export const EMPTY_HOME_ITEM = {
  title: '', subtitle: '', url: '', image: '', showText: true,
  name: '', desc: '', merchant: 'shopeefood', isPackage: false, subPromos: [], type: 'percentage',
  discount: '', merchantSubsidy: '100', minPurchase: '', maxDiscount: '',
};

// Nama tampilan kategori promo. Kunci 'fake' dipertahankan agar promo lama yang sudah tersimpan tetap terbaca.
export const CATEGORY_LABELS = {
  marketplace: 'Marketplace',
  mandiri: 'Mandiri',
  fake: 'Diskon Coret',
};

export const EMPTY_PROMO_FORM = {
  name: '', merchant: '', category: 'marketplace', type: 'percentage', discount: '',
  minPurchase: '', maxDiscount: '', merchantSubsidy: '100', branch: false, fake: false,
};

export const EMPTY_AUTH_FORM = { identifier: '', email: '', password: '', firstName: '', lastName: '', storeName: '' };
