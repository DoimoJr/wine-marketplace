const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function createTestUsersAndOrders() {
  try {
    console.log('🚀 Creating test users and orders...');

    // Create test users with diverse names and emails
    const testUsers = [
      {
        firstName: 'Marco',
        lastName: 'Rossi',
        username: 'marco.rossi',
        email: 'marco.rossi@email.com',
        phone: '+39 123 456 7890',
      },
      {
        firstName: 'Giulia',
        lastName: 'Bianchi',
        username: 'giulia.bianchi',
        email: 'giulia.bianchi@gmail.com',
        phone: '+39 234 567 8901',
      },
      {
        firstName: 'Alessandro',
        lastName: 'Verdi',
        username: 'alex.verdi',
        email: 'alex.verdi@yahoo.it',
        phone: '+39 345 678 9012',
      },
      {
        firstName: 'Francesca',
        lastName: 'Neri',
        username: 'francesca.neri',
        email: 'francesca.neri@libero.it',
        phone: '+39 456 789 0123',
      },
      {
        firstName: 'Luca',
        lastName: 'Ferrari',
        username: 'luca.ferrari',
        email: 'luca.ferrari@outlook.com',
        phone: '+39 567 890 1234',
      },
      {
        firstName: 'Sofia',
        lastName: 'Romano',
        username: 'sofia.romano',
        email: 'sofia.romano@hotmail.it',
        phone: '+39 678 901 2345',
      }
    ];

    // Create or find users
    const createdUsers = [];
    for (const userData of testUsers) {
      try {
        // Check if user already exists
        let user = await prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              ...userData,
              hashedPassword: '$2b$10$hashedpassword', // Mock hashed password
              role: 'USER',
              verified: true,
            }
          });
          console.log(`✅ Created user: ${user.firstName} ${user.lastName}`);
        } else {
          console.log(`ℹ️ User already exists: ${user.firstName} ${user.lastName}`);
        }
        createdUsers.push(user);
      } catch (error) {
        console.log(`⚠️ Error creating user ${userData.firstName}: ${error.message}`);
      }
    }

    // Get some wines to create orders with
    const wines = await prisma.wine.findMany({
      take: 5,
      where: {
        status: 'ACTIVE'
      }
    });

    if (wines.length === 0) {
      console.log('❌ No wines found. Creating some test wines first...');
      
      // Create some test wines
      const testWines = [
        {
          title: 'Barolo Riserva 2018',
          description: 'Excellent Barolo from Piedmont',
          price: 85.00,
          vintage: 2018,
          region: 'Piedmont',
          country: 'Italy',
          producer: 'Antinori',
          grapeVariety: 'Nebbiolo',
          wineType: 'RED',
          condition: 'EXCELLENT',
          quantity: 12,
          images: [],
          sellerId: createdUsers[0].id,
        },
        {
          title: 'Chianti Classico 2020',
          description: 'Classic Tuscan red wine',
          price: 35.00,
          vintage: 2020,
          region: 'Tuscany',
          country: 'Italy',
          producer: 'Riserva San Lorenzo',
          grapeVariety: 'Sangiovese',
          wineType: 'RED',
          condition: 'VERY_GOOD',
          quantity: 8,
          images: [],
          sellerId: createdUsers[1].id,
        },
        {
          title: 'Prosecco di Valdobbiadene DOCG',
          description: 'Premium sparkling wine',
          price: 28.00,
          vintage: 2022,
          region: 'Veneto',
          country: 'Italy',
          producer: 'Villa Sandi',
          grapeVariety: 'Glera',
          wineType: 'SPARKLING',
          condition: 'MINT',
          quantity: 15,
          images: [],
          sellerId: createdUsers[2].id,
        }
      ];

      for (const wineData of testWines) {
        await prisma.wine.create({
          data: wineData
        });
      }

      // Refresh wines list
      const newWines = await prisma.wine.findMany({
        take: 5,
        where: { status: 'ACTIVE' }
      });
      wines.push(...newWines);
    }

    console.log(`📦 Found ${wines.length} wines to use for orders`);

    // Create orders with different buyers
    const orderPromises = createdUsers.map(async (user, index) => {
      const wine = wines[index % wines.length];
      const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 bottles
      
      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${index}`,
          buyerId: user.id,
          sellerId: wine.sellerId,
          totalAmount: wine.price * quantity,
          shippingCost: 8.50,
          status: ['PENDING', 'CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED'][Math.floor(Math.random() * 5)],
          paymentProvider: 'STRIPE',
          items: {
            create: [
              {
                wineId: wine.id,
                quantity: quantity,
                price: wine.price,
              }
            ]
          }
        },
        include: {
          buyer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });

      console.log(`📦 Created order for ${user.firstName} ${user.lastName} - ${wine.title} (€${wine.price * quantity})`);
      return order;
    });

    await Promise.all(orderPromises);

    console.log('🎉 Successfully created test users and orders!');
    console.log('');
    console.log('Now you can test search with:');
    console.log('- "Marco" (should find Marco Rossi)');
    console.log('- "Giulia" (should find Giulia Bianchi)');
    console.log('- "gmail" (should find Giulia)');
    console.log('- "Ferrari" (should find Luca Ferrari)');
    console.log('- "SOFIA" (case insensitive - should find Sofia Romano)');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsersAndOrders();