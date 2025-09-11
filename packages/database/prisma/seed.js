import { PrismaClient, WineType, WineCondition, UserRole } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // Clean existing data
    await prisma.adminLog.deleteMany();
    await prisma.refundRequest.deleteMany();
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.shippingAddress.deleteMany();
    await prisma.wine.deleteMany();
    await prisma.user.deleteMany();
    // Create admin user
    const admin = await prisma.user.create({
        data: {
            email: 'admin@winemarketplace.com',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            role: UserRole.ADMIN,
            verified: true,
            profileComplete: true,
            bio: 'System administrator',
        },
    });
    // Create test users
    const seller1 = await prisma.user.create({
        data: {
            email: 'marco.rossi@example.com',
            username: 'marcorossi',
            firstName: 'Marco',
            lastName: 'Rossi',
            verified: true,
            profileComplete: true,
            bio: 'Wine collector from Tuscany with 20+ years of experience',
            location: 'Firenze, Italy',
        },
    });
    const seller2 = await prisma.user.create({
        data: {
            email: 'giulia.bianchi@example.com',
            username: 'giuliab',
            firstName: 'Giulia',
            lastName: 'Bianchi',
            verified: true,
            profileComplete: true,
            bio: 'Sommelier and wine enthusiast',
            location: 'Milano, Italy',
        },
    });
    const buyer = await prisma.user.create({
        data: {
            email: 'luca.verdi@example.com',
            username: 'lucaverdi',
            firstName: 'Luca',
            lastName: 'Verdi',
            verified: true,
            profileComplete: true,
            bio: 'Wine lover and collector',
            location: 'Roma, Italy',
        },
    });
    // Create sample wines
    const wines = await Promise.all([
        prisma.wine.create({
            data: {
                title: 'Barolo DOCG Brunate 2018',
                description: 'Exceptional Barolo from one of the most prestigious crus in the region. Perfect storage conditions, ready to drink or cellar for many more years.',
                price: 85.00,
                vintage: 2018,
                region: 'Piemonte',
                country: 'Italy',
                producer: 'Giuseppe Rinaldi',
                grapeVariety: 'Nebbiolo',
                alcoholContent: 14.5,
                volume: 750,
                wineType: WineType.RED,
                condition: WineCondition.EXCELLENT,
                quantity: 1,
                images: ['/images/barolo-brunate.jpg'],
                sellerId: seller1.id,
            },
        }),
        prisma.wine.create({
            data: {
                title: 'Chianti Classico Riserva DOCG 2019',
                description: 'Outstanding Chianti Classico from a historic estate. Aged in oak barrels, showing beautiful complexity and elegance.',
                price: 35.50,
                vintage: 2019,
                region: 'Toscana',
                country: 'Italy',
                producer: 'Castello di Brolio',
                grapeVariety: 'Sangiovese, Cabernet Sauvignon',
                alcoholContent: 13.5,
                volume: 750,
                wineType: WineType.RED,
                condition: WineCondition.MINT,
                quantity: 3,
                images: ['/images/chianti-classico.jpg'],
                sellerId: seller1.id,
            },
        }),
        prisma.wine.create({
            data: {
                title: 'Franciacorta DOCG Brut 2017',
                description: 'Premium Italian sparkling wine made with traditional method. Perfect for celebrations or aperitif.',
                price: 28.00,
                vintage: 2017,
                region: 'Lombardia',
                country: 'Italy',
                producer: 'Ca del Bosco',
                grapeVariety: 'Chardonnay, Pinot Nero',
                alcoholContent: 12.5,
                volume: 750,
                wineType: WineType.SPARKLING,
                condition: WineCondition.EXCELLENT,
                quantity: 2,
                images: ['/images/franciacorta-brut.jpg'],
                sellerId: seller2.id,
            },
        }),
        prisma.wine.create({
            data: {
                title: 'Brunello di Montalcino DOCG 2017',
                description: 'Exceptional vintage from one of the most renowned producers. Powerful yet elegant, with great aging potential.',
                price: 120.00,
                vintage: 2017,
                region: 'Toscana',
                country: 'Italy',
                producer: 'Biondi Santi',
                grapeVariety: 'Sangiovese Grosso',
                alcoholContent: 14.0,
                volume: 750,
                wineType: WineType.RED,
                condition: WineCondition.MINT,
                quantity: 1,
                images: ['/images/brunello-montalcino.jpg'],
                sellerId: seller2.id,
            },
        }),
    ]);
    // Create shipping addresses
    await prisma.shippingAddress.create({
        data: {
            firstName: 'Luca',
            lastName: 'Verdi',
            address1: 'Via Roma 123',
            city: 'Roma',
            zipCode: '00100',
            country: 'Italy',
            phone: '+39 06 1234567',
            isDefault: true,
            userId: buyer.id,
        },
    });
    console.log('✅ Seeding completed successfully!');
    console.log(`Created ${wines.length} wines`);
    console.log('Users created:');
    console.log(`- Admin: ${admin.email}`);
    console.log(`- Seller 1: ${seller1.email}`);
    console.log(`- Seller 2: ${seller2.email}`);
    console.log(`- Buyer: ${buyer.email}`);
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
