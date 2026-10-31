import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';

// [ADDED] Start Google OpenID Connect using one-time state and nonce cookies.
export const runtime = 'nodejs';

export async function GET(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(new URL('/?auth=google_error', request.url));
  }

  const state = randomBytes(32).toString('base64url');
  const nonce = randomBytes(32).toString('base64url');
  const redirectUri = new URL('/api/auth/google/callback', request.url).toString();
  const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

  authorizationUrl.searchParams.set('client_id', clientId);
  authorizationUrl.searchParams.set('redirect_uri', redirectUri);
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', 'openid email profile');
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('nonce', nonce);
  authorizationUrl.searchParams.set('prompt', 'select_account');

  const response = NextResponse.redirect(authorizationUrl);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/google/callback',
    maxAge: 600,
  };

  response.cookies.set('xk_google_state', state, cookieOptions);
  response.cookies.set('xk_google_nonce', nonce, cookieOptions);
  return response;
}
