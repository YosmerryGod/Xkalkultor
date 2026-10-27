import { useApp } from '../../context/AppContext';
import { Icons } from '../../components/icons/Icons';
import { promoTags, formatDiscount } from '../../utils/promoLabels';

// ---- komponen kecil khusus form ------------------------------------------

const Section = ({ title, children }) => (
  <section className="space-y-3">
    <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500">{title}</p>
    {children}
  </section>
);

const Segmented = ({ options, value, onChange }) => (
  <div className="flex p-1 rounded-2xl bg-black/5 dark:bg-white/5">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`flex-1 h-9 rounded-xl text-[11px] font-bold transition-all ${
          value === o.value ? 'bg-[#df6a49] text-white shadow-sm' : 'text-gray-500'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const NumberField = ({ label, value, onChange, placeholder, prefix, suffix }) => {
  const { theme } = useApp();
  return (
    <label className="block flex-1 min-w-0">
      <span className="block mb-1.5 ml-1 text-[10px] font-semibold text-gray-500">{label}</span>
      <div className={`flex items-center h-11 px-3.5 rounded-2xl ${theme.inputBg} ${theme.shadowIn}`}>
        {prefix && <span className="mr-1.5 text-[11px] font-semibold text-gray-400">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          placeholder={placeholder}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full min-w-0 bg-transparent focus:outline-none text-sm font-semibold ${theme.textPrimary}`}
        />
        {suffix && <span className="ml-1.5 text-[11px] font-semibold text-gray-400">{suffix}</span>}
      </div>
    </label>
  );
};

const ToggleRow = ({ title, desc, checked, onChange }) => {
  const { theme } = useApp();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className="w-full flex items-center justify-between gap-4 text-left"
    >
      <span className="min-w-0">
        <span className={`block text-xs font-bold ${theme.textPrimary}`}>{title}</span>
        <span className="block mt-0.5 text-[10px] text-gray-500">{desc}</span>
      </span>
      <span className={`w-11 h-6 shrink-0 rounded-full flex items-center px-1 ${theme.shadowIn}`}>
        <span
          className={`w-4 h-4 rounded-full transition-transform duration-300 ${
            checked ? 'bg-[#df6a49] translate-x-5' : 'bg-gray-400 translate-x-0'
          }`}
        />
      </span>
    </button>
  );
};

// ---- form utama -----------------------------------------------------------

