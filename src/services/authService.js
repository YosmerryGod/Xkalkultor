import { KEYS } from '../constants/storageKeys';
import { ADMIN_ACCOUNT } from '../constants/accounts';
import { LS } from '../utils/storage';
import { hashPw } from '../utils/hash';

export const toProfile = (u) => ({
  id: u.id,
  username: u.username,
  email: u.email,
  firstName: u.firstName,
  lastName: u.lastName || '',
  storeName: u.storeName,
  tier: u.isAdmin ? 'PRO' : 'FREE',
  isAdmin: !!u.isAdmin,
});

const getUsers = () => LS.get(KEYS.users, []);

// ---- sesi
export const saveSession = (id) => LS.set(KEYS.session, id);
export const clearSession = () => LS.del(KEYS.session);

export const getInitialSession = () => {
  const id = LS.get(KEYS.session, null);
  if (!id) return null;
  if (id === ADMIN_ACCOUNT.id) return toProfile(ADMIN_ACCOUNT);
  const user = getUsers().find((u) => u.id === id);
  return user ? toProfile(user) : null;
};

// ---- data per akun (riwayat & pengaturan promo)
export const loadUserData = (id) => LS.get(KEYS.userData(id), null);
export const saveUserData = (id, data) => LS.set(KEYS.userData(id), data);
export const getInitialUserData = () => {
  const sess = getInitialSession();
  return sess ? loadUserData(sess.id) : null;
};

// ---- login & daftar. Mengembalikan { user } atau { error }.
export const login = (identifier, password) => {
  const ident = (identifier || '').trim().toLowerCase();
  if (!ident || !password) return { error: 'Isi email/username dan password.' };
  const user = [ADMIN_ACCOUNT, ...getUsers()].find(
    (u) => u.username.toLowerCase() === ident || u.email.toLowerCase() === ident
  );
  if (!user || user.passHash !== hashPw(password)) return { error: 'Email/username atau password salah.' };
  return { user };
};

export const register = (form) => {
  const users = getUsers();
  const email = (form.email || '').trim().toLowerCase();
  const firstName = (form.firstName || '').trim();
  if (!firstName) return { error: 'Nama depan wajib diisi.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Format email tidak valid.' };
  if ((form.password || '').length < 6) return { error: 'Password minimal 6 karakter.' };
  if ([ADMIN_ACCOUNT, ...users].some((u) => u.email.toLowerCase() === email || u.username.toLowerCase() === email)) {
    return { error: 'Email sudah terdaftar. Silakan login.' };
  }
  const user = {
    id: 'u' + Date.now(),
    username: email,
    email,
    firstName,
    lastName: (form.lastName || '').trim(),
    storeName: (form.storeName || '').trim() || `Toko ${firstName}`,
    passHash: hashPw(form.password),
    isAdmin: false,
  };
  LS.set(KEYS.users, [...users, user]);
  return { user };
};
