export const ADMIN_QUEUES = ['frequent', 'linking', 'heavy', 'sync'] as const;
export type AdminQueueName = (typeof ADMIN_QUEUES)[number];

export const ADMIN_JOB_STATUS = [
  'waiting',
  'active',
  'failed',
  'completed',
] as const;
export type AdminJobStatus = (typeof ADMIN_JOB_STATUS)[number];
