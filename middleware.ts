import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from './lib/auth'

const PLAY_STORE_URL =
    'https://play.google.com/store/apps/details?id=com.ratelapps.alquilabo'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Redirección directa 307 a Google Play Store sin mostrar ninguna página intermedia
    if (pathname.startsWith('/ir') || pathname.startsWith('/mapa')) {
        return NextResponse.redirect(PLAY_STORE_URL, 307)
    }

    const session = request.cookies.get('session')?.value
    const decryptedSession = session ? await decrypt(session) : null

    if (!decryptedSession) {
        if (
            pathname.startsWith('/dashboard') ||
            pathname.startsWith('/publicar')
        ) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/publicar/:path*',
        '/ir/:path*',
        '/ir',
        '/mapa/:path*',
        '/mapa',
    ],
}
