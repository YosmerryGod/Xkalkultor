import { useEffect, useState } from 'react';

const APK_DOWNLOAD_URL = 'https://github.com/YosmerryGod/Xkalkultor/releases/latest/download/AYDO.apk';

const DownloadApk = () => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.navigator.standalone === true;
    const isTwa = document.referrer.startsWith('android-app://');

    setIsBrowser(!isStandalone && !isTwa);
  }, []);

  if (!isBrowser) return null;

  return (
    <section className="mt-5 rounded-2xl border border-[#e37151]/20 bg-[#e37151]/[0.07] p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e37151] text-white">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className="h-5 w-5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3v12" />
            <path d="m7 10 5 5 5-5" />
            <path d="M5 17v3h14v-3" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-[#e37151]">Download APK</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
            Install AYDO on your Android device for quick access.
          </p>
        </div>
      </div>
      <a
        href={APK_DOWNLOAD_URL}
        className="mt-3 flex min-h-11 w-full items-center justify-center rounded-xl bg-[#e37151] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#cf6043] focus:outline-none focus:ring-2 focus:ring-[#e37151] focus:ring-offset-2"
      >
        Download AYDO.apk
      </a>
      <p className="mt-2 text-center text-[11px] text-gray-500 dark:text-gray-400">
        Allow installation from unknown sources when prompted.
      </p>
    </section>
  );
};

export default DownloadApk;
