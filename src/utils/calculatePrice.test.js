import { describe, it, expect } from 'vitest';
import { calculatePrice } from './calculatePrice';

const settings = {
  marketplaces: {
    shopeefood: { fee: 20, fixed: 0, name: 'ShopeeFood' },
    gofood: { fee: 20, fixed: 1000, name: 'GoFood' },
  },
  promos: [],
};

const promo = (o = {}) => ({
  id: 1, name: 'P', category: 'marketplace', enabled: true, type: 'percentage',
  discount: 10, minPurchase: 0, maxDiscount: 0, merchantSubsidy: 100, branch: false, fake: false, ...o,
});

const price = (promos, merchant = 'shopeefood') =>
  calculatePrice(10000, merchant, { ...settings, promos }).finalPricePerItem;

describe('biaya admin', () => {
  it('menambah biaya admin persentase', () => {
    expect(price([])).toBe(12500);
  });

  it('menambah fixed fee', () => {
    expect(price([], 'gofood')).toBe(13500);
  });

  it('mengembalikan rincian dan nama marketplace', () => {
    const r = calculatePrice(10000, 'shopeefood', settings);
    expect(r.merchantName).toBe('ShopeeFood');
    expect(r.breakdown[0]).toMatchObject({ label: 'HARGA NET', value: 10000, type: 'base' });
    expect(r.breakdown[1]).toMatchObject({ label: 'BIAYA ADMIN', value: 2500, type: 'add' });
  });
});

describe('promo tunggal', () => {
  it('promo dihitung dari harga terbaru (net + admin) sebagai net baru', () => {
    // 13.000 + admin 20% = 16.250; promo 10% -> 16.250 / 0,9 = 18.055,56
    const r = calculatePrice(13000, 'shopeefood', { ...settings, promos: [promo()] });
    expect(r.breakdown[1].value).toBe(3250);
    expect(r.finalPricePerItem).toBe(18056);
    // harga akhir dikurangi diskon 10% kembali ke 16.250
    expect(Math.round(r.finalPricePerItem * 0.9)).toBe(16250);
  });

  it('promo kedua ditambah setelah harga terbaru dari promo pertama', () => {
    const p2 = promo({ id: 2, category: 'mandiri', type: 'nominal', discount: 2000 });
    expect(calculatePrice(13000, 'shopeefood', { ...settings, promos: [promo(), p2] }).finalPricePerItem).toBe(20056);
    const p3 = promo({ id: 3, category: 'mandiri', discount: 5 });
    expect(calculatePrice(13000, 'shopeefood', { ...settings, promos: [promo(), p3] }).finalPricePerItem).toBe(19006);
  });

  it('promo marketplace biasa pada net 10.000', () => {
    expect(price([promo()])).toBe(13889);
  });

  it('maks. diskon membatasi promo persentase', () => {
    expect(price([promo({ maxDiscount: 500 })])).toBe(13000);
  });

  it('subsidi toko di bawah 100% hanya menanggung sebagian diskon', () => {
    expect(price([promo({ merchantSubsidy: 50 })])).toBe(13158);
  });

  it('mengabaikan promo nonaktif', () => {
    expect(price([promo({ enabled: false })])).toBe(12500);
  });
});

describe('minimal belanja', () => {
  it('lebih besar dari harga terbaru: diskon dihitung di min belanja lalu dibagi a', () => {
    // harga terbaru 12.500, min belanja 25.000, diskon 10%
    // beban di min belanja = 25.000 x 0,1 / 0,9 = 2.777,78 ; a = 25.000 / 12.500 = 2
    // nilai ditambahkan = 2.777,78 / 2 = 1.388,89
    const r = calculatePrice(10000, 'shopeefood', { ...settings, promos: [promo({ minPurchase: 25000 })] });
    expect(r.breakdown[2].value).toBe(1389);
    expect(r.finalPricePerItem).toBe(13889);
  });

  it('diskon nominal dibagi jumlah item (a)', () => {
    // nominal 5.000, min belanja 25.000, a = 2 -> 2.500 per item
    expect(price([promo({ type: 'nominal', discount: 5000, minPurchase: 25000 })])).toBe(15000);
  });

  it('tetap menghormati maks. diskon', () => {
    // 10% dari 25.000 = 2.777,78 tetapi dibatasi 2.000 -> 2.000 / 2 = 1.000
    expect(price([promo({ maxDiscount: 2000, minPurchase: 25000 })])).toBe(13500);
  });

  it('lebih kecil dari harga terbaru memakai rumus biasa', () => {
    expect(price([promo({ minPurchase: 10000 })])).toBe(13889);
    expect(price([promo({ minPurchase: 10000, maxDiscount: 500 })])).toBe(13000);
  });
});

