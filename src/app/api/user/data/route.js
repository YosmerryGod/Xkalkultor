import { NextResponse } from 'next/server';
import { getDb } from '../../../../lib/db';
import { getCurrentUser } from '../../../../lib/session';

// [ADDED] All account data is isolated by the user ID from the validated session.
export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const sql = getDb();
    const rows = await sql`
      SELECT payload, updated_at
      FROM user_app_data
      WHERE user_id = ${user.id}
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      data: rows[0]?.payload || null,
      updatedAt: rows[0]?.updated_at || null,
    });
  } catch (error) {
    console.error('[User Data] Read failed:', error);
    return NextResponse.json({ success: false, error: 'Gagal memuat data akun.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const data = body?.data;

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return NextResponse.json({ success: false, error: 'Format data tidak valid.' }, { status: 400 });
    }

    // [ADDED] Limit each saved snapshot to 1 MB and reject prototype-bearing payloads.
    const serialized = JSON.stringify(data);
    if (serialized.length > 1_000_000 || serialized.includes('"__proto__"')) {
      return NextResponse.json({ success: false, error: 'Ukuran data terlalu besar atau tidak valid.' }, { status: 413 });
    }

    const sql = getDb();
    await sql`
      INSERT INTO user_app_data (user_id, payload, updated_at)
      VALUES (${user.id}, ${serialized}::jsonb, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
    `;

    return NextResponse.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error) {
    console.error('[User Data] Save failed:', error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan data akun.' }, { status: 500 });
  }
}
