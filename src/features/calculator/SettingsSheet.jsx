import { useApp } from '../../context/AppContext';
import { Icons } from '../../components/icons/Icons';
import PromoForm from './PromoForm';
import { promoTags } from '../../utils/promoLabels';
import { promoAppliesTo } from '../../utils/calculatePrice';

const SettingsSheet = () => {
  const {
    isDarkMode, calcData, showSettings, setShowSettings, isAddingPromo,
    setIsAddingPromo, calcSettings, theme, togglePromo, deletePromo,
    startEditPromo,
  } = useApp();
  const activeMerchant = calcData?.merchant || 'shopeefood';
  const activeMerchantData = calcSettings?.marketplaces?.[activeMerchant] || { fee: 0, fixed: 0, name: 'Marketplace' };
  // Daftar promo hanya menampilkan yang berlaku untuk marketplace yang sedang dipilih
  const visiblePromos = (calcSettings?.promos || []).filter((p) => promoAppliesTo(p, activeMerchant));

  return (
    <div className={`absolute top-0 left-0 w-full h-full bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 rounded-3xl ${showSettings ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`absolute bottom-0 left-0 w-full h-[92%] ${theme.bgContainer} rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] flex flex-col transition-transform duration-500 ease-out ${showSettings ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className={`flex justify-between items-center p-5 border-b ${theme.border}`}>
                <h3 className={`text-sm font-bold ${theme.textPrimary} flex items-center gap-2`}><Icons.Settings size={18} className="text-[#df6a49]"/> Pengaturan</h3>
                <button onClick={() => {setShowSettings(false); setIsAddingPromo(false);}} className={`w-8 h-8 rounded-full ${theme.bgContainer} ${theme.shadowOut} flex items-center justify-center ${theme.textSecondary}`}><Icons.X size={16}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">

                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h4 className={`text-[10px] font-bold tracking-widest ${theme.textSecondary} uppercase`}>Biaya Admin</h4>
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${theme.bgContainer} ${theme.shadowOut} text-[9px] font-bold text-red-500 uppercase tracking-wider`}>
                            <Icons.Lock size={10} /> Terkunci
                        </div>
                    </div>
                    <div className={`p-4 rounded-3xl ${theme.bgContainer} ${theme.shadowIn} flex justify-around items-center relative overflow-hidden`}>
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-400/50"></div>
                        <div className="flex flex-col items-center flex-1">
                            <span className={`text-[10px] font-semibold ${theme.textSecondary} mb-0.5`}>Persentase Fee</span>
                            <span className={`text-xl font-black ${theme.textPrimary}`}>{activeMerchantData?.fee || 0}<span className="text-sm text-gray-500 ml-0.5">%</span></span>
                        </div>
                        <div className={`w-px h-10 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                        <div className="flex flex-col items-center flex-1">
                            <span className={`text-[10px] font-semibold ${theme.textSecondary} mb-0.5`}>Fixed Fee</span>
                            <span className={`text-xl font-black ${theme.textPrimary}`}><span className="text-sm text-gray-500 mr-0.5">Rp</span>{(activeMerchantData?.fixed || 0).toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className={`text-[10px] font-bold tracking-widest ${theme.textSecondary} uppercase`}>Daftar Promo</h4>
                      {!isAddingPromo && (
                          <button onClick={() => setIsAddingPromo(true)} className={`h-7 px-3 rounded-full ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} flex items-center gap-1 text-[10px] font-bold text-[#df6a49]`}>
                              <Icons.Plus size={12} /> Tambah
                          </button>
                      )}
                    </div>

                    {isAddingPromo ? (
                      <PromoForm />
                    ) : (
                      <div className="space-y-3">
                          {visiblePromos.length === 0 ? (
                              <div className={`py-8 rounded-3xl ${theme.bgContainer} ${theme.shadowIn} flex flex-col items-center justify-center text-center opacity-60 border border-dashed ${theme.border}`}>
                                  <Icons.Tag size={20} className={`mb-2 ${theme.textSecondary}`} />
                                  <p className={`text-[10px] font-medium ${theme.textSecondary}`}>Belum ada promo untuk {activeMerchantData.name}.</p>
                              </div>
                          ) : (
                              visiblePromos.map(promo => (
                                  <div key={promo.id} className={`p-3.5 rounded-3xl ${theme.bgContainer} ${theme.shadowOut} border ${promo.enabled ? 'border-[#df6a49]/30' : 'border-transparent'} transition-all flex items-center justify-between`}>
                                      <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                              <p className={`text-xs font-bold ${promo.enabled ? theme.textPrimary : theme.textSecondary}`}>{promo.name}</p>
                                              <span className="px-1.5 py-0.5 text-[8px] font-bold rounded bg-[#df6a49]/10 text-[#df6a49] uppercase tracking-wider">
                                                  {!promo.merchant || promo.merchant === 'all' ? 'Semua' : (calcSettings?.marketplaces?.[promo.merchant]?.name || promo.merchant)}
                                              </span>
                                              {promo.isPackage ? (
                                                  <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded bg-blue-500/10 text-blue-600 uppercase tracking-wider flex items-center gap-1`}><Icons.Package size={9}/> PAKET</span>
                                              ) : (
                                                  promoTags(promo).length > 0 && (
                                                  <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded bg-gray-200 dark:bg-gray-700 ${theme.textSecondary} uppercase tracking-wider`}>
                                                      {promoTags(promo).join(' • ')}
                                                  </span>
                                              )
                                              )}
                                          </div>
                                          <div className={`text-[10px] font-medium ${promo.enabled ? theme.textPrimary : theme.textSecondary} opacity-80 mt-0.5 flex flex-col gap-0.5`}>
                                              {promo.isPackage ? (
                                                  <span>Berisi {(promo.subPromos || []).length} promo • dipilih yang terbesar</span>
                                              ) : (
                                                  <span>{promo.type === 'percentage' ? `${promo.discount}%` : `Rp${(promo.discount || 0).toLocaleString('id-ID')}`} • Subs: {promo.merchantSubsidy}%</span>
                                              )}
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-3">
                                          <button onClick={() => togglePromo(promo.id)} className={`w-10 h-5 rounded-full relative ${theme.shadowIn} flex items-center px-1 transition-colors duration-300`}>
                                              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transform transition-transform duration-300 ${promo.enabled ? 'bg-[#df6a49] translate-x-4' : 'bg-gray-400 translate-x-0'}`}></div>
                                          </button>
                                          <button onClick={() => startEditPromo(promo)} aria-label="Edit promo" className="text-gray-400 hover:text-[#df6a49] transition-colors"><Icons.Edit size={16} /></button>
                                          <button onClick={() => deletePromo(promo.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Icons.Trash2 size={16} /></button>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};

export default SettingsSheet;
