import './globals.css';

export const metadata = {
  title: 'Xkalkultor — Kalkulator Harga Jual', // [MODIFIED] Nama aplikasi Android dan metadata browser.
  description: 'Kalkulator harga jual ShopeeFood, GrabFood, dan GoFood',
  applicationName: 'Xkalkultor', // [MODIFIED] Identitas aplikasi.
  manifest: '/manifest.webmanifest',
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    title: 'Xkalkultor', // [MODIFIED] Nama aplikasi saat ditambahkan ke layar utama.
    statusBarStyle: 'default',
  },
  other: { 'mobile-web-app-capable': 'yes' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#e37151',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
