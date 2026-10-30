import { useApp } from '../../context/AppContext';
import { Icons } from '../../components/icons/Icons';
import DownloadApk from '../../components/DownloadApk';

// [MODIFIED] Redesigned AIDO authentication UI while preserving the existing auth API and state flow.
const AuthView = () => {
  const {
    isLogin, showPassword, setShowPassword, authForm, authError,
    theme, setAuthField, switchAuthMode, handleAuthSubmit,
    isDarkMode, setIsDarkMode,
  } = useApp();

  const fieldClass = `w-full h-[50px] pl-12 pr-4 rounded-2xl ${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} focus:outline-none ${theme.inputFocus} text-[13px] font-medium transition-all placeholder:font-normal placeholder:text-gray-400`;
  const iconWrapClass = `absolute left-0 top-0 h-[50px] w-11 flex items-center justify-center rounded-l-2xl ${theme.textSecondary}`;

  return (
    <div className={`relative isolate w-full h-full overflow-y-auto custom-scrollbar ${theme.bgContainer} transition-colors duration-500`}>
      {/* [ADDED] Subtle decorative background shapes, without a logo or mascot. */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
        <div className="absolute top-[42%] -left-36 h-80 w-80 rounded-full bg-orange-200/20 blur-3xl" />
        <div className="absolute -bottom-36 right-[8%] h-80 w-80 rounded-full bg-orange-400/10 blur-3xl" />
        {/* [MODIFIED] Dark backdrop follows the Deep Dark palette. */}
        <div className={`absolute top-0 left-0 h-full w-full ${isDarkMode ? 'bg-[#101318]/85' : 'bg-[#f4f1ed]/70'}`} />
      </div>

      {/* [ADDED] Theme control. */}
      <button
        type="button"
        onClick={() => setIsDarkMode(!isDarkMode)}
        aria-label={isDarkMode ? 'Aktifkan light mode' : 'Aktifkan dark mode'}
        className={`absolute top-5 right-5 z-20 h-10 w-10 rounded-full ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} flex items-center justify-center ${theme.textSecondary} transition-all`}
      >
        {isDarkMode ? <Icons.Sun size={17} /> : <Icons.Moon size={17} />}
      </button>

      <div className="min-h-full w-full flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-[440px]">
          {/* [MODIFIED] Text-only brand header. */}
          <div className="text-center mb-8 sm:mb-9">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-gradient-to-r from-orange-400 to-orange-600" />
            <h1 className={`text-[42px] sm:text-5xl leading-none font-black tracking-[-0.06em] ${theme.textPrimary}`}>
              AID<span className="text-[#f26b32]">O</span>
            </h1>
            <p className={`mt-2 text-[13px] sm:text-sm font-semibold tracking-[0.12em] ${theme.textSecondary}`}>
              Kalkulator Merchant
            </p>
            <p className={`mt-4 text-sm leading-relaxed ${theme.textSecondary}`}>
              Hitung lebih mudah,
              <br />
              bisnis lebih untung.
            </p>
          </div>

          <DownloadApk />

          {/* [MODIFIED] Card shadow adapts to Deep Dark without changing its layout. */}
          <div className={`rounded-[30px] border ${isDarkMode ? 'border-white/[0.06] shadow-[14px_14px_30px_rgba(0,0,0,0.38),-7px_-7px_22px_rgba(47,57,69,0.22)]' : 'border-white/80 shadow-[12px_12px_30px_rgba(0,0,0,0.07),-10px_-10px_28px_rgba(255,255,255,0.72)]'} ${theme.bgContainer} p-5 sm:p-7 transition-colors duration-500`}>
            <div className="mb-6">
              <h2 className={`text-[22px] font-extrabold tracking-tight ${theme.textPrimary}`}>
                {isLogin ? 'Masuk ke AIDO' : 'Buat Akun AIDO'}
              </h2>
              <p className={`mt-1 text-[13px] ${theme.textSecondary}`}>
                {isLogin
                  ? 'Lanjutkan untuk mengakses kalkulator.'
                  : 'Daftar sekarang, gratis dan mudah.'}
              </p>
            </div>

            <form className="space-y-3" onSubmit={handleAuthSubmit} noValidate>
              {!isLogin && (
                <>
                  <div className="relative">
                    <span className={iconWrapClass}><Icons.User size={17} /></span>
                    <input type="text" autoComplete="given-name" placeholder="Nama Depan" value={authForm.firstName} onChange={setAuthField('firstName')} required className={fieldClass} />
                  </div>
                  <div className="relative">
                    <span className={iconWrapClass}><Icons.User size={17} /></span>
                    <input type="text" autoComplete="family-name" placeholder="Nama Belakang" value={authForm.lastName} onChange={setAuthField('lastName')} required className={fieldClass} />
                  </div>
                  <div className="relative">
                    <span className={iconWrapClass}><Icons.Store size={17} /></span>
                    <input type="text" autoComplete="organization" placeholder="Nama Toko (opsional)" value={authForm.storeName} onChange={setAuthField('storeName')} className={fieldClass} />
                  </div>
                  <div className="relative">
                    <span className={iconWrapClass}><Icons.Mail size={17} /></span>
                    <input type="email" autoComplete="email" autoCapitalize="none" placeholder="Email" value={authForm.email} onChange={setAuthField('email')} required className={fieldClass} />
                  </div>
                </>
              )}

              {isLogin && (
                <div className="relative">
                  <span className={iconWrapClass}><Icons.Mail size={17} /></span>
                  <input type="text" autoComplete="username" autoCapitalize="none" placeholder="Email atau Username" value={authForm.identifier} onChange={setAuthField('identifier')} required className={fieldClass} />
                </div>
              )}

              <div className="relative">
                <span className={iconWrapClass}><Icons.Lock size={17} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  minLength={isLogin ? undefined : 8}
                  maxLength={128}
                  required
                  placeholder="Password"
                  value={authForm.password}
                  onChange={setAuthField('password')}
                  className={`${fieldClass} pr-12`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} className={`absolute right-0 top-0 h-[50px] w-11 flex items-center justify-center ${theme.textSecondary} hover:text-[#f26b32] transition-colors`}>
                  {showPassword ? <Icons.EyeOff size={17} /> : <Icons.Eye size={17} />}
                </button>
              </div>

              {/* [ADDED] Existing login form has no remember-me or password-reset API, so only supported actions are shown. */}
              {isLogin && (
                <div className="flex items-center justify-between px-1 pt-1">
                  <span className={`text-xs ${theme.textSecondary}`}>Akun AIDO Anda</span>
                  <span className="text-xs font-semibold text-[#ed5b2b]">Aman dan privat</span>
                </div>
              )}

              {authError && (
                <div role="alert" className="rounded-xl bg-red-500/10 px-3 py-2.5 text-xs font-semibold text-red-500">
                  {authError}
                </div>
              )}

              <button type="submit" className="mt-2 flex h-[54px] w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#ff873f] to-[#f0441e] text-sm font-bold text-white shadow-[0_9px_18px_rgba(239,83,39,0.24)] transition-all hover:brightness-105 active:scale-[0.985]">
                {isLogin ? 'Masuk' : 'Daftar Sekarang'}
                <Icons.ChevronRight size={18} />
              </button>

              {/* [MODIFIED] Account mode switch remains connected to the existing auth flow. */}
              <p className={`pt-3 text-center text-xs ${theme.textSecondary}`}>
                {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
                <button type="button" onClick={switchAuthMode} className="font-bold text-[#ed5b2b] hover:underline">
                  {isLogin ? 'Daftar sekarang' : 'Masuk di sini'}
                </button>
              </p>
            </form>
          </div>

          <p className={`mt-6 text-center text-[10px] tracking-wide ${theme.textSecondary} opacity-70`}>
            AIDO · Kalkulator Merchant
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
