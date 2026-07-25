/**
 * Agent Orchestrator v2.0
 *
 * Central command tying together:
 *   1. User dossier data
 *   2. LLM-powered form filling
 *   3. Browser pool management
 *   4. Smart deduplication
 *   5. Post-submission tracking
 *   6. Webhook notifications
 *   7. Audit trail logging
 *   8. Email notifications
 */

import { getUserProfile, insertAgentLog, updateApplicationStatus, insertApplication } from './mongodb.js';
import { ScholarshipScoutAgent } from './agents/ScholarshipScout.js';
import { JobHunterAgent } from './agents/JobHunter.js';
import { PermitPathfinderAgent } from './agents/PermitPathfinder.js';
import { InterviewCoachAgent } from './agents/InterviewCoach.js';
import { SeoOptimizerAgent } from './agents/SeoOptimizer.js';
import { notifyApplicationStatus } from './notifier.js';
import { webhooks } from './webhooks.js';
import { auditTrail } from './audit-trail.js';
import { deduplication } from './deduplication.js';
import { postTracker } from './post-tracker.js';
import { resumePipeline } from './resume-pipeline.js';
import { jobQueue } from './job-queue.js';
import { statusChecker } from './status-checker.js';

class Orchestrator {
  constructor() {
    this.agents = {
      scholarship: new ScholarshipScoutAgent(),
      job: new JobHunterAgent(),
      work_permit: new PermitPathfinderAgent(),
      interview: new InterviewCoachAgent(),
      seo: new SeoOptimizerAgent(),
    };
    this.activeJobs = new Map();
    this.metrics = {
      totalDispatched: 0,
      totalCompleted: 0,
      totalFailed: 0,
      totalDeduplicated: 0,
    };
  }

  /**
   * Main entry point to start an application
   */
  async dispatchApply(params) {
    const { userId, type, targetUrl, customData = {} } = params;
    const profile = await getUserProfile(userId);

    if (!profile) {
      throw new Error(`User profile ${userId} not found.`);
    }

    // Smart deduplication check
    if (customData.applicationId || targetUrl) {
      const dupCheck = await deduplication.checkDuplicate({
        url: targetUrl,
        title: customData.position,
        type,
      }, userId);

      if (dupCheck.isDuplicate) {
        this.metrics.totalDeduplicated++;
        console.log(`[Orchestrator] Duplicate detected: ${dupCheck.reason}`);
        await auditTrail.log({
          category: 'application', action: 'duplicated', userId,
          targetType: 'application', targetId: customData.applicationId || 'unknown',
          details: { reason: dupCheck.reason, confidence: dupCheck.confidence },
        });
        return {
          jobId: null,
          status: 'deduplicated',
          reason: dupCheck.reason,
          confidence: dupCheck.confidence,
        };
      }
    }

    const agent = this.agents[type];
    if (!agent) {
      throw new Error(`No agent registered for type: "${type}". Acceptable: scholarship, job, work_permit, interview`);
    }

    // Use persistent job queue instead of in-memory activeJobs
    const jobEntry = await jobQueue.enqueue({
      type,
      userId,
      targetUrl,
      customData,
      title: customData.position || targetUrl,
      handler: async (job) => {
        return this.runJobAsync(job, agent, targetUrl, profile, customData);
      },
    });

    this.metrics.totalDispatched++;

    // Audit trail
    await auditTrail.agentLaunched(userId, agent.name, targetUrl);

    // Log to telemetry database
    await insertAgentLog({
      jobId: jobEntry._id,
      type,
      userId,
      status: 'launched',
      msg: `${agent.name} starting automation sequence for target ${targetUrl}`,
    });

    // Process queue
    jobQueue.processNext().catch(err => {
      console.error(`[Orchestrator] Queue processing error:`, err);
    });

    return { jobId: jobEntry._id, status: 'queued' };
  }

