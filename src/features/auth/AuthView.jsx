import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../components/icons/Icons';
import DownloadApk from '../../components/DownloadApk';

// [MODIFIED] Redesigned AIDO authentication UI while preserving the existing auth API and state flow.
const AuthView = () => {
  const {
    isLogin, showPassword, setShowPassword, authForm, authError,
    theme, setAuthField, switchAuthMode, handleAuthSubmit,
    isDarkMode, setIsDarkMode, setAuthError, // [ADDED] Expose the auth error setter used by the Google OAuth effect.
  } = useApp();

  // [ADDED] Show a helpful message when Google OAuth returns an error.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'google_error') {
      setAuthError('Login Google gagal. Silakan coba lagi atau gunakan email dan password.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [setAuthError]);

  // [MODIFIED] Use consistent, accessible form controls with clear focus states.
  const fieldClass = `w-full h-[52px] pl-12 pr-4 rounded-xl border ${isDarkMode ? 'border-white/10 bg-[#13181E] text-[#F1F3F5] placeholder:text-gray-500' : 'border-gray-200 bg-white text-gray-800 placeholder:text-gray-400'} focus:outline-none focus:ring-2 focus:ring-[#ed6a3a]/30 focus:border-[#ed6a3a] text-[14px] font-medium transition-all`;
  const iconWrapClass = `absolute left-0 top-0 h-[52px] w-11 flex items-center justify-center rounded-l-xl ${theme.textSecondary}`;

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
            {/* [REMOVED] Removed the requested promotional tagline. */}
          </div>

          <DownloadApk />

          {/* [MODIFIED] Card shadow adapts to Deep Dark without changing its layout. */}
          {/* [MODIFIED] Professional authentication card with restrained border and elevation. */}
          <div className={`rounded-[26px] border ${isDarkMode ? 'border-white/10 bg-[#181D24] shadow-[0_18px_50px_rgba(0,0,0,0.28)]' : 'border-gray-200/80 bg-white shadow-[0_18px_50px_rgba(31,41,55,0.09)]'} p-5 sm:p-7 transition-colors duration-500`}>
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

              {/* [ADDED] Google OAuth uses the same server-side account and session system. */}
              <div className="pt-4">
                <div className="relative mb-4 flex items-center justify-center">
                  <div className={`h-px w-full ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                  <span className={`absolute px-3 text-[10px] font-semibold uppercase tracking-wider ${theme.bgContainer} ${theme.textSecondary}`}>atau</span>
                </div>
                <a
                  href="/api/auth/google"
                  aria-label={isLogin ? 'Lanjutkan dengan Google' : 'Daftar dengan Google'}
                  className={`flex h-[54px] w-full items-center justify-center gap-3 rounded-xl border text-[14px] font-semibold transition-all active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#4285F4]/30 focus:ring-offset-2 ${isDarkMode ? 'border-white/15 bg-[#202630] text-[#F1F3F5] hover:bg-[#28313d] focus:ring-offset-[#181D24]' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-offset-white'}`}
                >
                  <svg aria-hidden="true" viewBox="0 0 48 48" className="h-[20px] w-[20px]" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.96 46.98 31.86 46.98 24.55Z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
                    <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" />
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
                  </svg>
                  <span>{isLogin ? 'Lanjutkan dengan Google' : 'Daftar dengan Google'}</span>
                </a>
              </div>

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
