const { PrismaClient } = require('./packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function resetDatabaseWithRealisticData() {
  try {
    console.log('🧹 Pulizia database in corso...');

    // Svuota tutte le tabelle in ordine
    console.log('📂 Svuotamento tabelle...');
    await prisma.orderItem.deleteMany({});
    await prisma.refundRequest.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.message.deleteMany({});
    await prisma.conversationParticipant.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.shippingAddress.deleteMany({});
    await prisma.adminLog.deleteMany({});
    await prisma.wine.deleteMany({});
    
    // Mantieni solo admin essenziale, rimuovi tutti gli altri utenti
    await prisma.user.deleteMany({
      where: {
        role: 'USER'
      }
    });

    console.log('✅ Database pulito con successo!');
    console.log('');
    console.log('🏗️ Creazione dati realistici...');

    // === UTENTI ITALIANI REALISTICI ===
    console.log('👥 Creazione utenti italiani...');
    
    const realisticUsers = [
      {
        firstName: 'Marco',
        lastName: 'Rossi',
        username: 'marco.rossi',
        email: 'marco.rossi@gmail.com',
        phone: '+39 348 123 4567',
        hashedPassword: '$2b$10$hashedpassword',
        role: 'USER',
        verified: true,
        location: 'Milano, Italia',
        bio: 'Appassionato di vini piemontesi e toscani. Collezionista da oltre 10 anni.',
        profileComplete: true
      },
      {
        firstName: 'Giulia',
        lastName: 'Bianchi',
        username: 'giulia.bianchi',
        email: 'giulia.bianchi@outlook.it',
        phone: '+39 335 987 6543',
        hashedPassword: '$2b$10$hashedpassword',
        role: 'USER',
        verified: true,
        location: 'Roma, Italia',
        bio: 'Sommelier professionista. Specializzata in vini del centro Italia.',
        profileComplete: true
      },
      {
        firstName: 'Alessandro',
        lastName: 'Verdi',
        username: 'alex.verdi',
        email: 'alessandro.verdi@libero.it',
        phone: '+39 366 456 7890',
        hashedPassword: '$2b$10$hashedpassword',
        role: 'USER',
        verified: false,
        location: 'Firenze, Italia',
        bio: 'Nuovo nel mondo del vino, alla ricerca di bottiglie di qualita.',
        profileComplete: true
      },
      {
        firstName: 'Francesca',
        lastName: 'Neri',
        username: 'francesca.neri',
        email: 'francesca.neri@yahoo.it',
        phone: '+39 333 234 5678',
        hashedPassword: '$2b$10$hashedpassword',
        role: 'USER',
        verified: true,
        location: 'Torino, Italia',
        bio: 'Enoteca di famiglia da 3 generazioni. Vendiamo solo il meglio.',
        profileComplete: true
      },
      {
        firstName: 'Luca',
        lastName: 'Ferrari',
        username: 'luca.ferrari',
        email: 'luca.ferrari@gmail.com',
        phone: '+39 347 345 6789',
        hashedPassword: '$2b$10$hashedpassword',
        role: 'USER',
        verified: true,
        location: 'Bologna, Italia',
        bio: 'Produttore di vini biologici in Emilia-Romagna.',
        profileComplete: true
      },
      {
        firstName: 'Sofia',
        lastName: 'Romano',
        username: 'sofia.romano',
        email: 'sofia.romano@hotmail.it',
        phone: '+39 338 567 8901',
        hashedPassword: '$2b$10$hashedpassword',
        role: 'USER',
        verified: true,
        location: 'Napoli, Italia',
        bio: 'Amante dei vini del sud Italia, soprattutto siciliani.',
        profileComplete: true
      },
      {
        firstName: 'Matteo',
        lastName: 'Conti',
        username: 'matteo.conti',
        email: 'matteo.conti@gmail.com',
        phone: '+39 349 678 9012',
        hashedPassword: '$2b$10$hashedpassword',
        role: 'USER',
        verified: true,
        location: 'Verona, Italia',
        bio: 'Esperto di Amarone e vini veneti. Guida turistica enologica.',
        profileComplete: true
      },
      {
        firstName: 'Elena',
        lastName: 'Grassi',
        username: 'elena.grassi',
        email: 'elena.grassi@tiscali.it',
        phone: '+39 320 789 0123',
        hashedPassword: '$2b$10$hashedpassword',
        role: 'USER',
        verified: false,
        location: 'Siena, Italia',
        bio: 'Collezionista di Brunello di Montalcino e Chianti Classico.',
        profileComplete: true
      },
      {
        firstName: 'Davide',
        lastName: 'Moretti',
        username: 'davide.moretti',
        email: 'davide.moretti@virgilio.it',
        phone: '+39 331 890 1234',
        hashedPassword: '$2b$10$hashedpassword',
        role: 'USER',
        verified: true,
        location: 'Palermo, Italia',
        bio: 'Rappresentante di cantine siciliane. Specializzato in vini vulcanici.',
        profileComplete: true
      },
      {
        firstName: 'Chiara',
        lastName: 'Lombardi',
        username: 'chiara.lombardi',
        email: 'chiara.lombardi@alice.it',
        phone: '+39 342 901 2345',
        hashedPassword: '$2b$10$hashedpassword',
        role: 'ADMIN',
        verified: true,
        location: 'Milano, Italia',
        bio: 'Administrator del marketplace. Sommelier certificata AIS.',
        profileComplete: true
      }
    ];

    const createdUsers = [];
    for (const userData of realisticUsers) {
      try {
        const user = await prisma.user.create({
          data: userData
        });
        console.log(`✅ Creato utente: ${user.firstName} ${user.lastName} (${user.email})`);
        createdUsers.push(user);
      } catch (error) {
        console.log(`⚠️ Errore creazione utente ${userData.firstName}: ${error.message}`);
      }
    }

    // === VINI ITALIANI REALISTICI ===
    console.log('');
    console.log('🍷 Creazione vini italiani autentici...');

    const realisticWines = [
      // TOSCANA
      {
        title: 'Chianti Classico DOCG 2020',
        description: 'Un Chianti Classico di grande eleganza, prodotto con uve Sangiovese al 95% e Canaiolo al 5%. Note di ciliegia matura, spezie dolci e tannini setosi.',
        price: 35.00,
        vintage: 2020,
        region: 'Toscana',
        country: 'Italia',
        producer: 'Castello di Ama',
        grapeVariety: 'Sangiovese, Canaiolo',
        alcoholContent: 13.5,
        volume: 750,
        wineType: 'RED',
        condition: 'EXCELLENT',
        quantity: 6,
        status: 'ACTIVE',
        images: []
      },
      {
        title: 'Brunello di Montalcino DOCG 2017',
        description: 'Il re dei vini toscani. Brunello di Montalcino dal celebre produttore Biondi Santi. Invecchiamento minimo 5 anni, complessita straordinaria.',
        price: 120.00,
        vintage: 2017,
        region: 'Toscana',
        country: 'Italia',
        producer: 'Biondi Santi',
        grapeVariety: 'Sangiovese Grosso',
        alcoholContent: 14.0,
        volume: 750,
        wineType: 'RED',
        condition: 'MINT',
        quantity: 2,
        status: 'ACTIVE',
        images: []
      },
      {
        title: 'Ornellaia 2019',
        description: 'Super Tuscan iconico della Tenuta Ornellaia. Blend di Cabernet Sauvignon, Merlot, Petit Verdot e Cabernet Franc. Potenza ed eleganza in equilibrio.',
        price: 180.00,
        vintage: 2019,
        region: 'Toscana',
        country: 'Italia',
        producer: 'Tenuta Ornellaia',
        grapeVariety: 'Cabernet Sauvignon, Merlot, Petit Verdot, Cabernet Franc',
        alcoholContent: 14.5,
        volume: 750,
        wineType: 'RED',
        condition: 'EXCELLENT',
        quantity: 3,
        status: 'ACTIVE',
        images: []
      },

      // PIEMONTE
      {
        title: 'Barolo DOCG Brunate 2018',
        description: 'Barolo dal celebre Cru Brunate. Nebbiolo di grande struttura e longevita. Note di rosa, catrame, spezie e frutti rossi maturi.',
        price: 85.00,
        vintage: 2018,
        region: 'Piemonte',
        country: 'Italia',
        producer: 'Ceretto',
        grapeVariety: 'Nebbiolo',
        alcoholContent: 14.0,
        volume: 750,
        wineType: 'RED',
        condition: 'EXCELLENT',
        quantity: 3,
        status: 'ACTIVE',
        images: []
      },
      {
        title: 'Barbaresco DOCG 2019',
        description: 'Barbaresco dal maestro Angelo Gaja. Nebbiolo in purezza dai vigneti di Barbaresco. Eleganza e finezza piemontese in bottiglia.',
        price: 95.00,
        vintage: 2019,
        region: 'Piemonte',
        country: 'Italia',
        producer: 'Gaja',
        grapeVariety: 'Nebbiolo',
        alcoholContent: 14.2,
        volume: 750,
        wineType: 'RED',
        condition: 'MINT',
        quantity: 2,
        status: 'ACTIVE',
        images: []
      },
      {
        title: 'Nebbiolo di Alba DOC 2021',
        description: 'Nebbiolo di Alba giovane e fresco. Perfetto per avvicinarsi al mondo del Nebbiolo. Note floreali e fruttate.',
        price: 32.00,
        vintage: 2021,
        region: 'Piemonte',
        country: 'Italia',
        producer: 'Produttori del Barbaresco',
        grapeVariety: 'Nebbiolo',
        alcoholContent: 13.5,
        volume: 750,
        wineType: 'RED',
        condition: 'EXCELLENT',
        quantity: 5,
        status: 'ACTIVE',
        images: []
      },

      // VENETO
      {
        title: 'Prosecco di Valdobbiadene DOCG',
        description: 'Prosecco Superiore dalla zona più vocata del Veneto. Glera in purezza, perlage fine e persistente. Ideale per aperitivi.',
        price: 28.00,
        vintage: 2022,
        region: 'Veneto',
        country: 'Italia',
        producer: 'Villa Sandi',
        grapeVariety: 'Glera',
        alcoholContent: 11.5,
        volume: 750,
        wineType: 'SPARKLING',
        condition: 'MINT',
        quantity: 8,
        status: 'ACTIVE',
        images: []
      },
      {
        title: 'Amarone della Valpolicella DOCG 2018',
        description: 'Amarone della Valpolicella dalle uve appassite. Potenza, concentrazione e complessita uniche. Note di frutta secca e spezie.',
        price: 75.00,
        vintage: 2018,
        region: 'Veneto',
        country: 'Italia',
        producer: 'Allegrini',
        grapeVariety: 'Corvina, Rondinella, Molinara',
        alcoholContent: 15.5,
        volume: 750,
        wineType: 'RED',
        condition: 'EXCELLENT',
        quantity: 4,
        status: 'ACTIVE',
        images: []
      },

      // SICILIA
      {
        title: 'Etna Rosso DOC 2020',
        description: 'Vino vulcanico del Etna. Nerello Mascalese in purezza dai terreni lavici. Mineralita unica e grande bevibilita.',
        price: 42.00,
        vintage: 2020,
        region: 'Sicilia',
        country: 'Italia',
        producer: 'Planeta',
        grapeVariety: 'Nerello Mascalese',
        alcoholContent: 13.0,
        volume: 750,
        wineType: 'RED',
        condition: 'EXCELLENT',
        quantity: 5,
        status: 'ACTIVE',
        images: []
      },
      {
        title: 'Nero di Avola IGT Sicilia 2021',
        description: 'Nero di Avola, il vitigno simbolo della Sicilia. Intenso, caldo e mediterraneo. Note di frutti rossi maturi e spezie.',
        price: 18.00,
        vintage: 2021,
        region: 'Sicilia',
        country: 'Italia',
        producer: 'Feudo Arancio',
        grapeVariety: 'Nero di Avola',
        alcoholContent: 13.8,
        volume: 750,
        wineType: 'RED',
        condition: 'VERY_GOOD',
        quantity: 6,
        status: 'ACTIVE',
        images: []
      },

      // MARCHE
      {
        title: 'Verdicchio dei Castelli di Jesi DOC 2022',
        description: 'Verdicchio delle Marche, bianco di grande personalita. Fresco, sapido e longevo. Perfetto esempio di vitigno autoctono.',
        price: 16.00,
        vintage: 2022,
        region: 'Marche',
        country: 'Italia',
        producer: 'Villa Bucci',
        grapeVariety: 'Verdicchio',
        alcoholContent: 12.5,
        volume: 750,
        wineType: 'WHITE',
        condition: 'EXCELLENT',
        quantity: 8,
        status: 'ACTIVE',
        images: []
      },

      // CAMPANIA
      {
        title: 'Taurasi DOCG 2017',
        description: 'Taurasi, il Barolo del Sud. Aglianico in purezza dalle colline irpine. Struttura, eleganza e grande capacita di invecchiamento.',
        price: 48.00,
        vintage: 2017,
        region: 'Campania',
        country: 'Italia',
        producer: 'Mastroberardino',
        grapeVariety: 'Aglianico',
        alcoholContent: 14.0,
        volume: 750,
        wineType: 'RED',
        condition: 'EXCELLENT',
        quantity: 4,
        status: 'ACTIVE',
        images: []
      },
      {
        title: 'Greco di Tufo DOCG 2022',
        description: 'Greco di Tufo dalla Campania. Bianco vulcanico di grande carattere. Freschezza, mineralita e note agrumate.',
        price: 24.00,
        vintage: 2022,
        region: 'Campania',
        country: 'Italia',
        producer: 'Feudi di San Gregorio',
        grapeVariety: 'Greco',
        alcoholContent: 12.8,
        volume: 750,
        wineType: 'WHITE',
        condition: 'EXCELLENT',
        quantity: 6,
        status: 'ACTIVE',
        images: []
      }
    ];

    const createdWines = [];
    for (let i = 0; i < realisticWines.length; i++) {
      const wineData = realisticWines[i];
      // Assegna venditori casuali dai nostri utenti creati
      const randomSeller = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      
      try {
        const wine = await prisma.wine.create({
          data: {
            ...wineData,
            sellerId: randomSeller.id
          }
        });
        console.log(`🍷 Creato vino: ${wine.title} - €${wine.price} (Venditore: ${randomSeller.firstName} ${randomSeller.lastName})`);
        createdWines.push(wine);
      } catch (error) {
        console.log(`⚠️ Errore creazione vino ${wineData.title}: ${error.message}`);
      }
    }

    // === ORDINI REALISTICI ===
    console.log('');
    console.log('📦 Creazione ordini realistici...');

    const orderStatuses = ['PENDING', 'CONFIRMED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const paymentProviders = ['STRIPE', 'PAYPAL'];
    
    // Crea 20 ordini casuali
    for (let i = 0; i < 20; i++) {
      try {
        const randomBuyer = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const randomWine = createdWines[Math.floor(Math.random() * createdWines.length)];
        const randomQuantity = Math.floor(Math.random() * 3) + 1; // 1-3 bottiglie
        const randomStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
        const randomPayment = paymentProviders[Math.floor(Math.random() * paymentProviders.length)];
        
        const totalAmount = Number(randomWine.price) * randomQuantity;
        const shippingCost = 8.50;
        
        const order = await prisma.order.create({
          data: {
            orderNumber: `ORD-2024-${String(i + 1).padStart(3, '0')}`,
            buyerId: randomBuyer.id,
            sellerId: randomWine.sellerId,
            status: randomStatus,
            totalAmount: totalAmount,
            shippingCost: shippingCost,
            paymentProvider: randomPayment,
            paymentStatus: randomStatus === 'DELIVERED' ? 'COMPLETED' : 'PENDING',
            trackingNumber: randomStatus === 'SHIPPED' || randomStatus === 'DELIVERED' ? `IT${Math.random().toString().substr(2, 10)}` : null,
            items: {
              create: [
                {
                  wineId: randomWine.id,
                  quantity: randomQuantity,
                  price: Number(randomWine.price)
                }
              ]
            }
          },
          include: {
            buyer: {
              select: {
                firstName: true,
                lastName: true
              }
            },
            items: {
              include: {
                wine: {
                  select: {
                    title: true
                  }
                }
              }
            }
          }
        });

        console.log(`📦 Creato ordine ${order.orderNumber}: ${order.buyer.firstName} ${order.buyer.lastName} - ${order.items[0].wine.title} x${randomQuantity} (€${totalAmount}) - ${randomStatus}`);
      } catch (error) {
        console.log(`⚠️ Errore creazione ordine ${i + 1}: ${error.message}`);
      }
    }

    console.log('');
    console.log('🎉 Database popolato con successo con dati realistici!');
    console.log('');
    console.log('📊 Riepilogo:');
    console.log(`👥 Utenti creati: ${createdUsers.length}`);
    console.log(`🍷 Vini creati: ${createdWines.length}`);
    console.log(`📦 Ordini creati: 20`);
    console.log('');
    console.log('✨ Il database ora contiene dati realistici italiani!');
    console.log('🔍 Puoi testare ricerche come: "Marco", "Barolo", "Toscana", "Chianti"');

  } catch (error) {
    console.error('❌ Errore durante il reset del database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabaseWithRealisticData();