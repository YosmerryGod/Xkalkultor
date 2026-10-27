import './globals.css';

export const metadata = {
  title: 'Exkalt — Kalkulator Harga Jual',
  description: 'Kalkulator harga jual ShopeeFood, GrabFood, dan GoFood',
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
