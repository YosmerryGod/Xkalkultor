import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { hashPassword, verifyPassword } from '../../../../lib/auth';
import { getCurrentUser } from '../../../../lib/session';

// [ADDED] Change password only after verifying the current password.
export const runtime = 'nodejs';

export async function PUT(request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ success: false, error: 'Sesi login berakhir. Silakan login kembali.' }, { status: 401 });
    }

    const body = await request.json();
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!currentPassword || newPassword.length < 8 || newPassword.length > 128) {
      return NextResponse.json({ success: false, error: 'Password baru harus terdiri dari 8–128 karakter.' }, { status: 400 });
    }

    const sql = getDb();
    const rows = await sql`SELECT password_hash FROM users WHERE id = ${currentUser.id} LIMIT 1`;
    if (!rows[0] || !(await verifyPassword(currentPassword, rows[0].password_hash))) {
      return NextResponse.json({ success: false, error: 'Password saat ini tidak sesuai.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);
    await sql`
      UPDATE users
      SET password_hash = ${passwordHash}, updated_at = NOW()
      WHERE id = ${currentUser.id}
    `;

    return NextResponse.json({ success: true, message: 'Password berhasil diperbarui.' });
  } catch (error) {
    console.error('[Password Update] Failed:', error);
    return NextResponse.json({ success: false, error: 'Gagal mengganti password.' }, { status: 500 });
  }
}
