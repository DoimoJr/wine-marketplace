export async function GET() {
  return Response.json({ 
    status: 'ok', 
    service: 'wine-marketplace-web',
    timestamp: new Date().toISOString() 
  });
}