  async runJobAsync(job, agent, targetUrl, profile, customData) {
    try {
      // Run resume tailoring pipeline before applying
      let tailoredResume = null;
      try {
        tailoredResume = await resumePipeline.tailor(profile._id, {
          title: customData.position || 'Unknown',
          institution: customData.institution || '',
          country: customData.country || '',
          type: job.type,
          url: targetUrl,
          description: customData.description || '',
          requirements: customData.requirements || '',
        });
        console.log(`[Orchestrator] Resume tailored: ${tailoredResume.analysis.matchScore}% match`);
      } catch (resumeError) {
        console.warn(`[Orchestrator] Resume tailoring failed:`, resumeError.message);
      }

      const result = await agent.apply(targetUrl, { ...profile, ...customData, tailoredResume });

      this.metrics.totalCompleted++;

      // Audit trail
      await auditTrail.agentCompleted(profile._id, agent.name, result);

      await insertAgentLog({
        jobId: job._id,
        type: agent.name,
        userId: profile._id,
        status: 'completed',
        msg: `Successfully processed ${result.fieldsProcessed} fields via ${agent.name}`,
      });

      if (customData.applicationId) {
        await updateApplicationStatus(customData.applicationId, 'Submitted', 100);

        // Post-submission tracking
        postTracker.track({
          _id: customData.applicationId,
          title: customData.position || 'Application',
          url: targetUrl,
          status: 'Submitted',
        });

        // Email notification
        try {
          await notifyApplicationStatus(profile.email, {
            title: customData.position || 'Application',
            institution: '',
            country: '',
            type: agent.name,
            agent: agent.name,
            progress: 100,
            matchScore: 100,
          }, 'In Progress', 'Submitted');
        } catch (e) {
          console.error('[Orchestrator] Email notification failed:', e.message);
        }

        // Webhook notification
        await webhooks.notify({
          type: 'application.submitted',
          details: {
            title: customData.position || 'Application',
            institution: '',
            country: '',
            agent: agent.name,
            jobId: job._id,
          },
        });

        // Audit trail
        await auditTrail.applicationSubmitted(profile._id, {
          _id: customData.applicationId,
          title: customData.position,
          agent: agent.name,
        });
      }

      return result;
    } catch (error) {
      this.activeJobs.set(job._id, { status: 'error', error: error.message });
      this.metrics.totalFailed++;

      await insertAgentLog({
        jobId: job._id,
        type: agent.name,
        userId: profile._id,
        status: 'error',
        msg: `Application failed: ${error.message}`,
      });

      // Audit trail
      await auditTrail.applicationFailed(profile._id, {
        _id: customData.applicationId || job._id,
        title: customData.position || 'Unknown',
      }, error);

      // Webhook notification
      await webhooks.notify({
        type: 'application.failed',
        details: {
          title: customData.position || 'Application',
          error: error.message,
          agent: agent.name,
        },
      });

      if (customData.applicationId) {
        await updateApplicationStatus(customData.applicationId, 'Failed', 0);

        try {
          await notifyApplicationStatus(profile.email, {
            title: customData.position || 'Application',
            institution: '',
            country: '',
            type: agent.name,
            agent: agent.name,
            progress: 0,
            matchScore: 0,
          }, 'In Progress', 'Failed');
        } catch (e) {
          console.error('[Orchestrator] Email notification failed:', e.message);
        }
      }
    }
  }

  getJobStatus(jobId) {
    return this.activeJobs.get(jobId) || null;
  }

  getMetrics() {
    return {
      ...this.metrics,
      activeJobs: this.activeJobs.size,
      queueStats: jobQueue.getStats(),
      successRate: this.metrics.totalDispatched > 0
        ? Math.round((this.metrics.totalCompleted / this.metrics.totalDispatched) * 100)
        : 0,
    };
  }

  /**
   * Check status of all submitted applications
   */
  async checkApplicationStatuses() {
    const { getApplications } = await import('./mongodb.js');
    const submittedApps = await getApplications({ status: 'Submitted' });
    if (!submittedApps || submittedApps.length === 0) return [];

    const results = await statusChecker.checkBatch(submittedApps, 2);
    console.log(`[Orchestrator] Status check complete: ${results.length} applications checked`);
    return results;
  }

  /**
   * Generate interview preparation package
   */
  async prepareInterview(userId, opportunity) {
    const profile = await getUserProfile(userId);
    if (!profile) throw new Error(`Profile ${userId} not found`);

    const interviewPackage = await this.agents.interview.prepareInterview(profile, opportunity);

    await auditTrail.log({
      category: 'interview',
      action: 'prepared',
      userId,
      targetType: 'interview_prep',
      targetId: opportunity.title,
      details: { questionsCount: interviewPackage.questions.length },
    });

    return interviewPackage;
  }
}

export const orchestrator = new Orchestrator();
export default Orchestrator;
