const { PrismaClient } = require('../../../packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function createPendingRefunds() {
  try {
    console.log('🔄 Creazione richieste di rimborso PENDING per test...');

    // Prima elimino eventuali refund di test esistenti
    await prisma.refundRequest.deleteMany({
      where: {
        id: {
          startsWith: 'refund-test-'
        }
      }
    });

    // Refund di test in stato PENDING
    const pendingRefunds = [
      {
        id: 'refund-test-001',
        orderId: 'cmfgxijdh0015r116ne9kb9tg', // Ordine esistente
        userId: 'cmfgxii8s0004r116u4prj6b0',   // User esistente
        reason: 'DAMAGED_ITEM',
        details: '🍷 Bottiglia di Barolo 2018 arrivata con il tappo danneggiato e perdite di vino. La confezione era bagnata.',
        amount: 89.50,
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'refund-test-002',
        orderId: 'cmfgxilsz0029r116wxkml4hw', // Ordine esistente
        userId: 'cmfgxiib00006r116yx8la688',   // User esistente
        reason: 'ITEM_NOT_AS_DESCRIBED',
        details: '🏷️ Il Chianti Classico ricevuto non corrisponde alla descrizione online. Colore e sapore completamente diversi dal descritto.',
        amount: 125.00,
        status: 'PENDING',
        createdAt: new Date(Date.now() - 3600000), // 1 ora fa
        updatedAt: new Date(Date.now() - 3600000)
      },
      {
        id: 'refund-test-003',
        orderId: 'cmfgximag002hr116b4ctzc3m', // Ordine esistente
        userId: 'cmfgxii2t0000r1168ry9nw1x',   // User esistente
        reason: 'ITEM_NOT_RECEIVED',
        details: '📦 Ordine mai arrivato dopo 2 settimane dalla spedizione. Il tracking mostra "consegnato" ma non ho ricevuto nulla.',
        amount: 67.00,
        status: 'PENDING',
        createdAt: new Date(Date.now() - 7200000), // 2 ore fa
        updatedAt: new Date(Date.now() - 7200000)
      },
      {
        id: 'refund-test-004',
        orderId: 'cmfgximsr002pr116fwe06uc9', // Ordine esistente
        userId: 'cmfgxii6g0002r1160k2w4e26',   // User esistente
        reason: 'OTHER',
        details: '💳 La mia carta di credito è stata addebitata due volte per lo stesso ordine. Ho bisogno del rimborso del doppio addebito.',
        amount: 48.00,
        status: 'PENDING',
        createdAt: new Date(Date.now() - 1800000), // 30 minuti fa
        updatedAt: new Date(Date.now() - 1800000)
      }
    ];

    // Inserisci i refund PENDING
    for (const refund of pendingRefunds) {
      await prisma.refundRequest.create({
        data: refund
      });
      console.log(`✅ Creato refund PENDING: ${refund.id} - ${refund.reason} - €${refund.amount}`);
    }

    console.log(`\n🎉 Creati ${pendingRefunds.length} refund in stato PENDING per test!`);
    console.log('\n📝 Ora puoi andare su http://localhost:3001/refunds e testare:');
    console.log('   👁️  Aprire i dettagli del refund');
    console.log('   ✅ Cliccare "Approve" per approvare');
    console.log('   ❌ Cliccare "Deny" per rifiutare');
    console.log('\n🔍 I refund PENDING dovrebbero essere visibili nel tab "Pending"');

  } catch (error) {
    console.error('❌ Errore durante la creazione dei refund:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createPendingRefunds();