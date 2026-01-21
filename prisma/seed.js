const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@ratelapps.com'
    const password = 'Xndre$99'
    const hashedPassword = await bcrypt.hash(password, 10)

    console.log("Checking if Admin user exists...")

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

    console.log("Admin user processed:", user.email)
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
