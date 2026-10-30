import { useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../components/icons/Icons';

const EMPTY_FORM = { id: null, name: '', hargaNet: '', image: '' };

// [ADDED] Buat kategori dari frasa yang berulang dan kombinasi bahan pada nama menu.
const normalizeWords = (value) => String(value || '')
  .toLocaleLowerCase('id-ID')
  .replace(/[^a-z0-9\s+]/g, ' ')
  .split(/\s+/)
  .filter(Boolean);

const getMenuTags = (menuName, allMenus) => {
  const words = normalizeWords(menuName);
  const normalizedName = words.join(' ');
  const tags = new Set();
  const allWordLists = allMenus.map((menu) => normalizeWords(menu.name));

  // [ADDED] Frasa dua kata yang muncul pada beberapa menu menjadi kategori utama otomatis.
  for (let index = 0; index < words.length - 1; index += 1) {
    const phrase = words.slice(index, index + 2).join(' ');
    const count = allWordLists.filter((list) => {
      for (let i = 0; i < list.length - 1; i += 1) {
        if (list.slice(i, i + 2).join(' ') === phrase) return true;
      }
      return false;
    }).length;
    if (count >= 2) tags.add(phrase.replace(/\b\w/g, (letter) => letter.toUpperCase()));
  }

  // [ADDED] Kategori turunan untuk paket dan kombinasi menu.
  if (normalizedName.includes('paket kenyang')) tags.add('Paket Kenyang');
  else if (normalizedName.includes('paket')) tags.add('Paket');

  if (normalizedName.includes('ayam') && normalizedName.includes('hati')) tags.add('Ayam + Hati');
  if (normalizedName.includes('nasi')) tags.add('Campur Nasi');

  // [ADDED] Jika belum ada pola kategori yang cocok, gunakan kata inti nama menu.
  if (tags.size === 0 && words.length > 0) {
    const ignored = new Set(['paket', 'kenyang', 'dengan', 'plus', 'dan']);
    const core = words.filter((word) => !ignored.has(word)).slice(0, 2).join(' ');
    if (core) tags.add(core.replace(/\b\w/g, (letter) => letter.toUpperCase()));
  }

  return [...tags];
};

// [ADDED] Kompres foto menu agar ukuran data tetap ringan untuk sinkronisasi akun.
const fileToMenuImage = (file) => new Promise((resolve, reject) => {
  if (!file || !file.type.startsWith('image/')) return reject(new Error('Pilih file gambar yang valid.'));
  if (file.size > 10 * 1024 * 1024) return reject(new Error('Ukuran gambar maksimal 10 MB.'));
  const reader = new FileReader();
  reader.onerror = () => reject(new Error('Gambar gagal dibaca.'));
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => reject(new Error('Format gambar tidak dapat dibaca.'));
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 320;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const scale = Math.max(size / image.width, size / image.height);
      const width = image.width * scale;
      const height = image.height * scale;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(image, (size - width) / 2, (size - height) / 2, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.78));
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

const MenuView = () => {
  const { theme, sortedMenus, saveMenuItem, deleteMenuItem, selectMenuItem, showToast } = useApp();
  const [form, setForm] = useState(null);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [imageLoading, setImageLoading] = useState(false);
  const fileRef = useRef(null);

  // [ADDED] Setiap menu dapat memiliki beberapa kategori hasil deteksi nama.
  const categoryData = useMemo(() => {
    const counts = new Map();
    sortedMenus.forEach((menu) => {
      getMenuTags(menu.name, sortedMenus).forEach((tag) => counts.set(tag, (counts.get(tag) || 0) + 1));
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'id'));
  }, [sortedMenus]);

  const menuTags = (menu) => getMenuTags(menu.name, sortedMenus);
  const keyword = query.trim().toLowerCase();
  const filteredMenus = useMemo(() => sortedMenus.filter((menu) => {
    const matchesSearch = !keyword || String(menu.name || '').toLowerCase().includes(keyword);
    const matchesCategory = activeCategory === 'Semua' || getMenuTags(menu.name, sortedMenus).includes(activeCategory);
    return matchesSearch && matchesCategory;
  }), [sortedMenus, keyword, activeCategory]);

  const nameSuggestions = useMemo(() => {
    if (!form || !form.name.trim()) return [];
    return sortedMenus.filter((menu) =>
      String(menu.name || '').toLowerCase().includes(form.name.trim().toLowerCase()) &&
      String(menu.id) !== String(form.id)
    ).slice(0, 5);
  }, [form, sortedMenus]);

  const inputCls = `w-full h-12 px-4 rounded-xl border ${theme.border} ${theme.bgContainer} ${theme.textPrimary} focus:outline-none focus:ring-2 focus:ring-[#df6a49]/25 text-sm font-medium`;
  const labelCls = `block mb-2 text-[10px] font-bold tracking-wider uppercase ${theme.textSecondary}`;

  const onSubmit = (event) => {
    event.preventDefault();
    if (imageLoading) return;
    // [MODIFIED] Kategori tidak dipilih manual; kategori dibuat otomatis dari nama menu.
    if (saveMenuItem({ ...form, category: getMenuTags(form.name, sortedMenus)[0] || 'Lainnya' })) setForm(null);
  };

  const onChooseImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageLoading(true);
    try {
      const image = await fileToMenuImage(file);
      setForm((prev) => ({ ...prev, image }));
    } catch (error) {
      showToast(error.message || 'Gagal memproses gambar.', 'error');
    } finally {
      setImageLoading(false);
      event.target.value = '';
    }
  };

  const onDelete = (menu) => {
    if (window.confirm(`Hapus menu "${menu.name}"?`)) deleteMenuItem(menu.id);
  };

  const renderMenuImage = (menu, size = 'h-14 w-14') => (
    <div className={`${size} shrink-0 overflow-hidden rounded-2xl bg-[#df6a49]/10 flex items-center justify-center text-[#df6a49] font-extrabold text-xl uppercase`}>
      {menu.image
        ? <img src={menu.image} alt={menu.name} className="h-full w-full object-cover" />
        : (String(menu.name || '?').trim().charAt(0) || '?')}
    </div>
  );

  return (
    <div className="flex flex-col gap-5 pb-5">
      {/* [MODIFIED] Header ringkas dengan jumlah menu. */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <div>
          <h2 className={`text-2xl font-extrabold tracking-tight ${theme.textPrimary}`}>Manajemen Menu</h2>
          <p className={`mt-1 text-xs ${theme.textSecondary}`}>Kategori terbentuk otomatis dari nama menu.</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-extrabold tabular-nums ${theme.textPrimary}`}>{sortedMenus.length}</p>
          <p className={`text-[10px] font-semibold ${theme.textSecondary}`}>Total menu</p>
        </div>
      </div>

      {/* [MODIFIED] Form tambah/edit ditampilkan sebagai popup. */}
      {form && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={(event) => { if (event.target === event.currentTarget) setForm(null); }}>
          <form onSubmit={onSubmit} className={`max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border ${theme.border} ${theme.bgContainer} p-4 shadow-2xl space-y-4`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`text-base font-extrabold ${theme.textPrimary}`}>{form.id ? 'Edit Menu' : 'Tambah Menu'}</h3>
                <p className={`text-xs mt-1 ${theme.textSecondary}`}>Lengkapi informasi produk.</p>
              </div>
              <button type="button" onClick={() => setForm(null)} aria-label="Tutup form" className={`h-9 w-9 rounded-xl flex items-center justify-center ${theme.textSecondary} ${theme.bgApp}`}>
                <Icons.X size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {renderMenuImage(form, 'h-20 w-20')}
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold ${theme.textPrimary}`}>{form.image ? 'Foto menu dipilih' : 'Foto menu (opsional)'}</p>
                <p className={`mt-1 text-[10px] ${theme.textSecondary}`}>{form.image ? 'Foto akan tampil pada daftar menu.' : 'Jika kosong, gunakan huruf awal nama menu.'}</p>
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg bg-[#df6a49]/10 px-3 py-2 text-[10px] font-bold text-[#df6a49]">{form.image ? 'Ganti foto' : 'Pilih foto'}</button>
                  {form.image && <button type="button" onClick={() => setForm((prev) => ({ ...prev, image: '' }))} className={`rounded-lg px-3 py-2 text-[10px] font-bold ${theme.textSecondary}`}>Hapus foto</button>}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={onChooseImage} className="hidden" />
              </div>
            </div>

            <label className="block">
              <span className={labelCls}>Nama Menu</span>
              <input autoFocus type="text" autoComplete="off" placeholder="Contoh: Ayam Panggang + Nasi" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} className={inputCls} />
              {nameSuggestions.length > 0 && (
                <div className={`mt-2 overflow-hidden rounded-xl border ${theme.border} ${theme.bgApp}`}>
                  <p className={`px-3 py-2 text-[9px] font-bold uppercase tracking-wider ${theme.textSecondary}`}>Menu serupa sudah tersedia</p>
                  {nameSuggestions.map((menu) => (
                    <button key={menu.id} type="button" onClick={() => setForm({ id: menu.id, name: menu.name, hargaNet: String(menu.hargaNet), image: menu.image || '' })} className={`flex w-full items-center gap-3 border-t ${theme.border} px-3 py-2 text-left`}>
                      {renderMenuImage(menu, 'h-9 w-9')}
                      <span className="min-w-0 flex-1">
                        <span className={`block truncate text-xs font-bold ${theme.textPrimary}`}>{menu.name}</span>
                        <span className={`text-[10px] ${theme.textSecondary}`}>Rp {Number(menu.hargaNet || 0).toLocaleString('id-ID')}</span>
                      </span>
                      <span className="text-[10px] font-bold text-[#df6a49]">Pilih</span>
                    </button>
                  ))}
                </div>
              )}
            </label>

            {/* [ADDED] Preview kategori otomatis dan dapat memiliki lebih dari satu tag. */}
            <div className={`rounded-xl border ${theme.border} ${theme.bgApp} p-3`}>
              <p className={`mb-2 text-[10px] font-bold uppercase tracking-wider ${theme.textSecondary}`}>Kategori otomatis</p>
              <div className="flex flex-wrap gap-2">
                {getMenuTags(form.name, sortedMenus).length > 0
                  ? getMenuTags(form.name, sortedMenus).map((tag) => <span key={tag} className="rounded-full bg-[#df6a49]/10 px-3 py-1.5 text-[10px] font-bold text-[#df6a49]">{tag}</span>)
                  : <span className={`text-xs ${theme.textSecondary}`}>Kategori muncul setelah nama menu diisi.</span>}
              </div>
            </div>

            <label>
              <span className={labelCls}>Harga Net</span>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold ${theme.textSecondary}`}>Rp</span>
                <input type="number" min="1" inputMode="numeric" placeholder="0" value={form.hargaNet} onChange={(event) => setForm((prev) => ({ ...prev, hargaNet: event.target.value }))} className={`${inputCls} pl-10`} />
              </div>
            </label>

            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setForm(null)} className={`h-11 flex-1 rounded-xl border ${theme.border} text-xs font-bold ${theme.textSecondary}`}>Batal</button>
              <button type="submit" disabled={imageLoading} className="h-11 flex-1 rounded-xl bg-[#df6a49] text-white text-xs font-bold disabled:opacity-50">{imageLoading ? 'Memproses foto...' : 'Simpan Menu'}</button>
            </div>
          </form>
        </div>
      )}

      {/* [MODIFIED] Search dan tombol tambah. */}
      <div className="flex items-center gap-2">
        <div className={`flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border ${theme.border} ${theme.bgContainer} px-3`}>
          <Icons.Search size={16} className={theme.textSecondary} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama menu..." className={`w-full min-w-0 bg-transparent text-xs font-medium outline-none ${theme.textPrimary}`} />
          {query && <button type="button" onClick={() => setQuery('')} aria-label="Hapus pencarian"><Icons.X size={14} className={theme.textSecondary} /></button>}
        </div>
        <button type="button" onClick={() => setForm({ ...EMPTY_FORM })} className="h-11 shrink-0 rounded-xl bg-[#df6a49] px-4 text-xs font-bold text-white flex items-center gap-2"><Icons.Plus size={15} /> Tambah</button>
      </div>

      {/* [MODIFIED] Filter kategori fleksibel, dibuat dari nama menu dan jumlahnya. */}
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {[['Semua', sortedMenus.length], ...categoryData].map(([category, count]) => (
          <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`shrink-0 rounded-full px-3.5 py-2 text-[10px] font-bold transition-colors ${activeCategory === category ? 'bg-[#df6a49] text-white' : `${theme.bgContainer} ${theme.textSecondary} border ${theme.border}`}`}>
            {category} <span className={activeCategory === category ? 'text-white/75' : 'opacity-60'}>{count}</span>
          </button>
        ))}
      </div>

      {/* [MODIFIED] Daftar menu tampil satu kali; tag kategori dapat saling beririsan. */}
      <div className="space-y-2">
        {sortedMenus.length === 0 ? (
          <div className={`rounded-2xl border border-dashed ${theme.border} py-12 text-center ${theme.textSecondary}`}>
            <Icons.Package size={28} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm font-bold">Belum ada menu</p>
            <p className="mt-1 text-xs">Tekan Tambah untuk membuat menu pertama.</p>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className={`rounded-2xl border border-dashed ${theme.border} py-10 text-center text-xs ${theme.textSecondary}`}>Tidak ada menu yang cocok.</div>
        ) : filteredMenus.map((menu) => (
          <article key={menu.id} className={`flex items-center gap-3 rounded-2xl border ${theme.border} ${theme.bgContainer} p-3 shadow-sm`}>
            {renderMenuImage(menu)}
            <div className="min-w-0 flex-1">
              <h4 className={`truncate text-sm font-bold ${theme.textPrimary}`}>{menu.name}</h4>
              <div className="mt-1 flex flex-wrap gap-1">
                {menuTags(menu).map((tag) => <span key={tag} className="rounded-full bg-[#df6a49]/10 px-2 py-0.5 text-[9px] font-semibold text-[#df6a49]">{tag}</span>)}
              </div>
              <p className={`mt-1 text-sm font-extrabold tabular-nums ${theme.textPrimary}`}>Rp {Number(menu.hargaNet || 0).toLocaleString('id-ID')}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5">
              <button type="button" onClick={() => setForm({ id: menu.id, name: menu.name, hargaNet: String(menu.hargaNet), image: menu.image || '' })} aria-label={`Edit ${menu.name}`} className="h-8 w-8 rounded-lg flex items-center justify-center bg-blue-500/10 text-blue-500"><Icons.Edit size={14} /></button>
              <button type="button" onClick={() => onDelete(menu)} aria-label={`Hapus ${menu.name}`} className="h-8 w-8 rounded-lg flex items-center justify-center bg-red-500/10 text-red-500"><Icons.Trash2 size={14} /></button>
            </div>
            <button type="button" onClick={() => selectMenuItem(menu.id, true)} aria-label={`Hitung ${menu.name}`} className="h-10 shrink-0 rounded-xl bg-[#df6a49]/10 px-3 text-[10px] font-bold text-[#df6a49]">Hitung</button>
          </article>
        ))}
      </div>
    </div>
  );
};

export default MenuView;
