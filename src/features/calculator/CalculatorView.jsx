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
  // [ADDED] Controls the custom marketplace and saved-menu pickers.
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

              {/* [MODIFIED] Open saved menus in a themed dropdown directly below the name input. */}
              {sortedMenus.length > 0 && (
                <button
                  type="button"
                  aria-label="Pilih menu tersimpan"
                  onClick={() => setActivePicker(activePicker === 'menu' ? null : 'menu')}
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-3 text-gray-400"
                >
                  <Icons.ChevronRight size={13} className="rotate-90" />
                </button>
              )}
              {activePicker === 'menu' && (
                <div className={`absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl p-2 ${theme.bgContainer} ${theme.shadowOut} border border-gray-400/10 animate-[pickerDropIn_180ms_ease-out]`}>
                  <div className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${theme.textSecondary}`}>Menu tersimpan</div>
                  <div className="max-h-52 overflow-y-auto">
                    {sortedMenus.map((menu) => {
                      const selected = selectedMenuId === String(menu.id);
                      return (
                        <button
                          key={menu.id}
                          type="button"
                          onClick={() => {
                            selectMenuItem(menu.id);
                            setActivePicker(null);
                          }}
                          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${selected ? 'bg-[#df6a49]/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${theme.shadowIn} ${selected ? 'text-[#df6a49]' : theme.textSecondary}`}>
                            <Icons.Tag size={15} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`block truncate text-xs font-bold ${theme.textPrimary}`}>{menu.name}</span>
                            <span className={`mt-0.5 block text-[10px] ${theme.textSecondary}`}>Rp {Number(menu.hargaNet || 0).toLocaleString('id-ID')}</span>
                          </span>
                          {selected && <span className="text-sm font-black text-[#df6a49]">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
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

            {/* [MODIFIED] Marketplace picker opens centered on the screen. */}
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

      {/* [ADDED] Centered marketplace picker overlay. */}
      {activePicker === 'merchant' && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center p-5"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setActivePicker(null); }}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[3px] animate-[pickerFadeIn_180ms_ease-out]" />
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Pilih marketplace"
            className={`relative z-10 w-full max-w-sm overflow-hidden rounded-[26px] p-3 ${theme.bgContainer} ${theme.shadowOut} animate-[pickerCenterIn_220ms_cubic-bezier(0.22,1,0.36,1)]`}
          >
            <div className="px-3 py-2">
              <h3 className={`text-sm font-extrabold ${theme.textPrimary}`}>Pilih Marketplace</h3>
              <p className={`mt-1 text-[11px] ${theme.textSecondary}`}>Pilih platform untuk perhitungan harga.</p>
            </div>
            <div className="mt-2 space-y-1">
              {Object.entries(calcSettings?.marketplaces || {}).map(([key, data]) => {
                const selected = (calcData.merchant || 'shopeefood') === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      handleCalcChange({ target: { name: 'merchant', value: key } });
                      setActivePicker(null);
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${selected ? 'bg-[#df6a49]/10 ring-1 ring-[#df6a49]/30' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                  >
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.shadowIn} ${selected ? 'text-[#df6a49]' : theme.textSecondary}`}>
                      <Icons.Store size={16} />
                    </span>
                    <span className={`flex-1 text-sm font-bold ${theme.textPrimary}`}>{data?.name || key}</span>
                    {selected && <span className="text-sm font-black text-[#df6a49]">✓</span>}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setActivePicker(null)}
              className={`mt-2 h-10 w-full rounded-xl text-xs font-bold ${theme.shadowIn} ${theme.textSecondary}`}
            >
              Tutup
            </button>
          </section>
          <style>{`
            @keyframes pickerFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes pickerCenterIn { from { opacity: 0; transform: translateY(8px) scale(.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
            @keyframes pickerDropIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
        </div>
      )}

      <SettingsSheet />
    </div>
  );
};

export default CalculatorView;