export const parseNum = (val, fallback = 0) => {
  if (val === '' || val === null || val === undefined) return fallback;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? fallback : parsed;
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

export const getBadgeStyle = (merchantStr) => {
  const m = String(merchantStr || '').toLowerCase();
  if (m.includes('shopee')) return 'bg-orange-500/10 text-orange-600';
  if (m.includes('grab')) return 'bg-green-500/10 text-green-600';
  if (m.includes('go')) return 'bg-red-500/10 text-red-600';
  return 'bg-gray-500/10 text-gray-600';
};
