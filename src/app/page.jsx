'use client';

import dynamic from 'next/dynamic';

// Aplikasi memakai localStorage dan window, jadi hanya dirender di browser (tanpa SSR).
const App = dynamic(() => import('../AppRoot'), { ssr: false });

export default function Page() {
  return <App />;
}
