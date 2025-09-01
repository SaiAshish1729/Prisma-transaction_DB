const prisma = require("../config/DbConfig");
const { SUPPORTED_ASSETS } = require("../utills");

const assetPairSeeder = async () => {
    console.log("🌱 Seeding asset pairs...");

    let pairs = [];

    for (let i = 0; i < SUPPORTED_ASSETS.length; i++) {
        for (let j = i + 1; j < SUPPORTED_ASSETS.length; j++) {
            const base = SUPPORTED_ASSETS[i];
            const quote = SUPPORTED_ASSETS[j];
            pairs.push({
                asset_pair: `${base}-${quote}`,
            });
        }
    }

    console.log(`Generated ${pairs.length} pairs`);

    await prisma.asset_Pair.createMany({
        data: pairs,
        skipDuplicates: true, // requires @unique on asset_pair
    });

    console.log("✅ Asset pairs seeded successfully!");
};

assetPairSeeder()
    .catch((e) => {
        console.error("❌ Error seeding asset pairs:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

module.exports = { assetPairSeeder };
