// Teks tampilan untuk promo (dipakai daftar promo & form).
export const promoTags = (p) => {
  const tags = [];
  if (p.category === 'fake' || p.fake) tags.push('Diskon Coret');
  else if (p.category === 'mandiri') tags.push('Mandiri'); // promo lama
  return tags;
};

export const formatDiscount = (p) =>
  p.type === 'percentage' ? `${p.discount}%` : `Rp${(p.discount || 0).toLocaleString('id-ID')}`;
