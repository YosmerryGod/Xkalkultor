
import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../components/icons/Icons';
import { getBadgeStyle } from '../../utils/format';

const HistoryView = () => {
  const {
    historyLog,
    setHistoryLog,
    sortOrder,
    setSortOrder,
    merchantFilter,
    setMerchantFilter,
    showFilterMenu,
    setShowFilterMenu,
    calcSettings,
    theme,
    handleEditHistory,
    processedHistory,
    coretFilter,
    setCoretFilter,
  } = useApp();

  const [expandedGroups, setExpandedGroups] = useState({});
  // [ADDED] Filter berdasarkan persentase diskon coret.
  const [coretPercentInput, setCoretPercentInput] = useState('');

  const hasPercentFilter = coretPercentInput.trim() !== '';

  const hasActiveFilter =
    coretFilter !== 'all' ||
    (merchantFilter || 'all') !== 'all' ||
    hasPercentFilter;

  // [ADDED] Filter persentase harus cocok dengan angka yang dimasukkan.
  const percentValue = Number(coretPercentInput);

  const filteredHistory = (processedHistory || []).filter((item) => {
    if (!hasPercentFilter) return true;

    return (
      item.hasCoret === true &&
      Number.isFinite(percentValue) &&
      percentValue > 0 &&
      Number(item.coretDiscountPercent) === percentValue
    );
  });

  // Kelompokkan riwayat berdasarkan nama menu dan marketplace.
  const groupedHistory = filteredHistory.reduce((groups, item) => {
    const groupKey = JSON.stringify([
      String(item.name || 'Item Tanpa Nama').trim().toLowerCase(),
      String(item.merchant || 'shopeefood').trim().toLowerCase(),
    ]);

    if (!groups[groupKey]) {
      groups[groupKey] = {
        key: groupKey,
        name: item.name || 'Item Tanpa Nama',
        merchant: item.merchant || 'shopeefood',
        merchantName: item.merchantName || item.merchant || 'Marketplace',
        items: [],
      };
    }

    groups[groupKey].items.push(item);
    return groups;
  }, {});

  const groupedItems = Object.values(groupedHistory);

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const deleteGroup = (group) => {
    const idsToDelete = new Set(group.items.map((item) => item.id));

    setHistoryLog((prev) =>
      (prev || []).filter((item) => !idsToDelete.has(item.id))
    );

    setExpandedGroups((prev) => ({
      ...prev,
      [group.key]: false,
    }));
  };

  const resetFilters = () => {
    setCoretPercentInput('');
    setCoretFilter('all');
    setMerchantFilter('all');
    setShowFilterMenu(false);
  };

  return (
    <div className="flex flex-col h-full relative pb-4">
      {/* Header Riwayat */}
      <div className="mb-3 px-1 flex justify-between items-center relative z-30">
        <div>
          <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${theme.textPrimary}`}>
            Riwayat
          </h2>

          <p className={`text-[10px] mt-0.5 ${theme.textSecondary}`}>
            {groupedItems.length} menu ditemukan
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              aria-label="Filter riwayat"
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${theme.bgContainer} ${theme.shadowOut} ${theme.textSecondary} hover:text-[#df6a49] transition-all ${
                showFilterMenu || hasActiveFilter ? 'text-[#df6a49]' : ''
              }`}
            >
              <Icons.ListFilter size={15} />
            </button>

            {showFilterMenu && (
              <div
                className={`absolute right-0 top-10 mt-1 w-60 max-w-[85vw] ${theme.bgContainer} rounded-2xl ${theme.shadowOut} border ${theme.border} p-3 flex flex-col gap-4 z-50`}
              >
                {/* Pengurutan */}
                <div>
                  <p className={`text-[9px] font-bold uppercase tracking-widest ${theme.textSecondary} mb-2`}>
                    Urutkan Riwayat
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSortOrder('newest');
                        setShowFilterMenu(false);
                      }}
                      className={`py-2 text-[10px] font-bold rounded-xl ${
                        sortOrder === 'newest'
                          ? 'bg-[#df6a49] text-white'
                          : `${theme.bgContainer} ${theme.shadowIn} ${theme.textSecondary}`
                      }`}
                    >
                      Terbaru
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSortOrder('oldest');
                        setShowFilterMenu(false);
                      }}
                      className={`py-2 text-[10px] font-bold rounded-xl ${
                        sortOrder === 'oldest'
                          ? 'bg-[#df6a49] text-white'
                          : `${theme.bgContainer} ${theme.shadowIn} ${theme.textSecondary}`
                      }`}
                    >
                      Terlama
                    </button>
                  </div>
                </div>

                {/* Filter marketplace */}
                <div>
                  <label className={`block text-[9px] font-bold uppercase tracking-widest ${theme.textSecondary} mb-2`}>
                    Marketplace
                  </label>

                  <select
                    value={merchantFilter || 'all'}
                    onChange={(e) => setMerchantFilter(e.target.value)}
                    className={`w-full h-9 px-3 text-xs font-semibold rounded-xl ${theme.bgContainer} ${theme.shadowIn} ${theme.textPrimary} outline-none border-none`}
                  >
                    <option value="all">Semua Marketplace</option>

                    {Object.entries(calcSettings?.marketplaces || {}).map(
                      ([key, data]) => (
                        <option key={key} value={key}>
                          {data?.name || key}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Filter status diskon coret */}
                <div>
                  <p className={`text-[9px] font-bold uppercase tracking-widest ${theme.textSecondary} mb-2`}>
                    Status Diskon Coret
                  </p>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      ['all', 'Semua'],
                      ['coret', 'Pakai'],
                      ['nocoret', 'Tanpa'],
                    ].map(([value, label]) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setCoretFilter(value)}
                        className={`py-2 text-[10px] font-bold rounded-lg ${
                          coretFilter === value
                            ? 'bg-[#df6a49] text-white'
                            : `${theme.bgContainer} ${theme.shadowIn} ${theme.textSecondary}`
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* [ADDED] Filter berdasarkan persentase diskon */}
                <div>
                  <label
                    htmlFor="coret-percent-filter"
                    className={`block text-[9px] font-bold uppercase tracking-widest ${theme.textSecondary} mb-2`}
                  >
                    Persentase Diskon Coret
                  </label>

                  <div className={`flex items-center gap-2 h-10 px-3 rounded-xl ${theme.bgContainer} ${theme.shadowIn}`}>
                    <Icons.ListFilter
                      size={14}
                      className={theme.textSecondary}
                    />

                    <input
                      id="coret-percent-filter"
                      type="number"
                      min="0"
                      max="100"
                      step="any"
                      inputMode="decimal"
                      placeholder="Contoh: 30"
                      value={coretPercentInput}
                      onChange={(e) => setCoretPercentInput(e.target.value)}
                      className={`w-full min-w-0 bg-transparent outline-none text-sm font-bold ${theme.textPrimary}`}
                    />

                    <span className={`text-sm font-bold ${theme.textSecondary}`}>
                      %
                    </span>
                  </div>

                  <p className={`text-[9px] leading-relaxed mt-2 ${theme.textSecondary}`}>
                    Hanya menampilkan kalkulasi dengan persentase diskon yang sama persis.
                  </p>

                  {hasPercentFilter && (
                    <button
                      type="button"
                      onClick={() => setCoretPercentInput('')}
                      className="mt-2 text-[10px] font-bold text-[#df6a49]"
                    >
                      Hapus filter persentase
                    </button>
                  )}
                </div>

                {/* Reset filter */}
                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className={`w-full py-2.5 rounded-xl text-[10px] font-bold text-[#df6a49] ${theme.bgContainer} ${theme.shadowOut}`}
                  >
                    Reset Semua Filter
                  </button>
                )}
              </div>
            )}
          </div>

          {(historyLog || []).length > 0 && (
            <button
              type="button"
              onClick={() => {
                setHistoryLog([]);
                setExpandedGroups({});
              }}
              className={`h-8 px-3 flex items-center text-[10px] font-bold text-red-500 rounded-lg ${theme.bgContainer} ${theme.shadowOut}`}
            >
              Hapus Semua
            </button>
          )}
        </div>
      </div>

      {/* Indikator filter aktif */}
      {hasPercentFilter && (
        <div className="px-1 mb-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#df6a49]/10 text-[#df6a49] text-[10px] font-bold">
            Diskon coret {coretPercentInput}%
          </span>

          <button
            type="button"
            onClick={() => setCoretPercentInput('')}
            className={`text-[10px] font-semibold ${theme.textSecondary}`}
          >
            Hapus
          </button>
        </div>
      )}

      {/* Daftar kartu riwayat */}
      <div className="space-y-2 px-1 pb-4">
        {groupedItems.length === 0 ? (
          <div className={`mt-5 px-4 py-8 rounded-2xl ${theme.bgContainer} ${theme.shadowIn} flex flex-col items-center justify-center text-center`}>
            <Icons.Clock
              size={24}
              className={`mb-2 ${theme.textSecondary}`}
            />

            <p className={`text-xs font-bold ${theme.textPrimary}`}>
              Tidak ada riwayat yang cocok
            </p>

            <p className={`text-[10px] mt-1 ${theme.textSecondary}`}>
              Coba ubah persentase atau filter yang digunakan.
            </p>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 text-xs font-bold text-[#df6a49]"
              >
                Reset filter
              </button>
            )}
          </div>
        ) : (
          groupedItems.map((group) => {
            const latestItem = group.items[0];
            const isExpanded = !!expandedGroups[group.key];
            const discountPercent = Number(
              latestItem.coretDiscountPercent
            );

            const showDiscountCircle =
              latestItem.hasCoret &&
              Number.isFinite(discountPercent) &&
              discountPercent > 0;

            return (
              <div
                key={group.key}
                className={`rounded-2xl ${theme.bgContainer} ${theme.shadowOut} overflow-hidden`}
              >
                {/* Kartu compact */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.key)}
                  aria-expanded={isExpanded}
                  className="w-full px-3 py-2.5 text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4 className={`text-sm font-bold truncate ${theme.textPrimary}`}>
                          {group.name}
                        </h4>

                        {showDiscountCircle && (
                          <span
                            title={`Diskon coret ${discountPercent}%`}
                            className="inline-flex items-center justify-center w-7 h-7 shrink-0 rounded-full border-2 border-[#df6a49] text-[#df6a49] text-[9px] font-extrabold"
                          >
                            {discountPercent}%
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 min-w-0">
                        <span className={`px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded ${getBadgeStyle(group.merchant)}`}>
                          {group.merchantName}
                        </span>

                        <span className={`text-[9px] ${theme.textSecondary} truncate`}>
                          {group.items.length} riwayat
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[8px] font-bold uppercase tracking-wide text-[#df6a49]">
                        Harga jual
                      </span>

                      <span className="text-sm font-black text-[#df6a49]">
                        Rp {(latestItem.finalPrice || 0).toLocaleString('id-ID')}
                      </span>

                      <span className={`text-[9px] ${theme.textSecondary}`}>
                        Net Rp {(latestItem.hargaNet || 0).toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center ${theme.bgContainer} ${theme.shadowOut} ${theme.textSecondary}`}>
                      <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                        <Icons.ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </button>

                {/* Detail riwayat */}
                {isExpanded && (
                  <div className={`mx-3 mb-3 pt-3 border-t ${theme.border}`}>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="min-w-0">
                        <h5 className={`text-xs font-extrabold ${theme.textPrimary}`}>
                          Riwayat Perubahan Harga
                        </h5>

                        <p className={`text-[9px] mt-0.5 ${theme.textSecondary}`}>
                          {group.merchantName} · {group.items.length} kalkulasi
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteGroup(group)}
                        aria-label={`Hapus riwayat ${group.name}`}
                        className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center ${theme.bgContainer} ${theme.shadowOut} text-red-500`}
                      >
                        <Icons.Trash2 size={12} />
                      </button>
                    </div>

                    <div className="space-y-2 max-h-[320px] overflow-y-auto overscroll-contain pr-1">
                      {group.items.map((item, index) => (
                        <div
                          key={item.id}
                          className={`p-2.5 rounded-xl ${theme.bgContainer} ${theme.shadowIn}`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9px] font-bold ${theme.textSecondary}`}>
                                  Kalkulasi #{group.items.length - index}
                                </span>

                                {index === 0 && (
                                  <span className="px-1 py-0.5 text-[7px] font-extrabold rounded bg-[#df6a49]/10 text-[#df6a49]">
                                    TERBARU
                                  </span>
                                )}
                              </div>

                              <span className={`text-[9px] mt-0.5 ${theme.textSecondary} flex items-center gap-1`}>
                                <Icons.Clock size={9} />
                                {item.timestamp}
                              </span>
                            </div>

                            <div className="flex gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleEditHistory(item)}
                                aria-label="Edit kalkulasi"
                                className={`w-7 h-7 rounded-full flex items-center justify-center ${theme.bgContainer} ${theme.shadowOut} text-blue-500`}
                              >
                                <Icons.Edit size={11} />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setHistoryLog((prev) =>
                                    (prev || []).filter(
                                      (historyItem) => historyItem.id !== item.id
                                    )
                                  );
                                }}
                                aria-label="Hapus kalkulasi"
                                className={`w-7 h-7 rounded-full flex items-center justify-center ${theme.bgContainer} ${theme.shadowOut} text-red-500`}
                              >
                                <Icons.Trash2 size={11} />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className={`block text-[8px] font-bold uppercase ${theme.textSecondary}`}>
                                Harga net
                              </span>

                              <span className={`text-xs font-bold ${theme.textPrimary}`}>
                                Rp {(item.hargaNet || 0).toLocaleString('id-ID')}
                              </span>
                            </div>

                            <Icons.ChevronRight
                              size={12}
                              className={`${theme.textSecondary} opacity-50 shrink-0`}
                            />

                            <div className="min-w-0 text-right">
                              <span className={`block text-[8px] font-bold uppercase ${theme.textSecondary}`}>
                                Harga jual
                              </span>

                              <span className="text-sm font-black text-[#df6a49]">
                                Rp {(item.finalPrice || 0).toLocaleString('id-ID')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryView;
