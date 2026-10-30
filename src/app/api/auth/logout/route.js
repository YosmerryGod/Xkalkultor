import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { hashSessionToken } from '../../../../lib/auth';

// [ADDED] Revoke the current session and expire the HTTP-only cookie.
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const token = request.cookies.get('xk_session')?.value;
    if (token) {
      const sql = getDb();
      const tokenHash = hashSessionToken(token);
      await sql`
        UPDATE sessions
        SET revoked_at = NOW()
        WHERE token_hash = ${tokenHash}
          AND revoked_at IS NULL
      `;
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('xk_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });
    return response;
  } catch (error) {
    console.error('[Auth Logout] Logout failed:', error);
    return NextResponse.json({ success: false, error: 'Logout gagal.' }, { status: 500 });
  }
}
