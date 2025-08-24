export async function enqueueAnalysis(_input: any) {
  // stub: no-op on this environment — server may skip background analysis
  return { enqueued: false, reason: 'stubbed in dev' };
}
export default { enqueueAnalysis };
