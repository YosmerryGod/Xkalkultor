import { useApp } from '../../context/AppContext';
import { Icons } from '../../components/icons/Icons';
import SettingsSheet from './SettingsSheet';

const CalculatorView = () => {
  const {
    calcData, calcResult, setShowSettings, calcSettings, theme,
    handleCalcChange, handleCalculate, sortedMenus, selectMenuItem,
  } = useApp();
  const selectedMenuId = sortedMenus.some((m) => String(m.id) === String(calcData.menuId)) ? String(calcData.menuId) : '';
  return (
    <div className="flex flex-col h-full relative">
        <div className="mb-4 px-1 flex items-start justify-between gap-3">
            <div className="min-w-0">
                <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${theme.textPrimary}`}>Kalkulator</h2>
                <p className={`text-xs mt-0.5 font-medium ${theme.textSecondary}`}>Hitung harga jual sesuai target Net.</p>
            </div>
            <div className="relative flex-shrink-0 w-36">
                <select aria-label="Pilih menu tersimpan" value={selectedMenuId} disabled={sortedMenus.length === 0} onChange={(e) => selectMenuItem(e.target.value)} className={`w-full h-9 pl-3 pr-7 rounded-xl appearance-none ${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} focus:outline-none text-[11px] font-bold cursor-pointer truncate disabled:opacity-60`}>
                    <option value="">{sortedMenus.length ? 'Pilih menu' : 'Belum ada menu'}</option>
                    {sortedMenus.map((m) => (<option key={m.id} value={m.id}>{m.name}</option>))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400"><Icons.ChevronRight size={12} className="rotate-90" /></div>
            </div>
        </div>

        <div className="space-y-4 px-1">
            <div className="flex gap-3">
                <div className="flex-1 space-y-1.5">
                    <label className={`text-[10px] font-bold tracking-widest uppercase ml-1 ${theme.textSecondary}`}>Nama Menu</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Icons.Tag size={14} /></div>
                        <input type="text" name="name" value={calcData.name || ''} onChange={handleCalcChange} placeholder="Item" className={`w-full h-12 pl-9 pr-3 rounded-2xl ${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} focus:outline-none ${theme.inputFocus} text-xs font-semibold`} />
                    </div>
                </div>
                <div className="flex-1 space-y-1.5">
                    <label className={`text-[10px] font-bold tracking-widest uppercase ml-1 ${theme.textSecondary}`}>Harga Net</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-bold text-gray-400 text-xs">Rp</div>
                        <input type="number" name="hargaNet" value={calcData.hargaNet || ''} onChange={handleCalcChange} placeholder="0" className={`w-full h-12 pl-9 pr-3 rounded-2xl ${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} focus:outline-none ${theme.inputFocus} text-xs font-bold text-right`} />
                    </div>
                </div>
            </div>

            <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-1.5">
                    <label className={`text-[10px] font-bold tracking-widest uppercase ml-1 ${theme.textSecondary}`}>Platform Merchant</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Icons.Store size={14} /></div>
                        <select name="merchant" value={calcData.merchant || 'shopeefood'} onChange={handleCalcChange} className={`w-full h-12 pl-9 pr-8 rounded-2xl appearance-none ${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} focus:outline-none ${theme.inputFocus} text-xs font-semibold cursor-pointer`}>
                            {Object.entries(calcSettings?.marketplaces || {}).map(([key, data]) => (
                                <option key={key} value={key}>{data?.name || key}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400"><Icons.ChevronRight size={14} className="rotate-90" /></div>
                    </div>
                </div>
                <button onClick={() => setShowSettings(true)} className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} text-[#df6a49] transition-all`}>
                    <Icons.Settings size={18} />
                </button>
            </div>

            <button onClick={handleCalculate} className={`w-full h-12 mt-2 rounded-2xl bg-black text-white font-bold text-xs tracking-wide shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:bg-gray-800 transition-all active:scale-[0.98]`}>
                Hitung Harga Jual
            </button>

            {calcResult ? (
                <div className={`mt-5 p-4 rounded-3xl ${theme.bgContainer} ${theme.shadowOut} flex flex-col`}>
                    <div className={`w-full space-y-2.5 p-3.5 rounded-2xl ${theme.bgContainer} ${theme.shadowIn} text-xs mb-4`}>
                        {(calcResult?.breakdown || []).map((item, idx) => (
                            <div key={idx} className={`flex justify-between items-start ${item.type === 'base' ? 'border-b border-gray-400/20 pb-2.5 mb-1' : ''}`}>
                                <div className="flex flex-col max-w-[65%]">
                                  <span className={`font-bold ${item.type === 'base' ? theme.textPrimary : theme.textSecondary}`}>{item.label}</span>
                                  {item.sub && <span className={`text-[9px] ${theme.textSecondary} opacity-70 mt-0.5 leading-tight`}>{item.sub}</span>}
                                </div>
                                <span className={`font-bold ${item.type === 'base' ? theme.textPrimary : 'text-[#df6a49]'}`}>
                                    {item.type === 'add' ? '+ ' : ''}Rp{(item.value || 0).toLocaleString('id-ID')}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="px-2 text-center">
                        <p className={`text-[9px] font-bold uppercase tracking-widest ${theme.textSecondary} mb-0.5`}>Harga Jual Final</p>
                        <h4 className={`text-2xl font-black text-[#df6a49] tracking-tight`}>Rp {(calcResult?.finalPricePerItem || 0).toLocaleString('id-ID')}</h4>
                    </div>
                </div>
            ) : (
                <div className={`mt-5 h-36 rounded-3xl ${theme.bgContainer} ${theme.shadowIn} flex flex-col items-center justify-center text-center opacity-60`}>
                    <Icons.Calculator size={26} className={`mb-2.5 ${theme.textSecondary}`} />
                    <p className={`text-xs font-medium ${theme.textSecondary}`}>Detail kalkulasi akan muncul di sini.</p>
                </div>
            )}
        </div>
        <SettingsSheet />
    </div>
  );
};

export default CalculatorView;
