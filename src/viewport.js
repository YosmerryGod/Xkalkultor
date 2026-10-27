// Menghitung tinggi layar yang benar-benar terlihat (di luar address bar browser HP)
// lalu menyimpannya di variabel CSS --app-height, dipakai oleh class .app-vh.
const setAppHeight = () => {
  document.documentElement.style.setProperty('--app-height', `${Math.round(window.innerHeight)}px`);
};

setAppHeight();
window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', setAppHeight);
