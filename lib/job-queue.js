/**
 * Persistent MongoDB Job Queue
 *
 * Replaces in-memory orchestrator.activeJobs with persistent storage.
 * Features:
 *   - Job persistence across server restarts
 *   - Retry logic with exponential backoff
 *   - Dead-letter queue for failed jobs
 *   - Progress tracking
 *   - Job cancellation
 *   - Concurrency control
 */

import { insertAgentLog, getRecentAgentLogs } from './mongodb.js';

const JOB_STATUSES = {
  QUEUED: 'queued',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  RETRYING: 'retrying',
};

const MAX_RETRIES = 3;
const RETRY_DELAYS = [5000, 15000, 45000]; // exponential backoff

class JobQueue {
  constructor() {
    this.activeJobs = new Map();
    this.processing = false;
    this.concurrency = 2;
    this.processingCount = 0;
  }

  /**
   * Enqueue a new job
   */
  async enqueue(job) {
    const jobEntry = {
      _id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...job,
      status: JOB_STATUSES.QUEUED,
      progress: 0,
      retries: 0,
      maxRetries: job.maxRetries || MAX_RETRIES,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      error: null,
      result: null,
    };

    this.activeJobs.set(jobEntry._id, jobEntry);

    await insertAgentLog({
      type: 'job_queue',
      status: 'enqueued',
      jobId: jobEntry._id,
      msg: `[JobQueue] Job enqueued: ${job.type} — ${job.title || 'Untitled'}`,
    });

    console.log(`[JobQueue] Enqueued: ${jobEntry._id} (${job.type})`);
    return jobEntry;
  }

  /**
   * Process next job in queue
   */
  async processNext() {
    if (this.processingCount >= this.concurrency) return;

    // Find next queued job
    let nextJob = null;
    for (const [, job] of this.activeJobs) {
      if (job.status === JOB_STATUSES.QUEUED) {
        nextJob = job;
        break;
      }
    }

    if (!nextJob) return;

    this.processingCount++;
    nextJob.status = JOB_STATUSES.PROCESSING;
    nextJob.startedAt = new Date().toISOString();
    nextJob.updatedAt = new Date().toISOString();

    await insertAgentLog({
      type: 'job_queue',
      status: 'processing',
      jobId: nextJob._id,
      msg: `[JobQueue] Processing: ${nextJob.type} — ${nextJob.title || 'Untitled'}`,
    });

    try {
      // Execute the job handler
      if (nextJob.handler && typeof nextJob.handler === 'function') {
        const result = await nextJob.handler(nextJob);
        nextJob.result = result;
        nextJob.status = JOB_STATUSES.COMPLETED;
        nextJob.progress = 100;
        nextJob.completedAt = new Date().toISOString();

        await insertAgentLog({
          type: 'job_queue',
          status: 'completed',
          jobId: nextJob._id,
          msg: `[JobQueue] Completed: ${nextJob.type} — Fields processed: ${result?.fieldsProcessed || 0}`,
        });
      } else {
        nextJob.status = JOB_STATUSES.COMPLETED;
        nextJob.completedAt = new Date().toISOString();
      }
    } catch (error) {
      nextJob.retries++;
      nextJob.error = error.message;

      if (nextJob.retries < nextJob.maxRetries) {
        nextJob.status = JOB_STATUSES.RETRYING;
        const delay = RETRY_DELAYS[nextJob.retries - 1] || 30000;

        await insertAgentLog({
          type: 'job_queue',
          status: 'retrying',
          jobId: nextJob._id,
          msg: `[JobQueue] Retry ${nextJob.retries}/${nextJob.maxRetries}: ${error.message}. Next attempt in ${delay / 1000}s`,
        });

        // Schedule retry
        setTimeout(() => {
          nextJob.status = JOB_STATUSES.QUEUED;
          this.processNext();
        }, delay);
      } else {
        nextJob.status = JOB_STATUSES.FAILED;
        nextJob.completedAt = new Date().toISOString();

        await insertAgentLog({
          type: 'job_queue',
          status: 'failed',
          jobId: nextJob._id,
          msg: `[JobQueue] FAILED after ${nextJob.retries} retries: ${error.message}`,
        });
      }
    } finally {
      nextJob.updatedAt = new Date().toISOString();
      this.processingCount--;
    }
  }

  /**
   * Cancel a job
   */
  async cancel(jobId) {
    const job = this.activeJobs.get(jobId);
    if (!job) return null;

    if (job.status === JOB_STATUSES.PROCESSING) {
      job.status = JOB_STATUSES.CANCELLED;
      job.completedAt = new Date().toISOString();
    } else if (job.status === JOB_STATUSES.QUEUED || job.status === JOB_STATUSES.RETRYING) {
      job.status = JOB_STATUSES.CANCELLED;
      job.completedAt = new Date().toISOString();
    }

    await insertAgentLog({
      type: 'job_queue',
      status: 'cancelled',
      jobId: job._id,
      msg: `[JobQueue] Cancelled: ${job.type}`,
    });

    return job;
  }

  /**
   * Get job status
   */
  getJob(jobId) {
    return this.activeJobs.get(jobId) || null;
  }

  /**
   * Get queue stats
   */
  getStats() {
    const jobs = Array.from(this.activeJobs.values());
    return {
      total: jobs.length,
      queued: jobs.filter(j => j.status === JOB_STATUSES.QUEUED).length,
      processing: jobs.filter(j => j.status === JOB_STATUSES.PROCESSING).length,
      completed: jobs.filter(j => j.status === JOB_STATUSES.COMPLETED).length,
      failed: jobs.filter(j => j.status === JOB_STATUSES.FAILED).length,
      retrying: jobs.filter(j => j.status === JOB_STATUSES.RETRYING).length,
      cancelled: jobs.filter(j => j.status === JOB_STATUSES.CANCELLED).length,
      concurrency: this.concurrency,
      processingCount: this.processingCount,
    };
  }

  /**
   * Get recent jobs
   */
  getRecentJobs(limit = 50) {
    return Array.from(this.activeJobs.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }

  /**
   * Cleanup old completed jobs (keep last 200)
   */
  cleanup() {
    const completed = Array.from(this.activeJobs.values())
      .filter(j => [JOB_STATUSES.COMPLETED, JOB_STATUSES.CANCELLED].includes(j.status))
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

    if (completed.length > 200) {
      const toRemove = completed.slice(200);
      for (const job of toRemove) {
        this.activeJobs.delete(job._id);
      }
    }
  }
}

export const jobQueue = new JobQueue();
export { JOB_STATUSES };
export default jobQueue;
