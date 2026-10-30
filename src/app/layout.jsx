import './globals.css';

export const metadata = {
  title: 'AYDO – Kalkulator Merchant', // [MODIFIED] Nama aplikasi dan metadata browser.
  description: 'Kalkulator harga jual untuk merchant ShopeeFood, GrabFood, dan GoFood',
  applicationName: 'AYDO', // [MODIFIED] Identitas aplikasi.
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
    title: 'AYDO', // [MODIFIED] Nama aplikasi saat ditambahkan ke layar utama.
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
