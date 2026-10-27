import { describe, it, expect } from 'vitest';
import { calculatePrice } from './calculatePrice';
import { safeUrl, resolveMerchantKey, isAddablePromo, describeHomePromo, buildPromoFromHome, upgradeHomePromos } from './homeContent';

const marketplaces = {
  shopeefood: { fee: 20, fixed: 0, name: 'ShopeeFood' },
  gofood: { fee: 20, fixed: 1000, name: 'GoFood' },
};

// Promo Lapar Shopee: diskon 10%, subsidi merchant 49%, min belanja 25.000
const laparShopee = {
  id: 7, name: 'Promo Lapar Shopee', merchant: 'shopeefood', type: 'percentage',
  discount: 10, merchantSubsidy: 49, minPurchase: 25000, maxDiscount: 0,
};

describe('link banner', () => {
  it('menerima link http/https', () => {
    expect(safeUrl('https://contoh.com/kelas')).toBe('https://contoh.com/kelas');
  });

  it('menambahkan https bila tanpa skema', () => {
    expect(safeUrl('tokopedia.com/x')).toBe('https://tokopedia.com/x');
  });

  it('menolak skema berbahaya dan kosong', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('');
    expect(safeUrl('data:text/html,hi')).toBe('');
    expect(safeUrl('ftp://x.com')).toBe('');
    expect(safeUrl('')).toBe('');
  });
});

describe('promo beranda', () => {
  it('mengenali marketplace dari kunci maupun nama lama', () => {
    expect(resolveMerchantKey('shopeefood', marketplaces)).toBe('shopeefood');
    expect(resolveMerchantKey('ShopeeFood', marketplaces)).toBe('shopeefood');
    expect(resolveMerchantKey('zzz', marketplaces)).toBe(null);
  });

  it('hanya promo dengan nilai diskon yang bisa ditambahkan', () => {
    expect(isAddablePromo(laparShopee)).toBe(true);
    expect(isAddablePromo({ id: 1, name: 'Info saja' })).toBe(false);
    expect(isAddablePromo({ discount: 0 })).toBe(false);
  });

  it('membuat ringkasan promo', () => {
    expect(describeHomePromo(laparShopee)).toBe('10% • Subsidi 49% • Min Rp25.000');
  });

  it('mengubah promo beranda menjadi promo pengguna', () => {
    const p = buildPromoFromHome(laparShopee, 'shopeefood');
    expect(p.merchant).toBe('shopeefood');
    expect(p.category).toBe('marketplace');
    expect(p.enabled).toBe(true);
    expect(p.merchantSubsidy).toBe(49);
    expect(p.minPurchase).toBe(25000);
    expect(p.fromHomeId).toBe(7);
  });

  it('promo contoh lama dilengkapi data bawaan', () => {
    const [p] = upgradeHomePromos([{ id: 1, name: 'Flash Sale Toko', desc: 'lama', merchant: 'ShopeeFood' }]);
    expect(p.discount).toBe(30);
    expect(isAddablePromo(p)).toBe(true);
  });
});

describe('promo beranda dalam perhitungan', () => {
  const settings = (promos) => ({ marketplaces, promos });
  const mine = buildPromoFromHome(laparShopee, 'shopeefood');
  const biasa = { id: 1, name: 'A', category: 'marketplace', enabled: true, type: 'nominal', discount: 1000, minPurchase: 0, maxDiscount: 0, merchantSubsidy: 100, merchant: 'all' };
  const coret = { id: 2, name: 'Coret', category: 'fake', enabled: true, type: 'percentage', discount: 10, minPurchase: 0, maxDiscount: 0, merchantSubsidy: 100, merchant: 'all' };

  it('dihitung dengan rumus min belanja (a = 25.000 / harga terbaru)', () => {
    // 12.500 -> a = 2 -> 25.000 x 0,049 / 0,951 = 1.288,01 -> / 2 = 644
    const r = calculatePrice(10000, 'shopeefood', settings([mine]));
    expect(r.breakdown[2].value).toBe(644);
    expect(r.finalPricePerItem).toBe(13144);
  });

  it('ditambahkan paling akhir sebelum diskon coret', () => {
    const r = calculatePrice(10000, 'shopeefood', settings([biasa, mine, coret]));
    const labels = r.breakdown.map((b) => b.label);
    expect(labels[labels.length - 2]).toContain('PROMO LAPAR SHOPEE');
    expect(labels[labels.length - 1]).toContain('DISKON CORET');
    expect(r.finalPricePerItem).toBe(15773);
  });

  it('tidak berlaku di marketplace lain', () => {
    expect(calculatePrice(10000, 'gofood', settings([mine])).finalPricePerItem).toBe(13500);
  });
});

describe('paket promo beranda (sifat branch)', () => {
  const paket = {
    id: 9, name: 'Paket Gajian', merchant: 'shopeefood', isPackage: true,
    subPromos: [
      { type: 'percentage', discount: 10, merchantSubsidy: 100, minPurchase: 0, maxDiscount: 0 },
      { type: 'percentage', discount: 20, merchantSubsidy: 100, minPurchase: 0, maxDiscount: 0 },
    ],
  };

  it('paket dengan isi bisa ditambahkan, paket kosong tidak', () => {
    expect(isAddablePromo(paket)).toBe(true);
    expect(isAddablePromo({ ...paket, subPromos: [] })).toBe(false);
  });

  it('ringkasan paket', () => {
    expect(describeHomePromo(paket)).toBe('Paket • 2 promo • hanya yang terbesar dipakai');
  });

  it('diubah menjadi paket milik pengguna', () => {
    const p = buildPromoFromHome(paket, 'shopeefood');
    expect(p.isPackage).toBe(true);
    expect(p.fromHomeId).toBe(9);
    expect(p.subPromos.length).toBe(2);
    expect(p.subPromos[0].category).toBe('marketplace');
  });

  it('saat dihitung hanya promo terbesar di paket yang dipakai', () => {
    // 12.500 -> 10% = 1.388,89 ; 20% = 3.125 -> ambil 3.125
    const p = buildPromoFromHome(paket, 'shopeefood');
    const r = calculatePrice(10000, 'shopeefood', { marketplaces, promos: [p] });
    expect(r.finalPricePerItem).toBe(15625);
  });
});
