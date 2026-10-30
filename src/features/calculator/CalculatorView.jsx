import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../components/icons/Icons';
import SettingsSheet from './SettingsSheet';

const CalculatorView = () => {
  const {
    calcData,
    calcResult,
    setShowSettings,
    calcSettings,
    theme,
    handleCalcChange,
    handleCalculate,
    sortedMenus,
    selectMenuItem,
  } = useApp();

  // [ADDED] Mengatur input mana yang sedang aktif.
  const [activeInput, setActiveInput] = useState(null);
  // [ADDED] Custom picker replaces Android's native select popup.
  const [activePicker, setActivePicker] = useState(null);

  // Rincian kalkulasi tertutup secara default; tutup lagi tiap hasil berubah.
  const [showDetail, setShowDetail] = useState(false);
  useEffect(() => { setShowDetail(false); }, [calcResult]);

  const selectedMenuId = sortedMenus.some(
    (menu) => String(menu.id) === String(calcData.menuId)
  )
    ? String(calcData.menuId)
    : '';

  const nameActive = activeInput === 'name';
  const priceActive = activeInput === 'price';

  // [ADDED] Kelas fleksibel agar input melebar secara smooth.
  const nameFlex = priceActive ? 'flex-[0.75]' : 'flex-[1.5]';
  const priceFlex = nameActive ? 'flex-[0.75]' : 'flex-[1.5]';

  const inputBaseClass =
    `min-w-0 transition-all duration-300 ease-in-out ` +
    `${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} ` +
    `focus:outline-none ${theme.inputFocus}`;

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="mb-4 px-1 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            className={`text-xl sm:text-2xl font-extrabold tracking-tight ${theme.textPrimary}`}
          >
            Kalkulator
          </h2>

          <p className={`text-xs mt-0.5 font-medium ${theme.textSecondary}`}>
            Hitung harga jual sesuai target Net.
          </p>
        </div>
      </div>

      <div className="space-y-4 px-1">
        {/* [MODIFIED] Nama dan harga dengan animasi melebar. */}
        <div className="flex items-end gap-2.5">
          {/* Nama Menu + dropdown menu tersimpan */}
          <div
            className={`min-w-0 space-y-1.5 transition-all duration-300 ease-in-out ${nameFlex}`}
          >
            <label
              htmlFor="calculator-menu-name"
              className={`text-[10px] font-bold tracking-widest uppercase ml-1 ${theme.textSecondary}`}
            >
              Nama Menu
            </label>

            <div
              className={`relative rounded-2xl transition-all duration-300 ${
                nameActive ? 'ring-1 ring-[#df6a49]/50' : ''
              }`}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Icons.Tag size={14} />
              </div>

              <input
                id="calculator-menu-name"
                type="text"
                name="name"
                value={calcData.name || ''}
                onFocus={() => setActiveInput('name')}
                onBlur={() => setActiveInput(null)}
                onChange={handleCalcChange}
                placeholder="Nama menu"
                autoComplete="off"
                className={`w-full h-12 pl-9 ${
                  sortedMenus.length > 0 ? 'pr-9' : 'pr-3'
                } rounded-2xl text-xs font-semibold ${inputBaseClass}`}
              />

              {/* [MODIFIED] Open the app-styled saved-menu picker instead of native select. */}
              {sortedMenus.length > 0 && (
                <button
                  type="button"
                  aria-label="Pilih menu tersimpan"
                  onClick={() => setActivePicker('menu')}
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-gray-400"
                >
                  <Icons.ChevronRight size={13} className="rotate-90" />
                </button>
              )}
            </div>
          </div>

          {/* Harga Net */}
          <div
            className={`min-w-0 space-y-1.5 transition-all duration-300 ease-in-out ${priceFlex}`}
          >
            <label
              htmlFor="calculator-net-price"
              className={`text-[10px] font-bold tracking-widest uppercase ml-1 ${theme.textSecondary}`}
            >
              Harga Net
            </label>

            <div
              className={`relative rounded-2xl transition-all duration-300 ${
                priceActive ? 'ring-1 ring-[#df6a49]/50' : ''
              }`}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-bold text-gray-400 text-xs">
                Rp
              </div>

              <input
                id="calculator-net-price"
                type="number"
                name="hargaNet"
                value={calcData.hargaNet || ''}
                onFocus={() => setActiveInput('price')}
                onBlur={() => setActiveInput(null)}
                onChange={handleCalcChange}
                placeholder="0"
                inputMode="numeric"
                className={`w-full h-12 pl-9 pr-2 rounded-2xl text-xs font-bold text-right ${inputBaseClass}`}
              />
            </div>
          </div>
        </div>

        {/* Platform Merchant */}
        <div className="flex gap-3 items-end">
          <div className="flex-1 min-w-0 space-y-1.5">
            <label
              htmlFor="calculator-merchant"
              className={`text-[10px] font-bold tracking-widest uppercase ml-1 ${theme.textSecondary}`}
            >
              Platform Merchant
            </label>

            {/* [MODIFIED] Theme-aware marketplace picker trigger. */}
            <button
              id="calculator-merchant"
              type="button"
              onClick={() => setActivePicker('merchant')}
              className={`relative w-full h-12 pl-9 pr-8 rounded-2xl text-left ${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} focus:outline-none ${theme.inputFocus} text-xs font-semibold cursor-pointer transition-all active:scale-[0.99]`}
            >
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <Icons.Store size={14} />
              </span>
              {calcSettings?.marketplaces?.[calcData.merchant || 'shopeefood']?.name || 'Pilih marketplace'}
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <Icons.ChevronRight size={14} className="rotate-90" />
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowSettings(true)}
            aria-label="Pengaturan kalkulator"
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} text-[#df6a49] transition-all`}
          >
            <Icons.Settings size={18} />
          </button>
        </div>

        {/* Tombol kalkulasi */}
        <button
          type="button"
          onClick={handleCalculate}
          className="w-full h-12 mt-2 rounded-2xl bg-black text-white font-bold text-xs tracking-wide shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:bg-gray-800 transition-all active:scale-[0.98]"
        >
          Hitung Harga Jual
        </button>

        {/* Hasil kalkulasi */}
        {calcResult ? (
          <div className={`mt-5 p-4 rounded-3xl ${theme.bgContainer} ${theme.shadowOut} flex flex-col`}>
            {/* Harga jual final langsung tampil */}
            <div className="px-2 py-1 text-center">
              <p className={`text-[9px] font-bold uppercase tracking-widest ${theme.textSecondary} mb-0.5`}>
                Harga Jual Final
              </p>

              <h4 className="text-3xl font-black text-[#df6a49] tracking-tight">
                Rp {(calcResult?.finalPricePerItem || 0).toLocaleString('id-ID')}
              </h4>
            </div>

            {/* Tombol lihat / sembunyikan detail */}
            <button
              type="button"
              onClick={() => setShowDetail((v) => !v)}
              aria-expanded={showDetail}
              className={`mt-3 mx-auto h-8 px-4 rounded-full ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} flex items-center gap-1.5 text-[10px] font-bold ${theme.textSecondary} transition-all`}
            >
              {showDetail ? 'Sembunyikan Detail' : 'Lihat Detail'}
              <Icons.ChevronRight
                size={12}
                className={`transition-transform duration-300 ${showDetail ? '-rotate-90' : 'rotate-90'}`}
              />
            </button>

            {/* Rincian (animasi buka/tutup) */}
            <div
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                showDetail ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden min-h-0">
                <div className={`w-full space-y-2.5 p-3.5 rounded-2xl ${theme.bgContainer} ${theme.shadowIn} text-xs`}>
                  {(calcResult?.breakdown || []).map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-start ${
                        item.type === 'base'
                          ? 'border-b border-gray-400/20 pb-2.5 mb-1'
                          : ''
                      }`}
                    >
                      <div className="flex flex-col max-w-[65%]">
                        <span
                          className={`font-bold ${
                            item.type === 'base'
                              ? theme.textPrimary
                              : theme.textSecondary
                          }`}
                        >
                          {item.label}
                        </span>

                        {item.sub && (
                          <span className={`text-[9px] ${theme.textSecondary} opacity-70 mt-0.5 leading-tight`}>
                            {item.sub}
                          </span>
                        )}
                      </div>

                      <span
                        className={`font-bold ${
                          item.type === 'base'
                            ? theme.textPrimary
                            : 'text-[#df6a49]'
                        }`}
                      >
                        {item.type === 'add' ? '+ ' : ''}
                        Rp{(item.value || 0).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`mt-5 h-36 rounded-3xl ${theme.bgContainer} ${theme.shadowIn} flex flex-col items-center justify-center text-center opacity-60`}>
            <Icons.Calculator
              size={26}
              className={`mb-2.5 ${theme.textSecondary}`}
            />

            <p className={`text-xs font-medium ${theme.textSecondary}`}>
              Harga jual final akan muncul di sini.
            </p>
          </div>
        )}
      </div>

      {/* [ADDED] Custom bottom sheet for marketplace and saved-menu selection. */}
      {activePicker && (
        <div
          className="fixed inset-0 z-[300] flex items-end justify-center"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setActivePicker(null); }}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[3px] animate-[pickerFadeIn_180ms_ease-out]" />
          <section
            role="dialog"
            aria-modal="true"
            aria-label={activePicker === 'merchant' ? 'Pilih marketplace' : 'Pilih menu tersimpan'}
            className={`relative z-10 mb-3 mx-3 w-full max-w-lg overflow-hidden rounded-[28px] p-3 ${theme.bgContainer} ${theme.shadowOut} animate-[pickerSlideUp_240ms_cubic-bezier(0.22,1,0.36,1)]`}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-400/40" />
            <div className="px-3 pb-3">
              <h3 className={`text-sm font-extrabold tracking-tight ${theme.textPrimary}`}>
                {activePicker === 'merchant' ? 'Pilih Marketplace' : 'Pilih Menu'}
              </h3>
              <p className={`mt-1 text-[11px] ${theme.textSecondary}`}>
                {activePicker === 'merchant' ? 'Pilih platform untuk perhitungan harga.' : 'Gunakan menu yang sudah tersimpan.'}
              </p>
            </div>
            <div className="max-h-[48vh] overflow-y-auto custom-scrollbar space-y-1">
              {activePicker === 'merchant' ? (
                Object.entries(calcSettings?.marketplaces || {}).map(([key, data]) => {
                  const selected = (calcData.merchant || 'shopeefood') === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        handleCalcChange({ target: { name: 'merchant', value: key } });
                        setActivePicker(null);
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all active:scale-[0.99] ${selected ? 'bg-[#df6a49]/10 ring-1 ring-[#df6a49]/30' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                    >
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.bgContainer} ${theme.shadowIn} ${selected ? 'text-[#df6a49]' : theme.textSecondary}`}>
                        <Icons.Store size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={`block text-sm font-bold ${theme.textPrimary}`}>{data?.name || key}</span>
                        <span className={`mt-0.5 block text-[10px] ${theme.textSecondary}`}>Platform merchant</span>
                      </span>
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-[#df6a49] bg-[#df6a49]' : 'border-gray-400/50'}`}>
                        {selected && <span className="text-[11px] font-black text-white">✓</span>}
                      </span>
                    </button>
                  );
                })
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setActivePicker(null)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${!selectedMenuId ? 'bg-[#df6a49]/10 ring-1 ring-[#df6a49]/30' : ''}`}
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.bgContainer} ${theme.shadowIn} ${theme.textSecondary}`}>
                      <Icons.Plus size={17} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm font-bold ${theme.textPrimary}`}>Input manual</span>
                      <span className={`mt-0.5 block text-[10px] ${theme.textSecondary}`}>Tetap gunakan nama dan harga yang diketik</span>
                    </span>
                    {!selectedMenuId && <span className="text-sm font-black text-[#df6a49]">✓</span>}
                  </button>
                  {sortedMenus.map((menu) => {
                    const selected = selectedMenuId === String(menu.id);
                    return (
                      <button
                        key={menu.id}
                        type="button"
                        onClick={() => { selectMenuItem(menu.id); setActivePicker(null); }}
                        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all active:scale-[0.99] ${selected ? 'bg-[#df6a49]/10 ring-1 ring-[#df6a49]/30' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                      >
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.bgContainer} ${theme.shadowIn} ${selected ? 'text-[#df6a49]' : theme.textSecondary}`}>
                          <Icons.Tag size={17} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={`block truncate text-sm font-bold ${theme.textPrimary}`}>{menu.name}</span>
                          <span className={`mt-0.5 block text-[10px] ${theme.textSecondary}`}>Rp {Number(menu.hargaNet || 0).toLocaleString('id-ID')}</span>
                        </span>
                        {selected && <span className="text-sm font-black text-[#df6a49]">✓</span>}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => setActivePicker(null)}
              className={`mt-2 h-11 w-full rounded-2xl text-xs font-bold ${theme.bgContainer} ${theme.shadowOut} ${theme.textSecondary} active:scale-[0.99] transition-all`}
            >
              Tutup
            </button>
          </section>
          <style>{`
            @keyframes pickerFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes pickerSlideUp { from { opacity: 0; transform: translateY(24px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          `}</style>
        </div>
      )}

      <SettingsSheet />
    </div>
  );
};

export default CalculatorView;