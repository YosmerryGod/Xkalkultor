import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
} from '../../../../lib/auth';

// [ADDED] Keep authentication endpoints on the Node.js runtime.
export const runtime = 'nodejs';

// [ADDED] Register a new user and immediately create a secure server session.
export async function POST(request) {
  try {
    const body = await request.json();

    const email = String(body.email || '').trim().toLowerCase();
    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();
    const storeName = String(body.storeName || '').trim();
    const password = typeof body.password === 'string' ? body.password : '';

    // [ADDED] Validate user input on the server; client validation is not trusted.
    if (!firstName) {
      return NextResponse.json(
        { success: false, error: 'Nama depan wajib diisi.' },
        { status: 400 }
      );
    }

    if (firstName.length > 100 || lastName.length > 100 || storeName.length > 150) {
      return NextResponse.json(
        { success: false, error: 'Nama atau nama toko terlalu panjang.' },
        { status: 400 }
      );
    }

    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email) || email.length > 255) {
      return NextResponse.json(
        { success: false, error: 'Format email tidak valid.' },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { success: false, error: 'Password harus terdiri dari 8–128 karakter.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const sql = getDb();

    // [ADDED] Use email as the initial username to match the current registration form.
    const rows = await sql`
      INSERT INTO users (
        username,
        email,
        password_hash,
        first_name,
        last_name,
        store_name
      )
      VALUES (
        ${email},
        ${email},
        ${passwordHash},
        ${firstName},
        ${lastName},
        ${storeName || `Toko ${firstName}`}
      )
      RETURNING id, username, email, first_name, last_name, store_name, role, created_at
    `;

    const user = rows[0];
    const sessionToken = createSessionToken();
    const sessionTokenHash = hashSessionToken(sessionToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await sql`
      INSERT INTO sessions (user_id, token_hash, expires_at)
      VALUES (${user.id}, ${sessionTokenHash}, ${expiresAt.toISOString()})
    `;

    const response = NextResponse.json(
      {
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
      },
      { status: 201 }
    );

    // [ADDED] The browser cannot read this cookie from JavaScript.
    response.cookies.set('xk_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    return response;
  } catch (error) {
    // [ADDED] PostgreSQL unique violation: email/username is already registered.
    if (error?.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar. Silakan login.' },
        { status: 409 }
      );
    }

    console.error('[Auth Register] Registration failed:', error);

    return NextResponse.json(
      { success: false, error: 'Pendaftaran gagal. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
