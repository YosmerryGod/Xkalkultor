import { createPublicKey, randomBytes, verify as verifySignature } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getDb } from '../../../../../lib/db';
import { hashPassword, createSessionToken, hashSessionToken } from '../../../../../lib/auth';

// [ADDED] Complete Google OIDC, verify the signed ID token, and issue the app's own session.
export const runtime = 'nodejs';

const clearOAuthCookies = (response) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/google/callback',
    expires: new Date(0),
  };
  response.cookies.set('xk_google_state', '', options);
  response.cookies.set('xk_google_nonce', '', options);
};

const failOAuth = (request) => {
  const response = NextResponse.redirect(new URL('/?auth=google_error', request.url));
  clearOAuthCookies(response);
  return response;
};

async function verifyGoogleIdToken(idToken, expectedNonce, clientId) {
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new Error('Invalid Google ID token.');

  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));

  if (header.alg !== 'RS256' || !header.kid) throw new Error('Unsupported Google ID token.');

  const keysResponse = await fetch('https://www.googleapis.com/oauth2/v3/certs', {
    cache: 'no-store',
  });
  if (!keysResponse.ok) throw new Error('Unable to retrieve Google signing keys.');

  const keys = await keysResponse.json();
  const jwk = keys.keys?.find((key) => key.kid === header.kid && key.use === 'sig');
  if (!jwk) throw new Error('Google signing key was not found.');

  const publicKey = createPublicKey({ key: jwk, format: 'jwk' });
  const signingInput = Buffer.from(parts[0] + '.' + parts[1]);
  const signature = Buffer.from(parts[2], 'base64url');
  if (!verifySignature('RSA-SHA256', signingInput, publicKey, signature)) {
    throw new Error('Google ID token signature is invalid.');
  }

  const now = Math.floor(Date.now() / 1000);
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss)) {
    throw new Error('Invalid Google token issuer.');
  }
  if (!audiences.includes(clientId) || (claims.azp && claims.azp !== clientId)) {
    throw new Error('Google token audience mismatch.');
  }
  if (!claims.sub || !claims.email || !(claims.email_verified === true || claims.email_verified === 'true')) {
    throw new Error('Google account email is not verified.');
  }
  if (!claims.exp || claims.exp <= now || !claims.iat || claims.iat > now + 60) {
    throw new Error('Google ID token has expired or is not yet valid.');
  }
  if (!claims.nonce || claims.nonce !== expectedNonce) {
    throw new Error('Google OAuth nonce mismatch.');
  }

  return claims;
}

export async function GET(request) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const code = request.nextUrl.searchParams.get('code');
    const returnedState = request.nextUrl.searchParams.get('state');
    const savedState = request.cookies.get('xk_google_state')?.value;
    const savedNonce = request.cookies.get('xk_google_nonce')?.value;

    if (!clientId || !clientSecret || !code || !returnedState || !savedState || !savedNonce) {
      return failOAuth(request);
    }
    if (returnedState !== savedState) return failOAuth(request);

    const redirectUri = new URL('/api/auth/google/callback', request.url).toString();
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
      cache: 'no-store',
    });

    if (!tokenResponse.ok) return failOAuth(request);
    const tokenPayload = await tokenResponse.json();
    if (!tokenPayload.id_token) return failOAuth(request);

    const claims = await verifyGoogleIdToken(tokenPayload.id_token, savedNonce, clientId);
    const email = String(claims.email).trim().toLowerCase();
    const firstName = String(claims.given_name || claims.name || email.split('@')[0]).trim().slice(0, 100);
    const lastName = String(claims.family_name || '').trim().slice(0, 100);
    const sql = getDb();

    // [ADDED] Prefer the immutable Google subject; otherwise link a verified matching email.
    let rows = await sql`
      SELECT id, username, email, google_sub, first_name, last_name, store_name, role
      FROM users
      WHERE google_sub = ${claims.sub}
      LIMIT 1
    `;
    let user = rows[0];

    if (!user) {
      rows = await sql`
        SELECT id, username, email, google_sub, first_name, last_name, store_name, role
        FROM users
        WHERE LOWER(email) = ${email}
        LIMIT 1
      `;
      user = rows[0];

      if (user) {
        if (user.google_sub && user.google_sub !== claims.sub) {
          return failOAuth(request);
        }
        rows = await sql`
          UPDATE users
          SET
            google_sub = ${claims.sub},
            first_name = CASE WHEN first_name = '' THEN ${firstName} ELSE first_name END,
            last_name = CASE WHEN last_name = '' THEN ${lastName} ELSE last_name END,
            updated_at = NOW()
          WHERE id = ${user.id}
          RETURNING id, username, email, first_name, last_name, store_name, role
        `;
        user = rows[0];
      } else {
        const generatedPassword = randomBytes(48).toString('hex');
        const passwordHash = await hashPassword(generatedPassword);
        rows = await sql`
          INSERT INTO users (
            username, email, password_hash, first_name, last_name, store_name, google_sub
          )
          VALUES (
            ${email}, ${email}, ${passwordHash}, ${firstName}, ${lastName},
            ${'Toko ' + firstName}, ${claims.sub}
          )
          RETURNING id, username, email, first_name, last_name, store_name, role
        `;
        user = rows[0];
      }
    }

    const sessionToken = createSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await sql`
      INSERT INTO sessions (user_id, token_hash, expires_at)
      VALUES (${user.id}, ${hashSessionToken(sessionToken)}, ${expiresAt.toISOString()})
    `;

    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('xk_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });
    clearOAuthCookies(response);
    return response;
  } catch (error) {
    console.error('[Google Auth] OAuth callback failed:', error);
    return failOAuth(request);
  }
}
