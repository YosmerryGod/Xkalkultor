// Ukuran banner: kartu di Beranda tampil 280-320 px x 160 px (rasio 2:1).
// 960 x 480 px = tajam di layar HP 3x, dan ringan saat disimpan di browser.
export const BANNER_SIZE = { width: 960, height: 480 };

/** Hanya data URL gambar yang dianggap aman untuk ditampilkan. */
export const isImageData = (s) => typeof s === 'string' && s.startsWith('data:image/');

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gambar tidak bisa dibaca. Coba file lain.'));
    };
    img.src = url;
  });

/**
 * Ubah file gambar jadi data URL JPEG berukuran tetap (dipotong dari tengah, seperti "cover").
 * Hasilnya dikompres supaya aman disimpan di localStorage.
 */
export const fileToBannerImage = async (file, { width, height, quality = 0.82 } = BANNER_SIZE) => {
  if (!file || !String(file.type).startsWith('image/')) throw new Error('File harus berupa gambar.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Ukuran gambar maksimal 10 MB.');

  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const scale = Math.max(width / img.width, height / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.fillStyle = '#ffffff'; // PNG transparan -> latar putih
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
  return canvas.toDataURL('image/jpeg', quality);
};
