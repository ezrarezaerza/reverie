import { getDailyPrompt } from '../../../../src/lib/prompt-engine';

export async function GET(req: Request) {
  // Nightly Nudge cron handler (e.g. executed daily at 21:00 / 9:00 PM local time)
  const today = new Date();
  const dailyPrompt = getDailyPrompt(today);

  const payload = {
    title: 'Reverie • Evening Gentle Nudge',
    body: `Did you try today's micro-novelty? "${dailyPrompt.text}" — take 2 minutes to inscribe your core memory before sleep.`,
    url: '/'
  };

  return new Response(JSON.stringify({
    success: true,
    nudgeDispatched: true,
    payload,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
