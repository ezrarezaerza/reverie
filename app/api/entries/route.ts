import { prisma } from '../../../src/lib/prisma';

// GET /api/entries?userId=xyz
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized or missing userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const entries = await prisma.entry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return new Response(JSON.stringify(entries), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Database query failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/entries - Create a new memory entry
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      date,
      title,
      body: textBody,
      timePacing,
      sensoryCues,
      location,
      weather,
      moodStamp,
      linkedNoveltyTitle,
      reflectionPrompt,
      isFavorite,
      paperStyle,
      inkColor,
    } = body;

    if (!userId || !title || !textBody) {
      return new Response(JSON.stringify({ error: 'Missing required entry fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const entry = await prisma.entry.create({
      data: {
        userId,
        date: new Date(date),
        title,
        body: textBody,
        timePacing,
        sensoryCues: sensoryCues || [],
        location,
        weather,
        moodStamp,
        linkedNoveltyTitle,
        reflectionPrompt,
        isFavorite: Boolean(isFavorite),
        paperStyle: paperStyle || 'ruled',
        inkColor: inkColor || 'blue',
      },
    });

    return new Response(JSON.stringify(entry), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Database insert failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
