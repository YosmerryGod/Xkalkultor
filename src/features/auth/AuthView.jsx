// [MODIFIED] Password visibility identifiers must remain valid JavaScript names.
import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Icons } from '../../components/icons/Icons';
import DownloadApk from '../../components/DownloadApk';

// [MODIFIED] Premium neumorphic authentication experience for login and registration.
const AuthView = () => {
  const {
    isLogin,
    showPassword,
    setShowPassword,
    authForm,
    authError,
    setAuthError,
    theme,
    setAuthField,
    switchAuthMode,
    handleAuthSubmit,
    isDarkMode,
    setIsDarkMode,
  } = useApp();

  // [ADDED] Local presentation state only; authentication logic remains in AppContext.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // [KEPT] Handle errors returned from the server-side Google OAuth flow.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === 'google_error') {
      setAuthError('Login Google gagal. Silakan coba lagi atau gunakan email dan kata sandi.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [setAuthError]);

  // [ADDED] Prevent duplicate submissions and expose a lightweight loading state.
  const handleSubmit = async (event) => {
    if (isSubmitting) {
      event.preventDefault();
      return;
    }

    setIsSubmitting(true);
    try {
      await handleAuthSubmit(event);
    } finally {
      setIsSubmitting(false);
    }
  };

  // [MODIFIED] Inputs use the existing neumorphic theme tokens in both color modes.
  const fieldClass = `auth-field h-[54px] w-full rounded-2xl border-0 pl-12 pr-4 text-[14px] font-medium outline-none transition-[box-shadow,background-color,color] duration-200 ${theme.inputBg} ${theme.shadowIn} ${theme.textPrimary} placeholder:opacity-55 focus:ring-2 ${theme.inputFocus}`;
  const iconWrapClass = `pointer-events-none absolute left-0 top-0 flex h-[54px] w-12 items-center justify-center ${theme.textSecondary}`;

  return (
    <div className={`relative isolate h-full min-h-0 w-full overflow-y-auto overflow-x-hidden custom-scrollbar ${theme.bgContainer} transition-colors duration-500`}>
      {/* [MODIFIED] Lightweight animated liquid accent layer, isolated behind the form. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className={`auth-liquid auth-liquid-a ${isDarkMode ? 'auth-liquid-dark' : 'auth-liquid-light'}`} />
        <div className={`auth-liquid auth-liquid-b ${isDarkMode ? 'auth-liquid-dark' : 'auth-liquid-light'}`} />
        <div className={`auth-liquid-gloss ${isDarkMode ? 'auth-gloss-dark' : 'auth-gloss-light'}`} />
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-[#101318]/55' : 'bg-[#e0e5ec]/55'}`} />
      </div>

      {/* [ADDED] Scoped motion styles; only the two background blobs morph and float. */}
      <style jsx>{`
        .auth-liquid {
          position: absolute;
          width: min(70vw, 520px);
          height: min(70vw, 520px);
          min-width: 260px;
          min-height: 260px;
          border-radius: 42% 58% 65% 35% / 45% 38% 62% 55%;
          filter: blur(24px);
          opacity: .42;
          will-change: transform, opacity;
          animation: auth-liquid-morph 22s ease-in-out infinite alternate,
                     auth-liquid-float 30s ease-in-out infinite;
        }
        .auth-liquid-a {
          top: -24%;
          right: -20%;
          background: linear-gradient(135deg, #ffb27c 0%, #f26b32 52%, #d95772 100%);
        }
        .auth-liquid-b {
          bottom: -28%;
          left: -22%;
          width: min(58vw, 440px);
          height: min(58vw, 440px);
          background: linear-gradient(145deg, #f7b77d 0%, #ed6b55 55%, #8d83c8 100%);
          animation-delay: -8s, -13s;
          animation-duration: 26s, 34s;
        }
        .auth-liquid-dark { opacity: .25; filter: blur(28px) saturate(110%); }
        .auth-liquid-light { opacity: .34; filter: blur(25px) saturate(95%); }
        .auth-liquid-gloss {
          position: absolute;
          inset: 0;
          opacity: .3;
          background: radial-gradient(ellipse at 72% 18%, rgba(255,255,255,.36), transparent 34%),
                      radial-gradient(ellipse at 18% 82%, rgba(255,255,255,.2), transparent 32%);
        }
        .auth-gloss-dark { opacity: .12; }
        .auth-gloss-light { opacity: .36; }
        @keyframes auth-liquid-morph {
          0% { border-radius: 42% 58% 65% 35% / 45% 38% 62% 55%; }
          50% { border-radius: 58% 42% 38% 62% / 55% 62% 38% 45%; }
          100% { border-radius: 35% 65% 52% 48% / 62% 42% 58% 38%; }
        }
        @keyframes auth-liquid-float {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg) scale(1); }
          50% { transform: translate3d(4vw, -3vh, 0) rotate(14deg) scale(1.08); }
        }
        .auth-mode-panel { animation: auth-panel-enter .34s cubic-bezier(.2,.75,.25,1) both; }
        @keyframes auth-panel-enter {
          from { opacity: 0; transform: translate3d(0, 12px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .auth-error { animation: auth-error-shake .34s ease both; }
        @keyframes auth-error-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        .auth-submit:active { transform: scale(.985); }
        @media (prefers-reduced-motion: reduce) {
          .auth-liquid, .auth-mode-panel, .auth-error { animation: none !important; }
          .auth-submit { transition: none !important; }
        }
      `}</style>

      {/* [KEPT] Existing light/dark mode toggle and icon components. */}
      <button
        type="button"
        onClick={() => setIsDarkMode(!isDarkMode)}
        aria-label={isDarkMode ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
        className={`absolute right-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} ${theme.textSecondary} transition-transform active:scale-95`}
      >
        {isDarkMode ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}
      </button>

      {/* [KEPT] Content layer stays above the animated background and scrolls on short screens. */}
      <div className="relative z-10 flex min-h-full w-full items-center justify-center px-4 py-14 sm:px-8 sm:py-12">
        <main className="w-full max-w-[430px]">
          <header className="mb-7 text-center sm:mb-8">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gradient-to-r from-[#ffad70] to-[#ed5b2b]" />
            <h1 className={`text-[44px] font-black leading-none tracking-[-0.07em] ${theme.textPrimary}`}>
              AID<span className="text-[#f26b32]">O</span>
            </h1>
            <p className={`mt-2 text-[11px] font-bold uppercase tracking-[.22em] ${theme.textSecondary}`}>
              Merchant Price Calculator
            </p>
          </header>

          {/* [KEPT] APK download entry point. */}
          <DownloadApk />

          {/* [MODIFIED] Raised neumorphic card instead of a glass/flat panel. */}
          <section className={`relative mt-5 overflow-hidden rounded-[30px] p-5 sm:p-7 ${theme.bgContainer} ${theme.shadowOut}`}>
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#f26b32]/50 to-transparent" />

            <div className="mb-6">
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[.2em] text-[#ed5b2b]">
                {isLogin ? 'Selamat datang kembali' : 'Mulai sekarang'}
              </p>
              <h2 className={`text-[25px] font-extrabold tracking-tight ${theme.textPrimary}`}>
                {isLogin ? 'Masuk ke AIDO' : 'Buat akun Anda'}
              </h2>
              <p className={`mt-1.5 text-[13px] leading-relaxed ${theme.textSecondary}`}>
                {isLogin
                  ? 'Akses alat bantu bisnis Anda hanya satu langkah lagi.'
                  : 'Buat akun dan permudah perhitungan harga.'}
              </p>
            </div>

            <form className="space-y-3.5" onSubmit={handleSubmit} noValidate>
              <div key={isLogin ? 'login-fields' : 'register-fields'} className="auth-mode-panel space-y-3.5">
                {!isLogin && (
                  <>
                    <div className="relative">
                      <span className={iconWrapClass}><Icons.User size={17} /></span>
                      <input
                        type="text"
                        autoComplete="given-name"
                        placeholder="Nama depan"
                        aria-label="Nama depan"
                        value={authForm.firstName}
                        onChange={setAuthField('firstName')}
                        required
                        className={fieldClass}
                      />
                    </div>
                    <div className="relative">
                      <span className={iconWrapClass}><Icons.User size={17} /></span>
                      <input
                        type="text"
                        autoComplete="family-name"
                        placeholder="Nama belakang"
                        aria-label="Nama belakang"
                        value={authForm.lastName}
                        onChange={setAuthField('lastName')}
                        required
                        className={fieldClass}
                      />
                    </div>
                    <div className="relative">
                      <span className={iconWrapClass}><Icons.Store size={17} /></span>
                      <input
                        type="text"
                        autoComplete="organization"
                        placeholder="Nama toko (opsional)"
                        aria-label="Nama toko (opsional)"
                        value={authForm.storeName}
                        onChange={setAuthField('storeName')}
                        className={fieldClass}
                      />
                    </div>
                    <div className="relative">
                      <span className={iconWrapClass}><Icons.Mail size={17} /></span>
                      <input
                        type="email"
                        autoComplete="email"
                        autoCapitalize="none"
                        placeholder="Alamat email"
                        aria-label="Alamat email"
                        value={authForm.email}
                        onChange={setAuthField('email')}
                        required
                        className={fieldClass}
                      />
                    </div>
                  </>
                )}

                {isLogin && (
                  <div className="relative">
                    <span className={iconWrapClass}><Icons.Mail size={17} /></span>
                    <input
                      type="text"
                      autoComplete="username"
                      autoCapitalize="none"
                      placeholder="Email atau nama pengguna"
                      aria-label="Email atau nama pengguna"
                      value={authForm.identifier}
                      onChange={setAuthField('identifier')}
                      required
                      className={fieldClass}
                    />
                  </div>
                )}
              </div>

              <div className="relative auth-mode-panel">
                <span className={iconWrapClass}><Icons.Lock size={17} /></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  minLength={isLogin ? undefined : 8}
                  maxLength={128}
                  required
                  placeholder="Kata sandi"
                  aria-label="Kata sandi"
                  value={authForm.password}
                  onChange={setAuthField('password')}
                  className={`${fieldClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className={`absolute right-0 top-0 flex h-[54px] w-12 items-center justify-center rounded-r-2xl ${theme.textSecondary} transition-colors hover:text-[#f26b32]`}
                >
                  {showPassword ? <Icons.EyeOff size={17} /> : <Icons.Eye size={17} />}
                </button>
              </div>

              {authError && (
                <div
                  key={authError}
                  role="alert"
                  className="auth-error rounded-2xl border border-red-500/15 bg-red-500/10 px-4 py-3 text-[12px] font-semibold leading-relaxed text-red-500"
                >
                  {authError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="auth-submit mt-1 flex h-[56px] w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#f68143] to-[#ed5b2b] text-[14px] font-extrabold text-white shadow-[0_9px_22px_rgba(237,91,43,.25)] transition-[transform,opacity,box-shadow] duration-150 hover:shadow-[0_12px_26px_rgba(237,91,43,.32)] disabled:cursor-not-allowed disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                    <span>{isLogin ? 'Sedang masuk...' : 'Sedang membuat akun...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Masuk' : 'Buat akun'}</span>
                    <Icons.ChevronRight size={18} />
                  </>
                )}
              </button>

              {/* [MODIFIED] Google remains a plain server-side OAuth link. */}
              <div className="pt-3">
                <div className="relative mb-4 flex items-center">
                  <div className={`h-px w-full ${isDarkMode ? 'bg-white/10' : 'bg-[#9ba3ad]/35'}`} />
                  <span className={`absolute left-1/2 -translate-x-1/2 px-3 text-[10px] font-bold uppercase tracking-[.18em] ${theme.bgContainer} ${theme.textSecondary}`}>
                    Atau lanjutkan dengan
                  </span>
                </div>
                <a
                  href="/api/auth/google"
                  aria-label="Google"
                  className={`flex h-[54px] w-full items-center justify-center gap-3 rounded-2xl border-0 text-[13px] font-bold transition-transform active:scale-[.985] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4285F4]/50 ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} ${theme.textPrimary}`}
                >
                  <svg aria-hidden="true" viewBox="0 0 48 48" className="h-[19px] w-[19px]" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.96 46.98 31.86 46.98 24.55Z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.45-4.89 2.3-8.18 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
                    <path fill="#FBBC05" d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z" />
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
                  </svg>
                  <span>Google</span>
                </a>
              </div>

              <p className={`pt-3 text-center text-[12px] ${theme.textSecondary}`}>
                {isLogin ? "Belum punya akun?" : 'Sudah punya akun?'}{' '}
                <button
                  type="button"
                  onClick={switchAuthMode}
                  className="font-extrabold text-[#ed5b2b] transition-colors hover:text-[#f26b32] hover:underline"
                >
                  {isLogin ? 'Daftar' : 'Masuk'}
                </button>
              </p>
            </form>
          </section>

          <p className={`mt-6 text-center text-[10px] font-semibold tracking-[.12em] ${theme.textSecondary} opacity-70`}>
            AIDO · KALKULATOR HARGA MERCHANT
          </p>
        </main>
      </div>
    </div>
  );
};

export default AuthView;
