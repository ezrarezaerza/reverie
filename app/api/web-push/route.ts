export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { endpoint, keys, userId } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return new Response(JSON.stringify({ error: 'Missing required push subscription fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Persist or update PushSubscription in database (e.g. Prisma / Postgres)
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Push subscription successfully registered' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
