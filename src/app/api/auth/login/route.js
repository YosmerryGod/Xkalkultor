import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import {
  createSessionToken,
  hashSessionToken,
  verifyPassword,
} from '../../../../lib/auth';

// [ADDED] Keep authentication endpoints on the Node.js runtime.
export const runtime = 'nodejs';

// [ADDED] Authenticate with email/username and issue a secure HTTP-only session cookie.
export async function POST(request) {
  try {
    const body = await request.json();
    const identifier = String(body.identifier || body.email || body.username || '')
      .trim()
      .toLowerCase();
    const password = typeof body.password === 'string' ? body.password : '';

    // [ADDED] Validate input before querying the database.
    if (!identifier || !password || identifier.length > 255 || password.length > 128) {
      return NextResponse.json(
        { success: false, error: 'Isi email/username dan password.' },
        { status: 400 }
      );
    }

    const sql = getDb();

    // [ADDED] Parameterized query prevents SQL injection.
    const rows = await sql`
      SELECT
        id,
        username,
        email,
        password_hash,
        first_name,
        last_name,
        store_name,
        role
      FROM users
      WHERE LOWER(email) = ${identifier}
         OR LOWER(username) = ${identifier}
      LIMIT 1
    `;

    const user = rows[0];

    // [ADDED] Use the same generic error for unknown users and incorrect passwords.
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json(
        { success: false, error: 'Email/username atau password salah.' },
        { status: 401 }
      );
    }

    const sessionToken = createSessionToken();
    const sessionTokenHash = hashSessionToken(sessionToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await sql`
      INSERT INTO sessions (user_id, token_hash, expires_at)
      VALUES (${user.id}, ${sessionTokenHash}, ${expiresAt.toISOString()})
    `;

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        storeName: user.store_name,
        tier: user.role === 'admin' ? 'PRO' : 'FREE',
        isAdmin: user.role === 'admin',
      },
    });

    // [ADDED] Protect the session token from JavaScript access.
    response.cookies.set('xk_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    console.error('[Auth Login] Login failed:', error);

    return NextResponse.json(
      { success: false, error: 'Login gagal. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
