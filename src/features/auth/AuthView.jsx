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
      {/* [MODIFIED] Premium animated liquid background with soft, slow-moving slime forms. */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className={`auth-liquid auth-liquid-one ${isDarkMode ? 'auth-liquid-dark' : 'auth-liquid-light'}`} />
        <div className={`auth-liquid auth-liquid-two ${isDarkMode ? 'auth-liquid-dark' : 'auth-liquid-light'}`} />
        <div className={`auth-liquid auth-liquid-three ${isDarkMode ? 'auth-liquid-dark' : 'auth-liquid-light'}`} />
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-[#101318]/75' : 'bg-[#f4f1ed]/75'}`} />
        <div className={`absolute inset-0 ${isDarkMode ? 'auth-grain-dark' : 'auth-grain-light'}`} />
      </div>

      {/* [ADDED] Scoped liquid motion and reduced-motion accessibility. */}
      <style jsx>{`
        .auth-liquid {
          position: absolute;
          width: min(58vw, 560px);
          height: min(58vw, 560px);
          min-width: 280px;
          min-height: 280px;
          border-radius: 42% 58% 65% 35% / 45% 38% 62% 55%;
          filter: blur(34px);
          opacity: 0.72;
          will-change: transform, border-radius;
          animation: auth-liquid-morph 18s ease-in-out infinite alternate,
                     auth-liquid-float 24s ease-in-out infinite;
        }
        .auth-liquid-one {
          top: -18%;
          right: -12%;
          background: linear-gradient(135deg, #ff9b62 0%, #ef633e 48%, #d94d76 100%);
        }
        .auth-liquid-two {
          left: -17%;
          bottom: -22%;
          width: min(52vw, 500px);
          height: min(52vw, 500px);
          background: linear-gradient(145deg, #f6a56f 0%, #e56c53 52%, #9e78b9 100%);
          animation-delay: -7s, -11s;
          animation-duration: 22s, 29s;
        }
        .auth-liquid-three {
          top: 38%;
          left: 42%;
          width: min(34vw, 330px);
          height: min(34vw, 330px);
          min-width: 190px;
          min-height: 190px;
          background: linear-gradient(145deg, #f5b77c 0%, #e86d76 55%, #8f8bd1 100%);
          opacity: 0.42;
          animation-delay: -12s, -5s;
          animation-duration: 25s, 32s;
        }
        .auth-liquid-dark { opacity: 0.38; filter: blur(58px) saturate(115%); }
        .auth-liquid-light { opacity: 0.48; filter: blur(54px) saturate(90%); }
        .auth-grain-dark {
          opacity: 0.12;
          background-image: radial-gradient(rgba(255,255,255,.22) .55px, transparent .55px);
          background-size: 5px 5px;
        }
        .auth-grain-light {
          opacity: 0.18;
          background-image: radial-gradient(rgba(45,35,30,.2) .55px, transparent .55px);
          background-size: 5px 5px;
        }
        @keyframes auth-liquid-morph {
          0% { border-radius: 42% 58% 65% 35% / 45% 38% 62% 55%; }
          50% { border-radius: 58% 42% 38% 62% / 55% 62% 38% 45%; }
          100% { border-radius: 35% 65% 52% 48% / 62% 42% 58% 38%; }
        }
        @keyframes auth-liquid-float {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          50% { transform: translate3d(5vw, -4vh, 0) rotate(18deg) scale(1.12); }
        }
        @media (prefers-reduced-motion: reduce) {
          .auth-liquid { animation: none; }
        }
      `}</style>

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
          {/* [MODIFIED] Liquid-glass authentication card with a crisp, readable surface. */}
          <div className={`relative overflow-hidden rounded-[28px] border backdrop-blur-2xl ${isDarkMode ? 'border-white/15 bg-[#181D24]/90 shadow-[0_28px_80px_rgba(0,0,0,0.42)]' : 'border-white/80 bg-white/90 shadow-[0_28px_80px_rgba(83,54,40,0.14)]'} p-5 sm:p-7 transition-colors duration-500`}>
            <div className={`pointer-events-none absolute inset-x-8 top-0 h-px ${isDarkMode ? 'bg-gradient-to-r from-transparent via-orange-300/60 to-transparent' : 'bg-gradient-to-r from-transparent via-orange-400/70 to-transparent'}`} />
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
