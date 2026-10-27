import { parseNum } from './format';
import { formatDiscount } from './promoLabels';
import { DEFAULT_HOME_PROMOS } from '../constants/defaults';

/**
 * Rapikan link banner. Hanya http/https yang diterima (menolak javascript:, data:, dll).
 * Tanpa skema ("tokopedia.com/x") otomatis dianggap https. Mengembalikan '' bila tidak valid.
 */
export const safeUrl = (raw) => {
  const v = String(raw || '').trim();
  if (!v) return '';
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v}`;
  try {
    const u = new URL(withScheme);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : '';
  } catch {
    return '';
  }
};

/** Cocokkan nilai merchant ('shopeefood' atau 'ShopeeFood') ke kunci marketplace. */
export const resolveMerchantKey = (merchant, marketplaces = {}) => {
  const m = String(merchant || '').toLowerCase();
  return Object.keys(marketplaces).find((k) => k === m || String(marketplaces[k]?.name || '').toLowerCase() === m) || null;
};

/** Promo beranda bisa ditambahkan ke promo pengguna hanya jika punya nilai diskon (atau isi paket). */
export const isAddablePromo = (hp) => {
  if (!hp) return false;
  if (hp.isPackage) return (hp.subPromos || []).some((i) => parseNum(i.discount, 0) > 0);
  return parseNum(hp.discount, 0) > 0;
};

/** Ringkasan promo, mis. "10% • Subsidi 49% • Min Rp25.000". */
export const describeHomePromo = (hp) => {
  if (hp.isPackage) return `Paket • ${(hp.subPromos || []).length} promo • hanya yang terbesar dipakai`;
  const parts = [formatDiscount({ type: hp.type || 'percentage', discount: parseNum(hp.discount, 0) })];
  parts.push(`Subsidi ${parseNum(hp.merchantSubsidy, 100)}%`);
  const min = parseNum(hp.minPurchase, 0);
  if (min > 0) parts.push(`Min Rp${min.toLocaleString('id-ID')}`);
  const max = parseNum(hp.maxDiscount, 0);
  if (max > 0) parts.push(`Maks Rp${max.toLocaleString('id-ID')}`);
  return parts.join(' • ');
};

/** Ubah promo beranda menjadi promo milik pengguna (tunggal, bukan coret). */
export const buildPromoFromHome = (hp, merchantKey) =>
  hp.isPackage ? buildPackageFromHome(hp, merchantKey) : buildSingleFromHome(hp, merchantKey);

const buildSingleFromHome = (hp, merchantKey) => ({
  id: Date.now(),
  name: hp.name,
  merchant: merchantKey,
  category: 'marketplace',
  enabled: true,
  type: hp.type || 'percentage',
  discount: parseNum(hp.discount, 0),
  minPurchase: parseNum(hp.minPurchase, 0),
  maxDiscount: parseNum(hp.maxDiscount, 0),
  merchantSubsidy: parseNum(hp.merchantSubsidy, 100),
  branch: false,
  fake: false,
  fromHomeId: hp.id, // penanda agar promo yang sama tidak ditambahkan dua kali
});

// Paket (sifat branch): dari semua isinya hanya yang terbesar dipakai saat menghitung.
const buildPackageFromHome = (hp, merchantKey) => {
  const base = Date.now();
  return {
    id: base,
    name: hp.name,
    merchant: merchantKey,
    isPackage: true,
    enabled: true,
    fromHomeId: hp.id,
    subPromos: (hp.subPromos || [])
      .filter((i) => parseNum(i.discount, 0) > 0)
      .map((i, idx) => ({
        id: base + idx + 1,
        category: 'marketplace',
        type: i.type || 'percentage',
        discount: parseNum(i.discount, 0),
        minPurchase: parseNum(i.minPurchase, 0),
        maxDiscount: parseNum(i.maxDiscount, 0),
        merchantSubsidy: parseNum(i.merchantSubsidy, 100),
        branch: false,
        fake: false,
      })),
  };
};

/** Promo contoh lama (tanpa nilai diskon) dilengkapi dengan data bawaan yang sudah terstruktur. */
export const upgradeHomePromos = (list) =>
  (list || []).map((p) => {
    if (isAddablePromo(p)) return p;
    const d = DEFAULT_HOME_PROMOS.find((x) => x.id === p.id && x.name === p.name);
    return d ? { ...d, desc: p.desc ?? d.desc } : p;
  });
