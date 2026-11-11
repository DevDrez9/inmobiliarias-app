import { NextResponse } from 'next/server';

export async function GET() {
  const playStoreUrl =
    'https://play.google.com/store/apps/details?id=com.ratelapps.alquilabo';
  return NextResponse.redirect(playStoreUrl);
}
