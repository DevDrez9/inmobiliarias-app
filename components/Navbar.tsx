import Link from 'next/link'
import { getSession } from '@/lib/auth'
import NavMenu from './NavMenu'

export default async function Navbar() {
    const session = await getSession()

    return (
        <nav className="bg-white shadow p-4 flex justify-between items-center z-10 relative">
            <Link href="/" className="font-bold text-xl text-blue-600">GeoInmuebles</Link>
            <NavMenu user={session?.user} />
        </nav>
    )
}
