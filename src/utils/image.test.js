import { describe, it, expect } from 'vitest';
import { isImageData, BANNER_SIZE } from './image';

describe('gambar banner', () => {
  it('hanya menerima data URL gambar', () => {
    expect(isImageData('data:image/jpeg;base64,AAAA')).toBe(true);
    expect(isImageData('https://contoh.com/a.jpg')).toBe(false);
    expect(isImageData('javascript:alert(1)')).toBe(false);
    expect(isImageData('')).toBe(false);
    expect(isImageData(undefined)).toBe(false);
  });

  it('ukuran banner berrasio 2:1', () => {
    expect(BANNER_SIZE.width / BANNER_SIZE.height).toBe(2);
  });
});
