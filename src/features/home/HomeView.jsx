import { useApp } from '../../context/AppContext';
import { Icons } from '../../components/icons/Icons';
import { getBadgeStyle } from '../../utils/format';
import { safeUrl, resolveMerchantKey, isAddablePromo, describeHomePromo } from '../../utils/homeContent';
import { isImageData } from '../../utils/image';
import AddHomeModal from './AddHomeModal';

const BannerCard = ({ banner }) => {
  const { userProfile, banners, setBanners } = useApp();
  const href = safeUrl(banner.url); // hanya http/https yang boleh dibuka
  const Card = href ? 'a' : 'div';
  const linkProps = href ? { href, target: '_blank', rel: 'noopener noreferrer' } : {};
  const img = isImageData(banner.image) ? banner.image : '';
  const showText = banner.showText !== false;

  return (
    <div className="relative flex-shrink-0 w-[280px] sm:w-[320px] h-40 snap-start">
      <Card
        {...linkProps}
        style={img ? { backgroundImage: `url("${img}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
        className={`w-full h-full rounded-[32px] ${img ? 'bg-gray-300' : `p-6 bg-gradient-to-br ${banner.bg}`} text-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] flex flex-col justify-between relative overflow-hidden group ${href ? 'active:scale-[0.98] transition-transform' : ''}`}
      >
        {img ? (
          showText && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent pointer-events-none"></div>
              <div className="relative z-10 mt-auto p-5 pr-12">
                <h4 className="text-base font-black tracking-tight line-clamp-1 drop-shadow-md">{banner.title}</h4>
                {banner.subtitle && <p className="text-xs text-white/90 font-medium line-clamp-1 drop-shadow-sm">{banner.subtitle}</p>}
              </div>
            </>
          )
        ) : (
          <>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -left-4 -top-4 w-20 h-20 bg-black/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="relative z-10 pr-8">
              <span className="inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/30 shadow-sm">Info Eksklusif</span>
              <h4 className="text-lg font-black mt-3 tracking-tight line-clamp-1 drop-shadow-md">{banner.title}</h4>
            </div>
            <p className="text-xs text-white/90 font-medium line-clamp-2 relative z-10 drop-shadow-sm pr-8">{banner.subtitle}</p>
          </>
        )}
        {href && (
          <span className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
            <Icons.ChevronRight size={16} />
          </span>
        )}
      </Card>
      {userProfile?.isAdmin && (
        <button
          type="button"
          aria-label="Hapus banner"
          onClick={() => setBanners((banners || []).filter((b) => b.id !== banner.id))}
          className="absolute bottom-3 right-3 z-20 w-7 h-7 rounded-full bg-black/25 text-white flex items-center justify-center"
        >
          <Icons.Trash2 size={13} />
        </button>
      )}
    </div>
  );
};

const PromoCard = ({ promo }) => {
  const { theme, userProfile, calcSettings, homePromos, setHomePromos, addHomePromoToMine } = useApp();
  const addable = isAddablePromo(promo);
  const added = (calcSettings?.promos || []).some((p) => p.fromHomeId === promo.id);
  const key = resolveMerchantKey(promo.merchant, calcSettings?.marketplaces);
  const merchantName = key ? calcSettings.marketplaces[key].name : promo.merchant;

  return (
    <div className={`p-4 rounded-3xl ${theme.bgContainer} ${theme.shadowOut} flex items-center justify-between gap-2 group transition-all duration-300 hover:shadow-lg`}>
      <button
        type="button"
        onClick={() => addHomePromoToMine(promo)}
        className="flex-1 min-w-0 flex items-center gap-4 text-left"
      >
        <div className={`w-12 h-12 rounded-2xl ${theme.bgContainer} ${theme.shadowIn} flex items-center justify-center text-[#df6a49] flex-shrink-0 relative overflow-hidden`}>
          <Icons.Tag size={20} className="relative z-10" />
        </div>
        <div className="min-w-0 flex flex-col justify-center">
          <h4 className={`text-sm font-bold tracking-tight ${theme.textPrimary} mb-0.5`}>{promo.name}</h4>
          {promo.desc && <p className={`text-[11px] font-medium ${theme.textSecondary} line-clamp-1`}>{promo.desc}</p>}
          {addable && <p className={`text-[10px] font-semibold ${theme.textSecondary} line-clamp-1`}>{describeHomePromo(promo)}</p>}
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-0.5 text-[9px] font-extrabold tracking-wider rounded-md uppercase ${getBadgeStyle(promo.merchant)}`}>
              {merchantName}
            </span>
            {addable && (
              <span className={`flex items-center gap-1 text-[10px] font-bold ${added ? 'text-emerald-600' : 'text-[#df6a49]'}`}>
                {added ? 'Ditambahkan' : (<><Icons.Plus size={11} /> Tambah</>)}
              </span>
            )}
          </div>
        </div>
      </button>
      {userProfile?.isAdmin && (
        <button
          type="button"
          aria-label="Hapus promo"
          onClick={() => setHomePromos((homePromos || []).filter((p) => p.id !== promo.id))}
          className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${theme.textSecondary} hover:text-red-500 hover:bg-red-500/10 transition-colors`}
        >
          <Icons.Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

const HomeView = () => {
  const { userProfile, banners, homePromos, showAddHomeModal, setShowAddHomeModal, theme } = useApp();

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-end px-1 mt-2">
        <div>
          <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${theme.textPrimary}`}>Beranda</h2>
        </div>
        {userProfile?.isAdmin && (
          <button
            type="button"
            onClick={() => setShowAddHomeModal(true)}
            className={`h-9 px-4 rounded-full ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} flex items-center gap-2 text-xs font-bold text-[#df6a49] transition-all`}
          >
            <Icons.Plus size={14} /> Tambah
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <h3 className={`text-[10px] font-bold tracking-widest uppercase ${theme.textSecondary}`}>Highlight Informasi</h3>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 custom-scrollbar snap-x">
          {(banners || []).length === 0 ? (
            <div className={`w-full py-8 rounded-3xl ${theme.bgContainer} ${theme.shadowIn} flex flex-col items-center justify-center text-center opacity-60 border border-dashed ${theme.border}`}>
              <Icons.Sparkles size={20} className={`mb-2 ${theme.textSecondary}`} />
              <p className={`text-[10px] font-medium ${theme.textSecondary}`}>Belum ada banner informasi.</p>
            </div>
          ) : (
            (banners || []).map((banner) => <BannerCard key={banner.id} banner={banner} />)
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="px-2">
          <h3 className={`text-[10px] font-bold tracking-widest uppercase ${theme.textSecondary}`}>Daftar Promo Eksternal</h3>
          <p className={`mt-1 text-[10px] ${theme.textSecondary}`}>Tekan promo untuk menambahkannya ke daftar promomu.</p>
        </div>
        <div className="space-y-4 px-1">
          {(homePromos || []).length === 0 ? (
            <div className={`py-8 rounded-3xl ${theme.bgContainer} ${theme.shadowIn} flex flex-col items-center justify-center text-center opacity-60 border border-dashed ${theme.border}`}>
              <Icons.Tag size={20} className={`mb-2 ${theme.textSecondary}`} />
              <p className={`text-[10px] font-medium ${theme.textSecondary}`}>Belum ada promo eksternal.</p>
            </div>
          ) : (
            (homePromos || []).map((promo) => <PromoCard key={promo.id} promo={promo} />)
          )}
        </div>
      </div>

      {showAddHomeModal && <AddHomeModal />}
    </div>
  );
};

export default HomeView;
