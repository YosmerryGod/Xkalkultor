import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../components/icons/Icons';

const EMPTY_FORM = { id: null, name: '', hargaNet: '' };

const MenuView = () => {
  const { theme, sortedMenus, saveMenuItem, deleteMenuItem, selectMenuItem } = useApp();
  const [form, setForm] = useState(null); // null = form tertutup

  const inputCls = `w-full h-12 px-3 rounded-2xl ${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} focus:outline-none ${theme.inputFocus} text-xs font-semibold`;

  const onSubmit = (e) => {
    e.preventDefault();
    if (saveMenuItem(form)) setForm(null);
  };

  const onDelete = (menu) => {
    if (window.confirm(`Hapus menu "${menu.name}"?`)) deleteMenuItem(menu.id);
  };

  return (
    <div className="flex flex-col space-y-5">
      <div className="flex justify-between items-end px-1 mt-2">
        <div>
          <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${theme.textPrimary}`}>Menu</h2>
          <p className={`text-xs mt-0.5 font-medium ${theme.textSecondary}`}>
            Simpan harga net, lalu pilih dari dropdown di Kalkulator.
          </p>
        </div>
        {!form && (
          <button
            type="button"
            onClick={() => setForm(EMPTY_FORM)}
            className={`h-9 px-4 rounded-full ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} flex items-center gap-2 text-xs font-bold text-[#df6a49] transition-all`}
          >
            <Icons.Plus size={14} /> Tambah
          </button>
        )}
      </div>

      {form && (
        <form onSubmit={onSubmit} className={`mx-1 p-4 rounded-3xl ${theme.bgContainer} ${theme.shadowOut} border border-[#df6a49]/20 space-y-3`}>
          <h5 className={`text-sm font-bold ${theme.textPrimary}`}>{form.id ? 'Edit Menu' : 'Menu Baru'}</h5>
          <label className="block space-y-1.5">
            <span className={`text-[10px] font-bold tracking-widest uppercase ml-1 ${theme.textSecondary}`}>Nama Menu</span>
            <input
              type="text" autoFocus placeholder="Contoh: Nasi Goreng"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="block space-y-1.5">
            <span className={`text-[10px] font-bold tracking-widest uppercase ml-1 ${theme.textSecondary}`}>Harga Net</span>
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

      <div className="space-y-3 px-1 pb-4">
        {sortedMenus.length === 0 ? (
          <div className={`py-8 rounded-3xl ${theme.bgContainer} ${theme.shadowIn} flex flex-col items-center justify-center text-center opacity-60 border border-dashed ${theme.border}`}>
            <Icons.Package size={20} className={`mb-2 ${theme.textSecondary}`} />
            <p className={`text-[10px] font-medium ${theme.textSecondary}`}>Belum ada menu. Tekan Tambah untuk membuat.</p>
          </div>
        ) : (
          sortedMenus.map((menu) => (
            <div key={menu.id} className={`p-4 rounded-3xl ${theme.bgContainer} ${theme.shadowOut} flex items-center justify-between gap-3`}>
              <div className="min-w-0">
                <h4 className={`text-sm font-bold truncate ${theme.textPrimary}`}>{menu.name}</h4>
                <p className={`text-xs font-semibold mt-0.5 ${theme.textSecondary}`}>Net Rp {(menu.hargaNet || 0).toLocaleString('id-ID')}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button" onClick={() => selectMenuItem(menu.id, true)} aria-label={`Hitung ${menu.name}`}
                  className={`h-8 px-3 rounded-full ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} flex items-center gap-1.5 text-[10px] font-bold text-[#df6a49]`}
                >
                  <Icons.Calculator size={12} /> Hitung
                </button>
                <button
                  type="button" onClick={() => setForm({ id: menu.id, name: menu.name, hargaNet: String(menu.hargaNet) })} aria-label="Edit menu"
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.bgContainer} ${theme.shadowOut} text-blue-500`}
                >
                  <Icons.Edit size={12} />
                </button>
                <button
                  type="button" onClick={() => onDelete(menu)} aria-label="Hapus menu"
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${theme.bgContainer} ${theme.shadowOut} text-red-500`}
                >
                  <Icons.Trash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuView;
