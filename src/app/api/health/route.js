import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';

// [ADDED] Keep this endpoint on the Node.js runtime.
export const runtime = 'nodejs';

// [ADDED] Check API and PostgreSQL connectivity without exposing credentials.
export async function GET() {
  try {
    const sql = getDb();
    await sql`SELECT 1 AS connected`;

    return NextResponse.json({
      success: true,
      api: 'ok',
      database: 'connected',
    });
  } catch (error) {
    console.error('[Health Check] Database connection failed:', error);

    return NextResponse.json(
      {
        success: false,
        api: 'ok',
        database: 'disconnected',
      },
      { status: 503 }
    );
  }
}
