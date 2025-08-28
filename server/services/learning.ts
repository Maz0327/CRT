export type SignalFeedbackEvent = {
  projectId: string;
  signalId: string;
  action: 'confirm' | 'needs_edit';
};

export async function recordSignalFeedback(event: SignalFeedbackEvent): Promise<void> {
  // Stub implementation - log for now, we'll add weights later
  console.log('[LEARNING] Signal feedback recorded:', {
    projectId: event.projectId,
    signalId: event.signalId,
    action: event.action,
    timestamp: new Date().toISOString()
  });
  
  // Future: Enqueue learning event for processing
  // await learningQueue.add('signal-feedback', event);
}