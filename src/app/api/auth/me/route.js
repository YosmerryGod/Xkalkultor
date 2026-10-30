import { NextResponse } from 'next/server';
import { getCurrentUser, toPublicUser } from '../../../../lib/session';

// [ADDED] Return the signed-in user's public profile.
export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }
    return NextResponse.json({ success: true, user: toPublicUser(user) });
  } catch (error) {
    console.error('[Auth Me] Session lookup failed:', error);
    return NextResponse.json({ success: false, error: 'Gagal memeriksa session.' }, { status: 500 });
  }
}
