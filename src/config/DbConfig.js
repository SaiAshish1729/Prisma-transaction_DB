const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
    // log: ['info', 'warn', 'error'],
    log: [
        // { level: 'query', emit: 'event' },
        // { level: 'error', emit: 'event' },
        // { level: 'warn', emit: 'event' },
        // { level: 'info', emit: 'event' }
    ]
})

// 🔹 Log queries
prisma.$on('query', (e) => {
    console.log(`\n📌 Prisma Query: ${e.query}`)
    console.log(`🔢 Params: ${e.params}`)
    console.log(`⏱ Duration: ${e.duration}ms\n`)
})

// 🔹 Log errors
prisma.$on('error', (e) => {
    console.error("❌ Prisma Error:", e)
})

// 🔹 Log warnings
prisma.$on('warn', (e) => {
    console.warn("⚠️ Prisma Warning:", e)
})

module.exports = prisma