describe('paket promo (sifat branch)', () => {
  const paket = (items, o = {}) => ({ id: 20, name: 'Paket', isPackage: true, enabled: true, subPromos: items, ...o });

  it('hanya mengambil promo terbesar di dalam paket', () => {
    // net 10.000 -> 12.500; 10% = 1.388,89 dan 20% = 3.125 -> ambil 3.125
    expect(price([paket([promo({ discount: 10 }), promo({ discount: 20 })])])).toBe(15625);
  });

  it('membandingkan nilai yang ditambahkan, bukan angka diskonnya', () => {
    // nominal 2.500 mengalahkan persentase 10% (1.388,89)
    expect(price([paket([promo({ discount: 10 }), promo({ type: 'nominal', discount: 2500 })])])).toBe(15000);
  });

  it('item dengan min belanja ikut bersaing memakai rumus min belanja', () => {
    // nominal 5.000 min 25.000 -> 2.500 per item, mengalahkan 10% (1.388,89)
    const dgMin = promo({ type: 'nominal', discount: 5000, minPurchase: 25000 });
    expect(price([paket([promo({ discount: 10 }), dgMin])])).toBe(15000);
  });

  it('paket dihitung sebelum promo tunggal, walau ada di urutan belakang', () => {
    // 12.500 -> paket 20% -> 15.625 -> tunggal nominal 1.000 -> 16.625
    const tunggal = promo({ id: 2, type: 'nominal', discount: 1000 });
    expect(price([tunggal, paket([promo({ discount: 20 })])])).toBe(16625);
  });

  it('dua paket masing-masing mengambil yang terbesar di paketnya', () => {
    const a = paket([promo({ discount: 10 }), promo({ discount: 20 })], { id: 21 });
    const b = paket([promo({ type: 'nominal', discount: 1000 }), promo({ type: 'nominal', discount: 500 })], { id: 22 });
    // 12.500 -> +3.125 = 15.625 -> +1.000 = 16.625
    expect(price([a, b])).toBe(16625);
  });

  it('item coret di dalam paket tetap dihitung paling terakhir', () => {
    // 12.500 -> item biasa nominal 1.000 -> 13.500 -> item coret 10% -> 13.500 / 0,9 = 15.000
    const p = paket([promo({ type: 'nominal', discount: 1000 }), promo({ category: 'fake', discount: 10 })]);
    expect(price([p])).toBe(15000);
    const r = calculatePrice(10000, 'shopeefood', { ...settings, promos: [p] });
    expect(r.breakdown[r.breakdown.length - 1].label).toContain('DISKON CORET');
  });
});

describe('diskon coret', () => {
  it('selalu dihitung paling terakhir, walau ada di urutan pertama', () => {
    // 12.500 -> mandiri nominal 1.000 -> 13.500 -> coret 10% -> 13.500 / 0,9 = 15.000
    const coret = promo({ id: 5, name: 'Coret', category: 'fake', discount: 10 });
    const mandiri = promo({ id: 6, category: 'mandiri', type: 'nominal', discount: 1000 });
    expect(price([coret, mandiri])).toBe(15000);
    const r = calculatePrice(10000, 'shopeefood', { ...settings, promos: [coret, mandiri] });
    expect(r.breakdown[r.breakdown.length - 1].label).toContain('DISKON CORET');
  });

  it('promo bertanda fake tidak dihitung dua kali', () => {
    expect(price([promo({ category: 'marketplace', fake: true })])).toBe(13889);
  });
});

describe('penanda diskon coret (hasCoret)', () => {
  const run = (promos) => calculatePrice(10000, 'shopeefood', { ...settings, promos });

  it('false tanpa diskon coret', () => {
    expect(run([]).hasCoret).toBe(false);
    expect(run([promo()]).hasCoret).toBe(false);
  });

  it('true bila diskon coret ikut dihitung', () => {
    expect(run([promo({ category: 'fake' })]).hasCoret).toBe(true);
  });

  it('true bila item coret ada di dalam paket', () => {
    const p = { id: 20, name: 'Paket', isPackage: true, enabled: true, subPromos: [promo({ category: 'fake' })] };
    expect(run([p]).hasCoret).toBe(true);
  });

  it('false bila diskon coret dinonaktifkan atau tidak berlaku di marketplace itu', () => {
    expect(run([promo({ category: 'fake', enabled: false })]).hasCoret).toBe(false);
    expect(run([promo({ category: 'fake', merchant: 'gofood' })]).hasCoret).toBe(false);
  });
});

describe('promo per marketplace', () => {
  const calc = (merchant, promos) =>
    calculatePrice(10000, merchant, { ...settings, promos }).finalPricePerItem;

  it('promo khusus ShopeeFood tidak ikut dihitung di GoFood', () => {
    const khusus = promo({ merchant: 'shopeefood' });
    expect(calc('shopeefood', [khusus])).toBe(13889);
    expect(calc('gofood', [khusus])).toBe(13500); // hanya admin 20% + 1.000
  });

  it("merchant 'all' berlaku di semua marketplace", () => {
    const semua = promo({ merchant: 'all' });
    expect(calc('shopeefood', [semua])).toBe(13889);
    expect(calc('gofood', [semua])).toBeGreaterThan(13500);
  });

  it('promo lama tanpa field merchant tetap berlaku di semua marketplace', () => {
    expect(calc('shopeefood', [promo()])).toBe(13889);
    expect(calc('gofood', [promo()])).toBeGreaterThan(13500);
  });

  it('paket promo mengikuti marketplace-nya', () => {
    const paket = {
      id: 9, name: 'Paket', isPackage: true, enabled: true, merchant: 'shopeefood',
      subPromos: [promo({ category: 'mandiri' })],
    };
    expect(calc('shopeefood', [paket])).toBe(13889);
    expect(calc('gofood', [paket])).toBe(13500);
  });

  it('paket hanya bersaing di marketplace-nya', () => {
    const mk = (id, discount, merchant) => ({ id, name: 'P' + id, isPackage: true, enabled: true, merchant, subPromos: [promo({ discount })] });
    const besarShopee = mk(1, 30, 'shopeefood');
    const kecilGo = mk(2, 10, 'gofood');
    expect(calc('gofood', [besarShopee, kecilGo])).toBe(calc('gofood', [kecilGo]));
  });
});
