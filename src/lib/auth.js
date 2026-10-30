import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  createHash,
} from 'node:crypto';
import { promisify } from 'node:util';

// [ADDED] Use Node.js scrypt for password hashing; never use the old client-side SHA-256 hash.
const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

// [ADDED] Hash a password with a unique random salt.
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt:${salt}:${Buffer.from(derivedKey).toString('hex')}`;
}

// [ADDED] Verify a password without leaking hash comparison timing.
export async function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string') return false;

  const [algorithm, salt, keyHex] = storedHash.split(':');
  if (algorithm !== 'scrypt' || !salt || !keyHex || !/^[a-f0-9]{128}$/i.test(keyHex)) {
    return false;
  }

  const derivedKey = Buffer.from(await scrypt(password, salt, KEY_LENGTH));
  const storedKey = Buffer.from(keyHex, 'hex');

  return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
}

// [ADDED] Generate an opaque session token; only its SHA-256 digest is stored in PostgreSQL.
export function createSessionToken() {
  return randomBytes(32).toString('base64url');
}

export function hashSessionToken(token) {
  return createHash('sha256').update(token).digest('hex');
}
