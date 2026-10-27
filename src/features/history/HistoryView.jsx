import { useApp } from '../../context/AppContext';
import { Icons } from '../../components/icons/Icons';
import { getBadgeStyle } from '../../utils/format';

const HistoryView = () => {
  const {
    historyLog, setHistoryLog, sortOrder, setSortOrder, merchantFilter,
    setMerchantFilter, showFilterMenu, setShowFilterMenu, calcSettings, theme,
    handleEditHistory, processedHistory,
  } = useApp();
  return (
    <div className="flex flex-col h-full relative pb-4">
        <div className="mb-4 px-1 flex justify-between items-end relative z-30">
            <div>
                <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${theme.textPrimary}`}>Riwayat</h2>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative">
                    <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`h-8 px-2.5 rounded-lg flex items-center justify-center ${theme.bgContainer} ${theme.shadowOut} ${theme.textSecondary} hover:text-[#df6a49] transition-all ${showFilterMenu ? 'text-[#df6a49]' : ''}`}>
                        <Icons.ListFilter size={15} />
                    </button>

                    {showFilterMenu && (
                        <div className={`absolute right-0 top-10 mt-1 w-48 ${theme.bgContainer} rounded-2xl ${theme.shadowOut} border ${theme.border} p-3 flex flex-col gap-3 z-50`}>
                            <div>
                                <p className={`text-[9px] font-bold uppercase tracking-widest ${theme.textSecondary} mb-2`}>Urutkan</p>
                                <div className="flex gap-2">
                                    <button onClick={() => {setSortOrder('newest'); setShowFilterMenu(false);}} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg ${sortOrder === 'newest' ? 'bg-[#df6a49] text-white' : `${theme.bgContainer} ${theme.shadowIn} ${theme.textSecondary}`}`}>Baru</button>
                                    <button onClick={() => {setSortOrder('oldest'); setShowFilterMenu(false);}} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg ${sortOrder === 'oldest' ? 'bg-[#df6a49] text-white' : `${theme.bgContainer} ${theme.shadowIn} ${theme.textSecondary}`}`}>Lama</button>
                                </div>
                            </div>
                            <div>
                                <p className={`text-[9px] font-bold uppercase tracking-widest ${theme.textSecondary} mb-2`}>Platform</p>
                                <select value={merchantFilter || 'all'} onChange={(e) => {setMerchantFilter(e.target.value); setShowFilterMenu(false);}} className={`w-full h-8 px-2 text-[11px] font-bold rounded-lg ${theme.bgContainer} ${theme.shadowIn} ${theme.textPrimary} outline-none border-none`}>
                                    <option value="all">Semua Platform</option>
                                    {Object.entries(calcSettings?.marketplaces || {}).map(([key, data]) => (<option key={key} value={key}>{data?.name || key}</option>))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {(historyLog || []).length > 0 && (
                    <button onClick={() => setHistoryLog([])} className={`h-8 px-3 flex items-center text-[10px] font-bold text-red-500 rounded-lg ${theme.bgContainer} ${theme.shadowOut}`}>
                        Hapus Semua
                    </button>
                )}
            </div>
        </div>

        <div className="space-y-4 px-1 pb-4">
            {(processedHistory || []).length === 0 ? (
                <div className={`mt-5 h-36 rounded-3xl ${theme.bgContainer} ${theme.shadowIn} flex flex-col items-center justify-center opacity-60`}>
                    <Icons.Clock size={26} className={`mb-2.5 ${theme.textSecondary}`} />
                    <p className={`text-xs font-medium ${theme.textSecondary}`}>Riwayat kosong.</p>
                </div>
            ) : (
                (processedHistory || []).map(item => (
                    <div key={item.id} className={`p-4 rounded-3xl ${theme.bgContainer} ${theme.shadowOut} flex flex-col gap-3`}>
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-1">
                                <span className={`self-start px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-md ${getBadgeStyle(item.merchant)}`}>{item.merchantName}</span>
                                <h4 className={`text-base font-bold ${theme.textPrimary}`}>{item.name}</h4>
                                <span className={`text-[9px] font-medium ${theme.textSecondary} flex items-center gap-1`}><Icons.Clock size={10}/> {item.timestamp}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEditHistory(item)} className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.bgContainer} ${theme.shadowOut} text-blue-500`}><Icons.Edit size={12} /></button>
                                <button onClick={() => setHistoryLog(prev => (prev || []).filter(h => h.id !== item.id))} className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.bgContainer} ${theme.shadowOut} text-red-500`}><Icons.Trash2 size={12} /></button>
                            </div>
                        </div>
                        <div className={`flex items-center justify-between p-3 rounded-2xl ${theme.bgContainer} ${theme.shadowIn}`}>
                            <div className="flex flex-col">
                                <span className={`text-[9px] font-bold uppercase ${theme.textSecondary}`}>Net</span>
                                <span className={`text-sm font-bold ${theme.textPrimary}`}>Rp {(item.hargaNet || 0).toLocaleString('id-ID')}</span>
                            </div>
                            <Icons.ChevronRight size={14} className={`${theme.textSecondary} opacity-50`} />
                            <div className="flex flex-col items-end">
                                <span className={`text-[9px] font-bold uppercase ${theme.textSecondary}`}>Jual Online</span>
                                <span className={`text-lg font-black text-[#df6a49]`}>Rp {(item.finalPrice || 0).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};

export default HistoryView;
