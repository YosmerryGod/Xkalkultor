import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { getCurrentUser } from '../../../lib/session';

// [ADDED] Public read access; only authenticated admins can change shared home content.
export const runtime = 'nodejs';

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql`
      SELECT payload, updated_at
      FROM global_app_data
      WHERE id = 1
      LIMIT 1
    `;
    return NextResponse.json({
      success: true,
      data: rows[0]?.payload || null,
      updatedAt: rows[0]?.updated_at || null,
    });
  } catch (error) {
    console.error('[Home Content] Read failed:', error);
    return NextResponse.json({ success: false, error: 'Gagal memuat konten beranda.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Akses admin diperlukan.' }, { status: 403 });
    }

    const body = await request.json();
    const data = body?.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return NextResponse.json({ success: false, error: 'Format konten tidak valid.' }, { status: 400 });
    }

    if (!Array.isArray(data.banners) || !Array.isArray(data.homePromos)) {
      return NextResponse.json({ success: false, error: 'Banner dan promo harus berupa array.' }, { status: 400 });
    }

    const serialized = JSON.stringify({
      banners: data.banners,
      homePromos: data.homePromos,
    });
    if (serialized.length > 1_000_000) {
      return NextResponse.json({ success: false, error: 'Konten terlalu besar.' }, { status: 413 });
    }

    const sql = getDb();
    await sql`
      INSERT INTO global_app_data (id, payload, updated_at)
      VALUES (1, ${serialized}::jsonb, NOW())
      ON CONFLICT (id)
      DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Home Content] Save failed:', error);
    return NextResponse.json({ success: false, error: 'Gagal menyimpan konten beranda.' }, { status: 500 });
  }
}
