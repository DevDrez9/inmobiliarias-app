import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from './lib/auth'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

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
    matcher: ['/dashboard/:path*', '/publicar/:path*'],
}
