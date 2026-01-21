import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@ratelapps.com'
    const password = 'Xndre$99'
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            role: 'ADMIN',
            maxProperties: 9999
        },
        create: {
            email,
            name: 'Admin RatelApps',
            password: hashedPassword,
            role: 'ADMIN',
            maxProperties: 9999
        },
    })

    console.log({ user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
