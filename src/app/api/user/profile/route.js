import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { getCurrentUser, toPublicUser } from '../../../../lib/session';

// [ADDED] Update the authenticated user's own profile.
export const runtime = 'nodejs';

export async function PUT(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Sesi login berakhir. Silakan login kembali.' }, { status: 401 });
    }

    const body = await request.json();
    const firstName = String(body.firstName || '').trim();
    const lastName = String(body.lastName || '').trim();
    const storeName = String(body.storeName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();

    if (!firstName) {
      return NextResponse.json({ success: false, error: 'Nama depan wajib diisi.' }, { status: 400 });
    }
    if (firstName.length > 100 || lastName.length > 100 || storeName.length > 150) {
      return NextResponse.json({ success: false, error: 'Nama atau nama toko terlalu panjang.' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      return NextResponse.json({ success: false, error: 'Format email tidak valid.' }, { status: 400 });
    }

    const sql = getDb();
    const rows = await sql`
      UPDATE users
      SET
        first_name = ${firstName},
        last_name = ${lastName},
        store_name = ${storeName},
        email = ${email},
        username = CASE WHEN LOWER(username) = LOWER(${currentUser.email}) THEN ${email} ELSE username END,
        updated_at = NOW()
      WHERE id = ${currentUser.id}
      RETURNING id, username, email, first_name, last_name, store_name, role
    `;

    return NextResponse.json({ success: true, user: toPublicUser(rows[0]) });
  } catch (error) {
    if (error?.code === '23505') {
      return NextResponse.json({ success: false, error: 'Email tersebut sudah digunakan akun lain.' }, { status: 409 });
    }
    console.error('[Profile Update] Failed:', error);
    return NextResponse.json({ success: false, error: 'Gagal memperbarui profil.' }, { status: 500 });
  }
}
