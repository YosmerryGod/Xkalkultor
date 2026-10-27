import { useApp } from '../../context/AppContext';
import { Icons } from '../../components/icons/Icons';

const AuthView = () => {
  const {
    isLogin, showPassword, setShowPassword, authForm, authError,
    theme, setAuthField, switchAuthMode, handleAuthSubmit,
  } = useApp();
  return (
    <div className={`w-full h-full relative transition-colors duration-500 ${theme.bgContainer} flex flex-col`}>
      <div className="absolute top-0 left-0 w-full h-[260px] bg-[#e37151] overflow-hidden rounded-b-[40px] shadow-md z-0">
        <div className="absolute top-[20%] right-[-15%] w-[220px] h-[220px] bg-[#75c6ac] rounded-full mix-blend-multiply opacity-90 transform scale-125"></div>
        <div className="absolute top-[15%] left-[-15%] w-[180px] h-[180px] bg-[#d9bd68] rounded-full mix-blend-multiply opacity-90 transform scale-110"></div>
        <div className="relative h-2/3 flex flex-col items-center justify-center pt-8 px-6 text-center z-10">
           <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-md whitespace-pre-line">
            {isLogin ? 'Login Here' : 'Create an\naccount'}
           </h1>
        </div>
      </div>

      <div className={`absolute top-[180px] left-0 w-full h-[calc(100%-180px)] ${theme.bgContainer} rounded-t-[32px] sm:rounded-t-[40px] p-5 sm:p-6 shadow-[0_-10px_25px_rgba(0,0,0,0.1)] overflow-y-auto custom-scrollbar transition-colors duration-500 z-10`}>
        <form className="space-y-3 pt-1" onSubmit={handleAuthSubmit} noValidate>
          {!isLogin && (
            <div className="flex gap-3">
              <input type="text" autoComplete="given-name" placeholder="Nama Depan" value={authForm.firstName} onChange={setAuthField('firstName')} className={`w-1/2 h-11 px-4 rounded-2xl ${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} focus:outline-none ${theme.inputFocus} text-xs transition-all`} />
              <input type="text" autoComplete="family-name" placeholder="Nama Belakang" value={authForm.lastName} onChange={setAuthField('lastName')} className={`w-1/2 h-11 px-4 rounded-2xl ${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} focus:outline-none ${theme.inputFocus} text-xs transition-all`} />
            </div>
          )}
          {!isLogin && (
            <input type="text" placeholder="Nama Toko (opsional)" value={authForm.storeName} onChange={setAuthField('storeName')} className={`w-full h-11 px-4 rounded-2xl ${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} focus:outline-none ${theme.inputFocus} text-xs transition-all`} />
          )}
          {isLogin ? (
            <input type="text" autoComplete="username" autoCapitalize="none" placeholder="Email atau Username" value={authForm.identifier} onChange={setAuthField('identifier')} className={`w-full h-11 px-4 rounded-2xl ${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} focus:outline-none ${theme.inputFocus} text-xs transition-all`} />
          ) : (
            <input type="email" autoComplete="email" autoCapitalize="none" placeholder="Email" value={authForm.email} onChange={setAuthField('email')} className={`w-full h-11 px-4 rounded-2xl ${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} focus:outline-none ${theme.inputFocus} text-xs transition-all`} />
          )}
          <div className="flex gap-2 relative">
            <input type={showPassword ? "text" : "password"} autoComplete={isLogin ? 'current-password' : 'new-password'} placeholder="Password" value={authForm.password} onChange={setAuthField('password')} className={`w-full h-11 px-4 rounded-2xl ${theme.inputBg} ${theme.textPrimary} ${theme.shadowIn} focus:outline-none ${theme.inputFocus} text-xs transition-all`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Tampilkan password" className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-2xl ${theme.bgContainer} ${theme.shadowOut} ${theme.shadowOutActive} ${theme.textSecondary} transition-all`}>
              {showPassword ? <Icons.EyeOff size={15} /> : <Icons.Eye size={15} />}
            </button>
          </div>
          {authError && (
            <div role="alert" className="px-3 py-2 rounded-xl bg-red-500/10 text-red-500 text-[11px] font-semibold">{authError}</div>
          )}
          <button type="submit" className="w-full h-12 mt-3 rounded-2xl bg-black text-white font-bold text-xs tracking-wide shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:bg-gray-800 transition-colors active:scale-[0.98]">
            {isLogin ? 'Login' : 'Create account'}
          </button>
          <p className={`text-center text-[11px] font-medium pt-2 ${theme.textSecondary}`}>
            {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <button type="button" onClick={switchAuthMode} className="font-bold text-[#df6a49]">
              {isLogin ? 'Daftar' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthView;
