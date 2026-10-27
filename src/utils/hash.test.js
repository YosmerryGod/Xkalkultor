import { describe, it, expect } from 'vitest';
import { sha256, hashPw } from './hash';
import { ADMIN_ACCOUNT } from '../constants/accounts';

describe('hash', () => {
  it('sha256 sesuai vektor uji standar', () => {
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('password awal admin cocok dengan hash bawaan', () => {
    expect(hashPw('123123')).toBe(ADMIN_ACCOUNT.passHash);
  });
});
