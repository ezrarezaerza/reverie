export interface HistoricalMemoryMatch {
  id: string;
  userId: string;
  date: string;
  title: string;
  body: string;
  yearsAgo: number;
}

/**
 * Historical memory retrieval querying entries where month and day match, but year is strictly in the past.
 * SQL Equivalent:
 * SELECT * FROM entries 
 * WHERE user_id = $1 
 *   AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM $2::date)
 *   AND EXTRACT(DAY FROM date) = EXTRACT(DAY FROM $2::date)
 *   AND EXTRACT(YEAR FROM date) < EXTRACT(YEAR FROM $2::date)
 * ORDER BY date DESC;
 */
export async function getOnThisDayMemoriesAction(userId: string, targetDate: Date = new Date(), entriesList: any[] = []): Promise<HistoricalMemoryMatch[]> {
  const targetMonth = targetDate.getMonth() + 1;
  const targetDay = targetDate.getDate();
  const targetYear = targetDate.getFullYear();

  const matches = entriesList.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    return (
      (e.userId === userId || !e.userId) &&
      d.getMonth() + 1 === targetMonth &&
      d.getDate() === targetDay &&
      d.getFullYear() < targetYear
    );
  }).map(e => ({
    id: e.id,
    userId: e.userId || userId,
    date: e.date,
    title: e.title,
    body: e.body,
    yearsAgo: targetYear - new Date(e.date + 'T00:00:00').getFullYear()
  }));

  return matches;
}
