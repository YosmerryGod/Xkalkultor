import { useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../components/icons/Icons';

const EMPTY_FORM = { id: null, name: '', hargaNet: '', category: 'Makanan' };

const MenuView = () => {
  const { theme, sortedMenus, saveMenuItem, deleteMenuItem, selectMenuItem } = useApp();
  const [form, setForm] = useState(null); // null = form tertutup
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef(null);

  const inputCls = `w-full h-12 px-3 rounded-2xl ${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} focus:outline-none ${theme.inputFocus} text-xs font-semibold`;
  const labelCls = `text-[10px] font-bold tracking-widest uppercase ml-1 ${theme.textSecondary}`;

  const keyword = query.trim().toLowerCase();
  const filteredMenus = useMemo(
    () => (keyword ? sortedMenus.filter((m) => (m.name || '').toLowerCase().includes(keyword)) : sortedMenus),
    [sortedMenus, keyword]
  );
  // [ADDED] Live suggestions for existing menu names while creating or editing.
  const nameSuggestions = useMemo(() => {
    if (!form || !form.name.trim()) return [];
    return sortedMenus
      .filter((menu) => String(menu.name || '').toLowerCase().includes(form.name.trim().toLowerCase()))
      .slice(0, 6);
  }, [form, sortedMenus]);
  const menuGroups = useMemo(() => filteredMenus.reduce((groups, menu) => {
    const category = menu.category || 'Lainnya';
    if (!groups[category]) groups[category] = [];
    groups[category].push(menu);
    return groups;
  }, {}), [filteredMenus]);

  const openSearch = () => {
    setSearchOpen(true);
    // tunggu animasi mulai, lalu fokus ke input
    setTimeout(() => searchRef.current?.focus(), 120);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (saveMenuItem(form)) setForm(null);
  };

  const onDelete = (menu) => {
    if (window.confirm(`Hapus menu "${menu.name}"?`)) deleteMenuItem(menu.id);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Header */}
      <div className="flex justify-between items-end gap-3 px-1 mt-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${theme.textPrimary}`}>Menu</h2>
            {sortedMenus.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${theme.bgContainer} ${theme.shadowIn} ${theme.textSecondary}`}>
                {keyword ? `${filteredMenus.length}/${sortedMenus.length}` : sortedMenus.length}
              </span>
            )}
          </div>
          <p className={`text-xs mt-0.5 font-medium ${theme.textSecondary}`}>
            Simpan harga net, lalu pilih dari dropdown di Kalkulator.
          </p>
        </div>
      </div>

      {/* Form tambah / edit */}
      {form && (
        <form onSubmit={onSubmit} className={`mx-1 p-4 rounded-3xl ${theme.bgContainer} ${theme.shadowOut} border border-[#df6a49]/20 space-y-3`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h5 className={`text-sm font-bold ${theme.textPrimary}`}>{form.id ? 'Edit Menu' : 'Menu Baru'}</h5>
              <p className={`mt-0.5 text-[10px] ${theme.textSecondary}`}>Kelola nama, kategori, dan harga menu.</p>
            </div>
            <span className="rounded-full bg-[#df6a49]/10 px-3 py-1 text-[9px] font-bold text-[#df6a49]">{form.id ? 'EDIT' : 'BARU'}</span>
          </div>
          <label className="block space-y-1.5">
            <span className={labelCls}>Nama Menu</span>
            <div className="relative">
              <input
                type="text" autoFocus placeholder="Contoh: Nasi Goreng"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="off"
                className={inputCls}
              />
              {nameSuggestions.length > 0 && (
                <div className={`absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-[#df6a49]/15 ${theme.bgContainer} ${theme.shadowOut}`}>
                  <div className={`px-3 py-2 text-[9px] font-bold uppercase tracking-widest ${theme.textSecondary}`}>Menu yang sudah tersedia</div>
                  {nameSuggestions.map((menu) => (
                    <button
                      key={menu.id}
                      type="button"
                      onClick={() => setForm({ id: menu.id, name: menu.name, hargaNet: String(menu.hargaNet), category: menu.category || 'Lainnya' })}
                      className={`flex w-full items-center justify-between gap-3 border-t border-black/5 px-3 py-2.5 text-left dark:border-white/5 hover:bg-[#df6a49]/5`}
                    >
                      <span className="min-w-0">
                        <span className={`block truncate text-xs font-bold ${theme.textPrimary}`}>{menu.name}</span>
                        <span className={`text-[9px] ${theme.textSecondary}`}>{menu.category || 'Lainnya'} · Rp {Number(menu.hargaNet || 0).toLocaleString('id-ID')}</span>
                      </span>
                      <span className="shrink-0 text-[9px] font-bold text-[#df6a49]">Pilih</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </label>
          <label className="block space-y-1.5">
            <span className={labelCls}>Kategori Menu</span>
            <select
              value={form.category || 'Lainnya'}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={inputCls}
            >
              <option value="Makanan">Makanan</option>
              <option value="Minuman">Minuman</option>
              <option value="Snack">Snack</option>
              <option value="Paket">Paket</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className={labelCls}>Harga Net</span>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none font-bold text-gray-400 text-xs">Rp</div>
              <input
                type="number" inputMode="numeric" placeholder="0"
                value={form.hargaNet} onChange={(e) => setForm({ ...form, hargaNet: e.target.value })}
                className={`${inputCls} pl-9 text-right font-bold`}
              />
            </div>
          </label>
          <div className="flex gap-3 pt-1">
            <button
              type="button" onClick={() => setForm(null)}
              className={`flex-1 h-11 rounded-2xl ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} text-xs font-bold ${theme.textSecondary}`}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-2xl bg-black text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-[0.98] transition-all"
            >
              <Icons.Save size={14} /> Simpan
            </button>
          </div>
        </form>
      )}

      {/* Toolbar: Search + Tambah bersampingan. Search memanjang saat ditekan */}
      {(sortedMenus.length > 0 || !form) && (
        <div className="flex items-center justify-end gap-2 px-1">
          {sortedMenus.length > 0 && (
            <div
              className={`relative h-10 min-w-0 basis-10 rounded-full overflow-hidden transition-[flex-grow,box-shadow] duration-300 ease-out ${theme.bgContainer} ${
                searchOpen ? `grow ${theme.shadowIn}` : `grow-0 ${theme.shadowOut}`
              }`}
            >
              <button
                type="button"
                onClick={searchOpen ? () => searchRef.current?.focus() : openSearch}
                aria-label="Cari menu"
                className={`absolute left-0 top-0 w-10 h-10 flex items-center justify-center transition-colors ${
                  searchOpen ? theme.textSecondary : 'text-[#df6a49]'
                }`}
              >
                <Icons.Search size={16} />
              </button>

              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
                onBlur={() => !query && setSearchOpen(false)}
                placeholder="Cari nama menu..."
                tabIndex={searchOpen ? 0 : -1}
                aria-hidden={!searchOpen}
                className={`absolute inset-0 w-full h-full pl-10 pr-10 bg-transparent focus:outline-none text-xs font-semibold transition-opacity duration-200 ${theme.textPrimary} ${
                  searchOpen ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none'
                }`}
              />

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={closeSearch}
                aria-label="Tutup pencarian"
                tabIndex={searchOpen ? 0 : -1}
                className={`absolute right-0 top-0 w-10 h-10 flex items-center justify-center transition-opacity duration-200 ${theme.textSecondary} ${
                  searchOpen ? 'opacity-100 delay-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <Icons.X size={14} />
              </button>
            </div>
          )}

          {!form && (
            <button
              type="button"
              onClick={() => setForm(EMPTY_FORM)}
              className={`shrink-0 h-10 px-4 rounded-full ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} flex items-center gap-2 text-xs font-bold text-[#df6a49] transition-all`}
            >
              <Icons.Plus size={14} /> Tambah
            </button>
          )}
        </div>
      )}

      {/* Grid daftar menu: 3 kolom (HP), 4 kolom (sm ke atas) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3 px-1 pb-4">
        {sortedMenus.length === 0 ? (
          <div className={`col-span-full py-10 rounded-3xl ${theme.bgContainer} ${theme.shadowIn} flex flex-col items-center justify-center text-center opacity-60 border border-dashed ${theme.border}`}>
            <Icons.Package size={22} className={`mb-2 ${theme.textSecondary}`} />
            <p className={`text-[11px] font-medium ${theme.textSecondary}`}>Belum ada menu. Tekan Tambah untuk membuat.</p>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className={`col-span-full py-10 rounded-3xl ${theme.bgContainer} ${theme.shadowIn} flex flex-col items-center justify-center text-center opacity-60 border border-dashed ${theme.border}`}>
            <Icons.Search size={22} className={`mb-2 ${theme.textSecondary}`} />
            <p className={`text-[11px] font-medium px-4 ${theme.textSecondary}`}>Tidak ada menu yang cocok dengan &ldquo;{query.trim()}&rdquo;.</p>
          </div>
        ) : (
          Object.entries(menuGroups).map(([category, menus]) => (
            <section key={category} className="col-span-full space-y-2.5">
              <div className="flex items-center justify-between px-1 pt-2">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-1 rounded-full bg-[#df6a49]" />
                  <h3 className={`text-xs font-extrabold ${theme.textPrimary}`}>{category}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${theme.bgContainer} ${theme.textSecondary}`}>{menus.length} menu</span>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {menus.map((menu) => (
            <div
              key={menu.id}
              className={`flex flex-col min-w-0 p-2.5 rounded-2xl ${theme.bgContainer} ${theme.shadowOut}`}
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <div className="w-6 h-6 shrink-0 rounded-lg bg-[#df6a49]/10 text-[#df6a49] flex items-center justify-center text-[10px] font-extrabold uppercase">
                    {(menu.name || '?').trim().charAt(0) || '?'}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button" onClick={() => setForm({ id: menu.id, name: menu.name, hargaNet: String(menu.hargaNet), category: menu.category || 'Lainnya' })} aria-label={`Edit ${menu.name}`}
                      className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500/20 active:scale-95 transition-all"
                    >
                      <Icons.Edit size={11} />
                    </button>
                    <button
                      type="button" onClick={() => onDelete(menu)} aria-label={`Hapus ${menu.name}`}
                      className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500/20 active:scale-95 transition-all"
                    >
                      <Icons.Trash2 size={11} />
                    </button>
                  </div>
                </div>
                <h4
                  title={menu.name}
                  className={`mt-2 text-[11px] sm:text-xs font-bold leading-snug line-clamp-2 min-h-[2.25em] ${theme.textPrimary}`}
                >
                  {menu.name}
                </h4>
                <div className={`mt-2 px-2 py-1.5 rounded-xl ${theme.shadowIn} min-w-0`}>
                  <p className={`text-[8px] font-bold tracking-widest uppercase leading-none ${theme.textSecondary} opacity-70`}>Harga Net</p>
                  <p className={`mt-1 text-xs sm:text-[13px] font-extrabold tabular-nums leading-none truncate ${theme.textPrimary}`}>
                    <span className={`text-[9px] font-bold mr-0.5 ${theme.textSecondary}`}>Rp</span>
                    {(menu.hargaNet || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              {/* Aksi utama (paling bawah) */}
              <button
                type="button" onClick={() => selectMenuItem(menu.id, true)} aria-label={`Hitung ${menu.name}`}
                className={`mt-2.5 w-full h-8 rounded-xl ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} flex items-center justify-center gap-1.5 text-[10px] font-bold text-[#df6a49] transition-all`}
              >
                <Icons.Calculator size={12} /> Hitung
              </button>
            </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuView;