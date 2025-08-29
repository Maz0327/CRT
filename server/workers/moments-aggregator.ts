import { storage } from '../storage';

export function startMomentsAggregator() {
  if (process.env.ENABLE_WORKERS !== 'true') {
    console.log('[moments-aggregator] Skipped (ENABLE_WORKERS not true)');
    return;
  }

  const run = async () => {
    try {
      const client = (storage as any).client;
      await client.query(`refresh materialized view concurrently public.moments_read_24h;`, []);
      console.log('[moments-aggregator] Refreshed moments_read_24h materialized view');
      // Optionally: roll-up to curated public.moments for 7d/30d windows
    } catch (err) {
      console.error('[moments-aggregator] error', err);
    }
  };

  console.log('[moments-aggregator] Starting with 5-minute intervals');
  // Refresh every 5 minutes to reduce system load
  run();
  setInterval(run, 5 * 60 * 1000);
}