const PromoForm = () => {
  const {
    theme, calcData, calcSettings, promoForm, setPromoForm, promoMode, setPromoMode,
    subPromos, setSubPromos, editingPromoId, cancelPromoForm, handleSavePromo, handleAddSubPromo,
  } = useApp();

  const activeMerchant = calcData?.merchant || 'shopeefood';
  const selectedMerchant = promoForm.merchant || activeMerchant;
  const isMulti = promoMode === 'multi';
  const isCoret = promoForm.category === 'fake';
  const isPercent = (promoForm.type || 'percentage') === 'percentage';
  const canSave = !isMulti || (subPromos || []).length > 0;

  const set = (patch) => setPromoForm({ ...promoForm, ...patch });
  const marketplaces = Object.entries(calcSettings?.marketplaces || {});
  const inputCls = `w-full h-11 px-4 rounded-2xl ${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} focus:outline-none text-sm font-semibold`;

  return (
    <div className={`p-5 rounded-3xl ${theme.bgContainer} ${theme.shadowOut} border border-[#df6a49]/20 space-y-6`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={cancelPromoForm}
          aria-label="Kembali"
          className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} text-gray-500`}
        >
          <Icons.ArrowLeft size={15} />
        </button>
        <h5 className={`text-sm font-bold ${theme.textPrimary}`}>{editingPromoId ? 'Edit Promo' : 'Promo Baru'}</h5>
      </div>

      {!editingPromoId && (
        <div className="space-y-2">
          <Segmented
            value={promoMode}
            onChange={setPromoMode}
            options={[{ value: 'single', label: 'Promo Tunggal' }, { value: 'multi', label: 'Paket Promo' }]}
          />
          {isMulti && (
            <p className="px-1 text-[10px] text-gray-500">
              Dari semua promo di dalam paket, hanya yang nilainya paling besar yang dipakai.
            </p>
          )}
        </div>
      )}

      {/* Informasi */}
      <Section title="Informasi">
        <label className="block">
          <span className="block mb-1.5 ml-1 text-[10px] font-semibold text-gray-500">{isMulti ? 'Nama Paket' : 'Nama Promo'}</span>
          <input
            type="text"
            placeholder={isMulti ? 'Contoh: Paket Merdeka' : 'Contoh: Diskon Gajian'}
            value={promoForm.name || ''}
            onChange={(e) => set({ name: e.target.value })}
            className={inputCls}
          />
        </label>

        <div>
          <span className="block mb-1.5 ml-1 text-[10px] font-semibold text-gray-500">Berlaku di</span>
          <div className="flex flex-wrap gap-2">
            {[...marketplaces.map(([key, m]) => ({ value: key, label: m.name })), { value: 'all', label: 'Semua' }].map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => set({ merchant: o.value })}
                className={`h-8 px-3.5 rounded-full text-[11px] font-bold transition-all ${
                  selectedMerchant === o.value
                    ? 'bg-[#df6a49] text-white shadow-sm'
                    : `${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} text-gray-500`
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Isi paket */}
      {isMulti && (subPromos || []).length > 0 && (
        <Section title={`Isi Paket (${subPromos.length})`}>
          <div className="space-y-2">
            {subPromos.map((sp, idx) => (
              <div key={sp.id ?? idx} className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl ${theme.bgContainer} ${theme.shadowIn}`}>
                <div className="min-w-0">
                  <p className={`text-xs font-bold ${theme.textPrimary}`}>
                    {formatDiscount(sp)}{promoTags(sp).length > 0 ? ` • ${promoTags(sp).join(' • ')}` : ''}
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-500">
                    Subsidi {sp.merchantSubsidy}%{sp.minPurchase > 0 ? ` • Min Rp${sp.minPurchase.toLocaleString('id-ID')}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubPromos((prev) => (prev || []).filter((_, i) => i !== idx))}
                  aria-label="Hapus item"
                  className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full text-red-500 bg-red-500/10"
                >
                  <Icons.X size={12} />
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Diskon */}
      <Section title={isMulti ? 'Tambah Item Promo' : 'Diskon'}>
        <div className={isMulti ? 'p-3.5 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-black/5 dark:bg-white/5 space-y-4' : 'space-y-4'}>
          <Segmented
            value={isPercent ? 'percentage' : 'nominal'}
            onChange={(v) => set({ type: v })}
            options={[{ value: 'percentage', label: 'Persentase (%)' }, { value: 'nominal', label: 'Nominal (Rp)' }]}
          />

          <div className="flex gap-3">
            <NumberField
              label="Nilai Diskon" placeholder="0"
              value={promoForm.discount} onChange={(v) => set({ discount: v })}
              prefix={isPercent ? '' : 'Rp'} suffix={isPercent ? '%' : ''}
            />
            <NumberField
              label="Subsidi Toko" placeholder="100" suffix="%"
              value={promoForm.merchantSubsidy} onChange={(v) => set({ merchantSubsidy: v })}
            />
          </div>

          <div className="flex gap-3">
            <NumberField
              label="Min. Belanja" placeholder="Tanpa minimal" prefix="Rp"
              value={promoForm.minPurchase} onChange={(v) => set({ minPurchase: v })}
            />
            <NumberField
              label="Maks. Diskon" placeholder="Tanpa batas" prefix="Rp"
              value={promoForm.maxDiscount} onChange={(v) => set({ maxDiscount: v })}
            />
          </div>

          <div className="pt-1">
            <ToggleRow
              title="Diskon Coret"
              desc="Dihitung paling terakhir (harga coret)"
              checked={isCoret}
              onChange={() => set({ category: isCoret ? 'marketplace' : 'fake' })}
            />
          </div>

          {isMulti && (
            <button
              type="button"
              onClick={handleAddSubPromo}
              className={`w-full h-10 rounded-xl ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} text-[11px] font-bold text-[#df6a49] flex items-center justify-center gap-1.5`}
            >
              <Icons.Plus size={14} /> Tambahkan ke Paket
            </button>
          )}
        </div>
      </Section>

      {/* Simpan: menempel di bawah supaya selalu terlihat saat form panjang */}
      <div className={`sticky bottom-0 -mx-5 -mb-5 px-5 pt-3 pb-5 rounded-b-3xl ${theme.bgContainer} shadow-[0_-10px_14px_-10px_rgba(0,0,0,0.12)]`}>
        {!canSave && (
          <p className="mb-2 text-center text-[10px] text-gray-500">Tambahkan minimal satu promo ke paket untuk menyimpan.</p>
        )}
        <button
          type="button"
          onClick={handleSavePromo}
          disabled={!canSave}
          className={`w-full h-12 rounded-2xl bg-black text-white font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            canSave ? 'hover:bg-gray-800 active:scale-[0.98]' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          <Icons.Save size={14} />
          {editingPromoId ? 'Simpan Perubahan' : isMulti ? 'Simpan Paket Promo' : 'Simpan Promo'}
        </button>
      </div>
    </div>
  );
};

export default PromoForm;
