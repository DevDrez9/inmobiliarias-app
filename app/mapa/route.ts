import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const propertyId = req.nextUrl.searchParams.get('inmueble') || '';
  const target = propertyId ? `/ir/${propertyId}` : '/ir';
  return NextResponse.redirect(new URL(target, req.url));
}
