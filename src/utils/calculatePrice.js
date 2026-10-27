import { parseNum } from './format';

/**
 * Nilai yang ditambahkan ke harga untuk SATU promo (semua jenis promo memakai rumus ini).
 *
 * Harga terbaru dianggap sebagai "harga net" baru yang harus tetap kamu terima setelah
 * promo dipotong, persis seperti cara biaya admin dihitung:
 *
 *   persentase : beban = dasar x r / (1 - r)   dengan r = diskon% x subsidi%
 *   nominal    : beban = diskon x subsidi%
 *
 * Batas maks. diskon ikut dihitung.
 *
 * Minimal belanja:
 *   - min belanja <= harga terbaru : "dasar" = harga terbaru (rumus di atas).
 *   - min belanja >  harga terbaru : diskon dihitung pada nilai min belanja (dasar = min belanja),
 *     lalu dibagi a = min belanja / harga terbaru, karena keranjang min belanja berisi
 *     "a" item. Hasilnya beban per item.
 */
export const promoBurden = (currentPrice, promo) => {
  if (!promo || currentPrice <= 0) return 0;
  const value = parseNum(promo.discount, 0);
  const subsidy = parseNum(promo.merchantSubsidy, 100) / 100;
  const maxD = parseNum(promo.maxDiscount, 0);
  const minP = parseNum(promo.minPurchase, 0);
  if (value <= 0 || subsidy <= 0) return 0;

  // Beban toko untuk satu keranjang bernilai `base`
  const burdenAt = (base) => {
    if (promo.type === 'percentage') {
      const rate = (value / 100) * subsidy; // porsi harga baru yang jadi beban toko
      const uncapped = rate < 1 ? (base * rate) / (1 - rate) : Infinity;
      const capped = maxD > 0 ? maxD * subsidy : Infinity; // diskon mentok di batas maks.
      return Math.min(uncapped, capped);
    }
    const nominal = maxD > 0 ? Math.min(value, maxD) : value;
    return nominal * subsidy;
  };

  let burden;
  if (minP > currentPrice) {
    const a = minP / currentPrice;
    burden = burdenAt(minP) / a;
  } else {
    burden = burdenAt(currentPrice);
  }

  return isFinite(burden) && burden > 0 ? burden : 0;
};

/** Promo berlaku untuk marketplace tertentu (merchant = id marketplace atau 'all'). */
export const promoAppliesTo = (promo, merchantId) =>
  !promo.merchant || promo.merchant === 'all' || promo.merchant === merchantId; // tanpa field = promo lama = semua

/**
 * Hitung harga jual dari harga net.
 * Fungsi murni: tidak menyentuh state/UI sehingga mudah dites.
 *
 * @param {number} netPrice    harga net yang ingin diterima toko
 * @param {string} merchantId  kunci marketplace, mis. 'shopeefood'
 * @param {object} settings    { marketplaces, promos }
 * @returns {{ finalPricePerItem: number, breakdown: Array, merchantName: string }}
 */
export const calculatePrice = (netPrice, merchantId, settings) => {
  const mpSetting = settings?.marketplaces?.[merchantId] || { fee: 0, fixed: 0, name: 'Unknown' };
  const activeFee = parseNum(mpSetting.fee, 0);
  const activeFixed = parseNum(mpSetting.fixed, 0);

  const breakdown = [];
  let hargaSekarang = netPrice;

  breakdown.push({ label: 'HARGA NET', value: netPrice, type: 'base' });

  // Biaya admin marketplace
  let hargaDasar = hargaSekarang / (1 - activeFee / 100);
  hargaDasar += activeFixed;
  const biayaAdminTotal = hargaDasar - hargaSekarang;
  hargaSekarang = hargaDasar;
  breakdown.push({
    label: 'BIAYA ADMIN',
    sub: `${activeFee}%${activeFixed > 0 ? ` + Rp${activeFixed}` : ''}`,
    value: biayaAdminTotal,
    type: 'add',
  });

  const isCoret = (p) => p.category === 'fake' || p.fake;

  // Susun "tahap" perhitungan. Satu tahap = satu promo tunggal, atau satu paket
  // (paket bersifat branch: dari semua isinya hanya nilai TERBESAR yang dipakai).
  const normalStages = [];
  const coretStages = [];
  (settings?.promos || [])
    .filter((p) => p.enabled && promoAppliesTo(p, merchantId))
    .forEach((p) => {
      if (p.isPackage) {
        const items = p.subPromos || [];
        const normalItems = items.filter((i) => !isCoret(i));
        const coretItems = items.filter(isCoret);
        if (normalItems.length > 0) normalStages.push({ package: p, items: normalItems });
        if (coretItems.length > 0) coretStages.push({ package: p, items: coretItems }); // item coret dalam paket tetap terakhir
      } else {
        (isCoret(p) ? coretStages : normalStages).push({ package: null, items: [p] });
      }
    });

  // Urutan: paket dulu, lalu promo tunggal (sesuai urutan daftar, kategori "mandiri" lama di belakang),
  // dan diskon coret selalu paling terakhir.
  const rank = (stage) => (stage.package ? 0 : stage.items[0].category === 'mandiri' ? 2 : 1);
  const ordered = [...normalStages].sort((a, b) => rank(a) - rank(b)); // sort stabil: urutan daftar terjaga

  const runStage = (stage, coret) => {
    let best = 0;
    let chosen = null;
    stage.items.forEach((item) => {
      const burden = promoBurden(hargaSekarang, item); // semua dihitung dari harga terbaru yang sama
      if (burden > best) {
        best = burden;
        chosen = item;
      }
    });
    if (!chosen) return;

    const name = (stage.package ? stage.package.name : chosen.name || 'Promo').toUpperCase();
    const label = coret ? `DISKON CORET (${name})` : stage.package ? `PAKET (${name})` : `PROMO (${name})`;
    let sub = coret ? 'Dihitung terakhir' : 'Promo';
    if (stage.package) sub = `Terbesar dari ${stage.items.length} promo${coret ? ' • terakhir' : ''}`;

    hargaSekarang += best;
    breakdown.push({ label, sub, value: best, type: 'add' });
  };

  ordered.forEach((stage) => runStage(stage, false));
  coretStages.forEach((stage) => runStage(stage, true));

  return {
    finalPricePerItem: Math.round(hargaSekarang),
    breakdown: breakdown.map((b) => ({ ...b, value: Math.round(b.value) })),
    merchantName: mpSetting.name || merchantId,
  };
};
