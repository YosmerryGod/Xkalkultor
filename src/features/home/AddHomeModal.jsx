import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../components/icons/Icons';
import { fileToBannerImage, BANNER_SIZE } from '../../utils/image';
import { describeHomePromo } from '../../utils/homeContent';
import { parseNum } from '../../utils/format';

const Field = ({ label, children }) => (
  <label className="block">
    <span className="block mb-1 ml-1 text-[10px] font-semibold text-gray-500">{label}</span>
    {children}
  </label>
);

const Segmented = ({ options, value, onChange }) => (
  <div className="flex p-1 rounded-2xl bg-black/5 dark:bg-white/5">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`flex-1 h-8 rounded-xl text-[11px] font-bold transition-all ${value === o.value ? 'bg-[#df6a49] text-white shadow-sm' : 'text-gray-500'}`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const AddHomeModal = () => {
  const {
    theme, calcSettings, homeAddType, setHomeAddType, newHomeItem, setNewHomeItem,
    setShowAddHomeModal, handleAddHomeItem, showToast,
  } = useApp();
  const [busy, setBusy] = useState(false);

  const set = (patch) => setNewHomeItem((prev) => ({ ...prev, ...patch }));
  const isPercent = (newHomeItem.type || 'percentage') === 'percentage';
  const isPackage = !!newHomeItem.isPackage;
  const items = newHomeItem.subPromos || [];
  const marketplaces = Object.entries(calcSettings?.marketplaces || {});
  const inputCls = `w-full h-10 px-3 rounded-xl ${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} focus:outline-none text-xs`;

  const onPickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // supaya file yang sama bisa dipilih lagi
    if (!file) return;
    setBusy(true);
    try {
      const data = await fileToBannerImage(file);
      set({ image: data });
    } catch (err) {
      showToast(err.message || 'Gagal memuat gambar.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const addItem = () => {
    if (parseNum(newHomeItem.discount, 0) <= 0) return showToast('Isi nilai diskon dulu.', 'error');
    set({
      subPromos: [...items, {
        type: newHomeItem.type || 'percentage',
        discount: parseNum(newHomeItem.discount, 0),
        merchantSubsidy: parseNum(newHomeItem.merchantSubsidy, 100),
        minPurchase: parseNum(newHomeItem.minPurchase, 0),
        maxDiscount: parseNum(newHomeItem.maxDiscount, 0),
      }],
      discount: '', merchantSubsidy: '100', minPurchase: '', maxDiscount: '',
    });
  };

  const discountFields = (
    <div className="space-y-3">
      <Segmented
        value={isPercent ? 'percentage' : 'nominal'}
        onChange={(v) => set({ type: v })}
        options={[{ value: 'percentage', label: 'Persentase (%)' }, { value: 'nominal', label: 'Nominal (Rp)' }]}
      />
      <div className="grid grid-cols-2 gap-3">
        <Field label={isPercent ? 'Diskon (%)' : 'Diskon (Rp)'}>
          <input type="number" inputMode="decimal" placeholder="0" value={newHomeItem.discount ?? ''} onChange={(e) => set({ discount: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Subsidi Merchant (%)">
          <input type="number" inputMode="decimal" placeholder="100" value={newHomeItem.merchantSubsidy ?? ''} onChange={(e) => set({ merchantSubsidy: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Min. Belanja (Rp)">
          <input type="number" inputMode="decimal" placeholder="Tanpa minimal" value={newHomeItem.minPurchase ?? ''} onChange={(e) => set({ minPurchase: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Maks. Diskon (Rp)">
          <input type="number" inputMode="decimal" placeholder="Tanpa batas" value={newHomeItem.maxDiscount ?? ''} onChange={(e) => set({ maxDiscount: e.target.value })} className={inputCls} />
        </Field>
      </div>
    </div>
  );

  const tab = (value, label) => (
    <button
      type="button"
      onClick={() => setHomeAddType(value)}
      className={`flex-1 h-9 rounded-xl text-xs font-bold transition-all ${
        homeAddType === value ? 'bg-black text-white shadow-md' : `${theme.bgContainer} ${theme.shadowOut} ${theme.textSecondary}`
      }`}
    >
      {label}
    </button>
  );

  const modal = (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className={`w-full max-w-sm max-h-full flex flex-col ${theme.bgContainer} rounded-3xl ${theme.shadowOut} border ${theme.border}`}>
        {/* Header (tetap di atas) */}
        <div className="p-5 pb-3 space-y-4 shrink-0">
          <div className="flex justify-between items-center">
            <h4 className={`text-sm font-bold ${theme.textPrimary}`}>Tambah Konten</h4>
            <button
              type="button"
              onClick={() => setShowAddHomeModal(false)}
              aria-label="Tutup"
              className={`w-7 h-7 rounded-full ${theme.bgContainer} ${theme.shadowOut} flex items-center justify-center ${theme.textSecondary}`}
            >
              <Icons.X size={14} />
            </button>
          </div>
          <div className="flex gap-2">
            {tab('promo', 'Promo')}
            {tab('banner', 'Banner')}
          </div>
        </div>

        {/* Isi (bisa di-scroll) */}
        <div className="px-5 pb-3 flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-3">
          {homeAddType === 'banner' ? (
            <>
              <Field label="Judul Banner">
                <input type="text" placeholder="Contoh: Diskon HP Terbaru" value={newHomeItem.title || ''} onChange={(e) => set({ title: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Keterangan">
                <input type="text" placeholder="Contoh: Beli lewat link affiliate kami" value={newHomeItem.subtitle || ''} onChange={(e) => set({ subtitle: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Link tujuan (opsional)">
                <input type="url" inputMode="url" autoCapitalize="none" placeholder="https://..." value={newHomeItem.url || ''} onChange={(e) => set({ url: e.target.value })} className={inputCls} />
              </Field>

              <div>
                <span className="block mb-1 ml-1 text-[10px] font-semibold text-gray-500">Gambar banner (opsional)</span>
                {newHomeItem.image ? (
                  <div className="relative rounded-2xl overflow-hidden aspect-[2/1] bg-black/10">
                    <img src={newHomeItem.image} alt="Pratinjau banner" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => set({ image: '' })}
                      aria-label="Hapus gambar"
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center"
                    >
                      <Icons.X size={13} />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center gap-1 h-24 rounded-2xl border border-dashed ${theme.border} ${theme.inputBg} ${theme.textSecondary} cursor-pointer`}>
                    <Icons.Plus size={18} />
                    <span className="text-[11px] font-semibold">{busy ? 'Memproses gambar...' : 'Pilih gambar dari galeri'}</span>
                    <input type="file" accept="image/*" onChange={onPickImage} disabled={busy} className="hidden" />
                  </label>
                )}
                <p className="mt-1.5 px-1 text-[10px] leading-relaxed text-gray-500">
                  Ukuran pas: <b>{BANNER_SIZE.width} × {BANNER_SIZE.height} px</b> (rasio 2:1, JPG/PNG/WebP). Gambar otomatis
                  dipotong dari tengah dan dikompres, jadi taruh teks atau objek penting di bagian tengah.
                </p>
              </div>

              {newHomeItem.image && (
                <button
                  type="button"
                  role="switch"
                  aria-checked={newHomeItem.showText !== false}
                  onClick={() => set({ showText: newHomeItem.showText === false })}
                  className="w-full flex items-center justify-between gap-4 text-left"
                >
                  <span className="min-w-0">
                    <span className={`block text-xs font-bold ${theme.textPrimary}`}>Tampilkan judul di atas gambar</span>
                    <span className="block mt-0.5 text-[10px] text-gray-500">Matikan kalau teks sudah ada di dalam gambar</span>
                  </span>
                  <span className={`w-11 h-6 shrink-0 rounded-full flex items-center px-1 ${theme.shadowIn}`}>
                    <span className={`w-4 h-4 rounded-full transition-transform duration-300 ${newHomeItem.showText !== false ? 'bg-[#df6a49] translate-x-5' : 'bg-gray-400 translate-x-0'}`} />
                  </span>
                </button>
              )}
              <p className="px-1 text-[10px] text-gray-500">Saat banner ditekan, link terbuka di tab baru. Cocok untuk affiliate atau pendaftaran kelas.</p>
            </>
          ) : (
            <>
              <Segmented
                value={isPackage ? 'package' : 'single'}
                onChange={(v) => set({ isPackage: v === 'package' })}
                options={[{ value: 'single', label: 'Promo Tunggal' }, { value: 'package', label: 'Paket Promo' }]}
              />
              {isPackage && (
                <p className="px-1 text-[10px] text-gray-500">Dari semua promo di dalam paket, hanya yang nilainya paling besar yang dipakai (sifat branch).</p>
              )}

              <Field label={isPackage ? 'Nama Paket' : 'Nama Promo'}>
                <input type="text" placeholder={isPackage ? 'Contoh: Paket Gajian' : 'Contoh: Promo Lapar Shopee'} value={newHomeItem.name || ''} onChange={(e) => set({ name: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Deskripsi (opsional)">
                <input type="text" placeholder="Tampil di bawah nama promo" value={newHomeItem.desc || ''} onChange={(e) => set({ desc: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Marketplace">
                <select value={newHomeItem.merchant || 'shopeefood'} onChange={(e) => set({ merchant: e.target.value })} className={`${inputCls} appearance-none`}>
                  {marketplaces.map(([key, m]) => (<option key={key} value={key}>{m.name}</option>))}
                </select>
              </Field>

              {isPackage && items.length > 0 && (
                <div className="space-y-2">
                  <span className="block ml-1 text-[10px] font-bold tracking-widest uppercase text-gray-500">Isi Paket ({items.length})</span>
                  {items.map((it, idx) => (
                    <div key={idx} className={`flex items-center justify-between gap-3 px-3 py-2 rounded-xl ${theme.bgContainer} ${theme.shadowIn}`}>
                      <p className={`text-[11px] font-semibold ${theme.textPrimary}`}>{describeHomePromo(it)}</p>
                      <button
                        type="button"
                        onClick={() => set({ subPromos: items.filter((_, i) => i !== idx) })}
                        aria-label="Hapus item"
                        className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-red-500 bg-red-500/10"
                      >
                        <Icons.X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className={isPackage ? 'p-3 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-black/5 dark:bg-white/5' : ''}>
                {isPackage && <span className="block mb-2 text-[10px] font-bold tracking-widest uppercase text-gray-500">Tambah Item Promo</span>}
                {discountFields}
                {isPackage && (
                  <button
                    type="button"
                    onClick={addItem}
                    className={`mt-3 w-full h-9 rounded-xl ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} text-[11px] font-bold text-[#df6a49] flex items-center justify-center gap-1.5`}
                  >
                    <Icons.Plus size={13} /> Tambahkan ke Paket
                  </button>
                )}
              </div>

              <p className="px-1 text-[10px] text-gray-500">
                Saat pengguna menekan promo ini, otomatis masuk ke daftar promo marketplace-nya dan dihitung paling akhir sebelum diskon coret.
              </p>
            </>
          )}
        </div>

        {/* Tombol simpan (selalu terlihat) */}
        <div className="p-5 pt-3 shrink-0 border-t border-black/5 dark:border-white/10">
          <button type="button" onClick={handleAddHomeItem} className="w-full h-11 rounded-xl bg-black text-white font-bold text-xs hover:bg-gray-800 active:scale-[0.98] transition-all">
            Simpan
          </button>
        </div>
      </div>
    </div>
  );

  // Portal: modal selalu menutupi layar penuh, tidak terpotong area scroll Beranda
  return createPortal(modal, document.body);
};

export default AddHomeModal;
