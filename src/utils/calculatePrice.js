
import { parseNum } from './format';

/**
 * Nilai yang ditambahkan ke harga untuk SATU promo.
 *
 * Persentase:
 * beban = dasar x r / (1 - r)
 *
 * Nominal:
 * beban = diskon x subsidi%
 *
 * Minimal belanja ikut diperhitungkan.
 */
export const promoBurden = (currentPrice, promo) => {
  if (!promo || currentPrice <= 0) return 0;

  const value = parseNum(promo.discount, 0);
  const subsidy = parseNum(promo.merchantSubsidy, 100) / 100;
  const maxD = parseNum(promo.maxDiscount, 0);
  const minP = parseNum(promo.minPurchase, 0);

  if (value <= 0 || subsidy <= 0) return 0;

  const burdenAt = (base) => {
    if (promo.type === 'percentage') {
      const rate = (value / 100) * subsidy;
      const uncapped =
        rate < 1 ? (base * rate) / (1 - rate) : Infinity;
      const capped = maxD > 0 ? maxD * subsidy : Infinity;

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

  return Number.isFinite(burden) && burden > 0 ? burden : 0;
};

export const promoAppliesTo = (promo, merchantId) =>
  !promo.merchant ||
  promo.merchant === 'all' ||
  promo.merchant === merchantId;

export const calculatePrice = (netPrice, merchantId, settings) => {
  const mpSetting = settings?.marketplaces?.[merchantId] || {
    fee: 0,
    fixed: 0,
    name: 'Unknown',
  };

  const activeFee = parseNum(mpSetting.fee, 0);
  const activeFixed = parseNum(mpSetting.fixed, 0);

  const breakdown = [];
  let hargaSekarang = netPrice;
  let hasCoret = false;

  // [ADDED] Metadata promo coret terpilih untuk ditampilkan di Riwayat.
  let coretDiscountPercent = null;
  let coretPromoBurden = -1;

  breakdown.push({
    label: 'HARGA NET',
    value: netPrice,
    type: 'base',
  });

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

  const isCoret = (promo) =>
    promo.category === 'fake' || promo.fake;

  const normalStages = [];
  const coretStages = [];

  (settings?.promos || [])
    .filter(
      (promo) =>
        promo.enabled && promoAppliesTo(promo, merchantId)
    )
    .forEach((promo) => {
      if (promo.isPackage) {
        const items = promo.subPromos || [];
        const normalItems = items.filter((item) => !isCoret(item));
        const coretItems = items.filter(isCoret);

        if (normalItems.length > 0) {
          normalStages.push({
            package: promo,
            items: normalItems,
          });
        }

        if (coretItems.length > 0) {
          coretStages.push({
            package: promo,
            items: coretItems,
          });
        }
      } else {
        (isCoret(promo) ? coretStages : normalStages).push({
          package: null,
          items: [promo],
        });
      }
    });

  const rank = (stage) =>
    stage.package
      ? 0
      : stage.items[0].category === 'mandiri'
        ? 2
        : 1;

  const ordered = [...normalStages].sort(
    (a, b) => rank(a) - rank(b)
  );

  const runStage = (stage, coret) => {
    let best = 0;
    let chosen = null;

    stage.items.forEach((item) => {
      const burden = promoBurden(hargaSekarang, item);

      if (burden > best) {
        best = burden;
        chosen = item;
      }
    });

    if (!chosen) return;

    // [ADDED] Catat persentase dari promo coret yang benar-benar terpilih.
    // Jika ada beberapa promo coret terpilih, gunakan yang bebannya terbesar.
    if (coret && best > coretPromoBurden) {
      coretPromoBurden = best;

      coretDiscountPercent =
        chosen.type === 'percentage' &&
        parseNum(chosen.discount, 0) > 0
          ? parseNum(chosen.discount, 0)
          : null;
    }

    const name = (
      stage.package
        ? stage.package.name
        : chosen.name || 'Promo'
    ).toUpperCase();

    const label = coret
      ? `DISKON CORET (${name})`
      : stage.package
        ? `PAKET (${name})`
        : `PROMO (${name})`;

    let sub = coret ? 'Dihitung terakhir' : 'Promo';

    if (stage.package) {
      sub = `Terbesar dari ${stage.items.length} promo${
        coret ? ' • terakhir' : ''
      }`;
    }

    hargaSekarang += best;

    if (coret) hasCoret = true;

    breakdown.push({
      label,
      sub,
      value: best,
      type: 'add',
    });
  };

  ordered.forEach((stage) => runStage(stage, false));
  coretStages.forEach((stage) => runStage(stage, true));

  return {
    finalPricePerItem: Math.round(hargaSekarang),
    breakdown: breakdown.map((item) => ({
      ...item,
      value: Math.round(item.value),
    })),
    merchantName: mpSetting.name || merchantId,
    hasCoret,

    // [ADDED] Persentase asli promo coret terpilih.
    coretDiscountPercent,
  };
};
