// Akun admin bawaan. Password disimpan sebagai hash SHA-256 (bukan teks biasa).
// Username: admin  |  Password awal: 123123  -> segera ganti (lihat README).
export const ADMIN_ACCOUNT = {
  id: 'admin',
  username: 'admin',
  email: 'admin@exkalt.com',
  firstName: 'Admin',
  lastName: 'Exkalt',
  storeName: 'Exkalt Store',
  passHash: '51e0fef42856f793279148c2dcb00be58a11ef440f42c89abddc84177453a895',
  isAdmin: true,
};
