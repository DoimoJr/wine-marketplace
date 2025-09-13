const { PrismaClient } = require('../../../packages/database/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function createRefundRequests() {
  try {
    console.log('🔄 Creazione richieste di rimborso fittizie...');

    // Richieste di rimborso realistiche
    const refundRequests = [
      {
        id: 'refund-001',
        orderId: 'cmfgxijdh0015r116ne9kb9tg', // Luca Ferrari - ORD-2024-002 - €144
        userId: 'cmfgxii8s0004r116u4prj6b0',
        reason: 'DAMAGED_ITEM',
        details: 'La bottiglia di Taurasi è arrivata rotta durante il trasporto. La confezione era danneggiata e il vino si è versato completamente.',
        amount: 144.00,
        status: 'PENDING',
        createdAt: new Date('2024-09-10T14:30:00Z'),
        updatedAt: new Date('2024-09-10T14:30:00Z')
      },
      {
        id: 'refund-002',
        orderId: 'cmfgxilsz0029r116wxkml4hw', // Matteo Conti - ORD-2024-012 - €35
        userId: 'cmfgxiib00006r116yx8la688',
        reason: 'ITEM_NOT_AS_DESCRIBED',
        details: 'Il Chianti ricevuto non corrisponde alla descrizione. Era indicato come annata 2020 ma l\'etichetta mostra 2018.',
        amount: 35.00,
        status: 'APPROVED',
        adminNotes: 'Errore confermato dal venditore. Rimborso approvato.',
        processedAt: new Date('2024-09-11T09:15:00Z'),
        createdAt: new Date('2024-09-09T16:45:00Z'),
        updatedAt: new Date('2024-09-11T09:15:00Z')
      },
      {
        id: 'refund-003',
        orderId: 'cmfgximag002hr116b4ctzc3m', // Marco Rossi - ORD-2024-014 - €56
        userId: 'cmfgxii2t0000r1168ry9nw1x',
        reason: 'ITEM_NOT_RECEIVED',
        details: 'Non ho mai ricevuto l\'ordine. Il corriere dice di averlo consegnato ma non è mai arrivato a casa mia.',
        amount: 56.00,
        status: 'PROCESSED',
        adminNotes: 'Verificato con il corriere. Pacco risulta smarrito. Rimborso elaborato.',
        processedAt: new Date('2024-09-11T15:20:00Z'),
        createdAt: new Date('2024-09-08T10:20:00Z'),
        updatedAt: new Date('2024-09-11T15:20:00Z')
      },
      {
        id: 'refund-004',
        orderId: 'cmfgximsr002pr116fwe06uc9', // Alessandro Verdi - ORD-2024-016 - €48
        userId: 'cmfgxii6g0002r1160k2w4e26',
        reason: 'CHANGED_MIND',
        details: 'Ho cambiato idea sull\'acquisto. Il vino non è di mio gradimento dopo aver letto altre recensioni.',
        amount: 48.00,
        status: 'DENIED',
        adminNotes: 'La bottiglia è già stata aperta secondo il venditore. Rimborso negato.',
        processedAt: new Date('2024-09-11T11:30:00Z'),
        createdAt: new Date('2024-09-10T08:15:00Z'),
        updatedAt: new Date('2024-09-11T11:30:00Z')
      },
      {
        id: 'refund-005',
        orderId: 'cmfgximjj002lr116ats90uju', // Giulia Bianchi - ORD-2024-015 - €360
        userId: 'cmfgxii560001r116wvnk3l34',
        reason: 'SELLER_CANCELLED',
        details: 'Il venditore ha annullato l\'ordine dopo 3 giorni dicendo che non aveva più la bottiglia disponibile.',
        amount: 360.00,
        status: 'COMPLETED',
        adminNotes: 'Cancellazione confermata dal venditore. Rimborso completato automaticamente.',
        processedAt: new Date('2024-09-12T08:00:00Z'),
        createdAt: new Date('2024-09-11T19:30:00Z'),
        updatedAt: new Date('2024-09-12T08:00:00Z')
      },
      {
        id: 'refund-006',
        orderId: 'cmfgxikln001pr116qhloy55h', // Giulia Bianchi - ORD-2024-007 - €48
        userId: 'cmfgxii560001r116wvnk3l34',
        reason: 'OTHER',
        details: 'Problema con il pagamento. La mia carta è stata addebitata due volte per lo stesso ordine.',
        amount: 48.00,
        status: 'PENDING',
        createdAt: new Date('2024-09-12T12:00:00Z'),
        updatedAt: new Date('2024-09-12T12:00:00Z')
      }
    ];

    // Inserisci le richieste una alla volta
    for (const request of refundRequests) {
      await prisma.refundRequest.create({
        data: request
      });
      console.log(`✅ Creata richiesta rimborso ${request.id}: ${request.reason} - €${request.amount} (${request.status})`);
    }

    console.log(`\n🎉 Create ${refundRequests.length} richieste di rimborso con diversi stati:`);
    console.log('📊 Riepilogo stati:');
    console.log('- PENDING: 2 richieste');
    console.log('- APPROVED: 1 richiesta');
    console.log('- PROCESSED: 1 richiesta'); 
    console.log('- DENIED: 1 richiesta');
    console.log('- COMPLETED: 1 richiesta');
    
    console.log('\n🔍 Motivi inclusi:');
    console.log('- DAMAGED_ITEM: Bottiglia rotta');
    console.log('- ITEM_NOT_AS_DESCRIBED: Annata diversa');
    console.log('- ITEM_NOT_RECEIVED: Pacco smarrito');
    console.log('- CHANGED_MIND: Ripensamento');
    console.log('- SELLER_CANCELLED: Venditore cancella');
    console.log('- OTHER: Doppio addebito');

  } catch (error) {
    console.error('❌ Errore durante la creazione delle richieste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRefundRequests();