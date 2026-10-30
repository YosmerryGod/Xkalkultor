import { cookies } from 'next/headers';
import { getDb } from './db';
import { hashSessionToken } from './auth';

// [ADDED] Resolve the current user from the HTTP-only session cookie.
export async function getCurrentUser() {
  const token = cookies().get('xk_session')?.value;
  if (!token) return null;
  const sql = getDb();
  const tokenHash = hashSessionToken(token);
  const rows = await sql`
    SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.store_name, u.role
    FROM sessions s
    INNER JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ${tokenHash}
      AND s.revoked_at IS NULL
      AND s.expires_at > NOW()
    LIMIT 1
  `;
  return rows[0] || null;
}

// [ADDED] Convert database user fields to the frontend profile format.
export function toPublicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name || '',
    storeName: user.store_name || '',
    tier: user.role === 'admin' ? 'PRO' : 'FREE',
    isAdmin: user.role === 'admin',
  };
}
