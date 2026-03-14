import { Injectable } from '@nestjs/common';
import { QueueService } from './../../../libs/services/queue/queue.service';

export type AdminQueueName = 'frequent' | 'linking' | 'heavy' | 'sync';
export type AdminJobStatus = 'waiting' | 'active' | 'failed' | 'completed';

@Injectable()
export class AdminQueueService {
  constructor(private readonly queueService: QueueService) {}

  // 📊 Overview (cards)
  async getOverview() {
    return this.queueService.getAllQueuesStats();
  }

  // 📋 Listagem de jobs
  async getJobs(queue: AdminQueueName, status: AdminJobStatus, limit = 20) {
    return this.queueService.getJobs(queue, status, limit);
  }

  // 🔁 Retry job
  async retryJob(queue: AdminQueueName, jobId: string) {
    return this.queueService.retryJob(queue, jobId);
  }

  // 🗑 Remove job
  async removeJob(queue: AdminQueueName, jobId: string) {
    return this.queueService.removeJob(queue, jobId);
  }

  // ⏸ Pausar fila
  async pauseQueue(queue: AdminQueueName) {
    return this.queueService.pauseQueue(queue);
  }

  // ▶ Retomar fila
  async resumeQueue(queue: AdminQueueName) {
    return this.queueService.resumeQueue(queue);
  }
}
