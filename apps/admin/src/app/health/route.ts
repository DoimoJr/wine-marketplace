export async function GET() {
  return Response.json({ 
    status: 'ok', 
    service: 'wine-marketplace-admin',
    timestamp: new Date().toISOString() 
  });
}