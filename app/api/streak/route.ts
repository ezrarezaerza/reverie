import { prisma } from '../../../src/lib/prisma';
import { calculateNewStreak } from '../../../src/lib/streak-logic';

// GET /api/streak?userId=xyz
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let streak = await prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          userId,
          currentCount: 0,
          longestCount: 0,
          graceDayUsed: false,
          lastEntryDate: null,
        },
      });
    }

    return new Response(JSON.stringify(streak), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// POST /api/streak - Update streak upon saving an entry
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, entryDate } = body;

    if (!userId || !entryDate) {
      return new Response(JSON.stringify({ error: 'Missing userId or entryDate' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let streak = await prisma.streak.findUnique({
      where: { userId },
    });

    if (!streak) {
      streak = await prisma.streak.create({
        data: {
          userId,
          currentCount: 0,
          longestCount: 0,
          graceDayUsed: false,
          lastEntryDate: null,
        },
      });
    }

    const calcResult = calculateNewStreak(
      streak.lastEntryDate,
      new Date(entryDate),
      streak.currentCount,
      streak.graceDayUsed
    );

    const updatedStreak = await prisma.streak.update({
      where: { userId },
      data: {
        currentCount: calcResult.currentStreak,
        longestCount: Math.max(streak.longestCount, calcResult.currentStreak),
        graceDayUsed: calcResult.graceDayUsed,
        lastEntryDate: new Date(entryDate),
      },
    });

    return new Response(JSON.stringify(updatedStreak), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
