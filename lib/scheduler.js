/**
 * Cron-based Auto-Scheduler
 */

import cron from 'node-cron';
import { getActiveCampaigns, updateCampaignRunCount, getUserApplications } from './mongodb.js';
import { orchestrator } from './orchestrator.js';

const activeCronJobs = new Map();
let schedulerRunning = false;

export const CAMPAIGN_PRESETS = {
  aggressive: { name: 'Aggressive', cron: '0 */4 * * *', maxApplicationsPerRun: 10, delayBetweenApplications: 2000, description: 'Every 4 hours, 10 apps/run' },
  moderate: { name: 'Moderate', cron: '0 9,18 * * *', maxApplicationsPerRun: 5, delayBetweenApplications: 5000, description: 'Twice daily, 5 apps/run' },
  conservative: { name: 'Conservative', cron: '0 10 * * 1-5', maxApplicationsPerRun: 3, delayBetweenApplications: 10000, description: 'Weekdays at 10AM, 3 apps/run' },
  discovery: { name: 'Discovery Only', cron: '0 8 * * *', maxApplicationsPerRun: 0, delayBetweenApplications: 0, description: 'Daily scan, no applications' },
  weekly: { name: 'Weekly Sweep', cron: '0 9 * * 1', maxApplicationsPerRun: 15, delayBetweenApplications: 3000, description: 'Mondays at 9AM, 15 apps/run' },
};

export async function startScheduler() {
  if (schedulerRunning) return;
  schedulerRunning = true;
  const campaigns = await getActiveCampaigns();
  for (const campaign of campaigns) scheduleCampaign(campaign);
  console.log(`[Scheduler] Loaded ${campaigns.length} campaigns.`);
}

export function scheduleCampaign(campaign) {
  if (!campaign.cron || !cron.validate(campaign.cron)) return;
  if (activeCronJobs.has(campaign._id)) activeCronJobs.get(campaign._id).stop();

  const job = cron.schedule(campaign.cron, async () => {
    await executeCampaign(campaign);
  }, { scheduled: true, timezone: 'Europe/Amsterdam' });

  activeCronJobs.set(campaign._id, job);
}

async function executeCampaign(campaign) {
  try {
    await updateCampaignRunCount(campaign._id);
    const preset = CAMPAIGN_PRESETS[campaign.preset] || CAMPAIGN_PRESETS.moderate;
    const maxApps = campaign.maxApplications || preset.maxApplicationsPerRun;
    const delay = campaign.delay || preset.delayBetweenApplications;

    const apps = await getUserApplications(campaign.userId);
    const pending = apps.filter(a => a.status === 'Queued' || a.status === 'In Progress').slice(0, maxApps);

    for (let i = 0; i < pending.length; i++) {
      const app = pending[i];
      try {
        await orchestrator.dispatchApply({
          userId: campaign.userId,
          type: app.type?.toLowerCase().replace(' ', '_') || 'job',
          targetUrl: app.url,
          customData: { position: app.title, applicationId: app._id, campaignId: campaign._id },
        });
      } catch (err) {
        console.error(`[Scheduler] Failed: ${app.title}`, err.message);
      }
      if (delay > 0 && i < pending.length - 1) await new Promise(r => setTimeout(r, delay));
    }
  } catch (err) {
    console.error('[Scheduler] Campaign error:', err.message);
  }
}

export function stopCampaign(campaignId) {
  const job = activeCronJobs.get(campaignId);
  if (job) { job.stop(); activeCronJobs.delete(campaignId); return true; }
  return false;
}

export function stopAll() {
  for (const [, job] of activeCronJobs) job.stop();
  activeCronJobs.clear();
  schedulerRunning = false;
}

export function getSchedulerStatus() {
  return { running: schedulerRunning, activeJobs: activeCronJobs.size, campaigns: Array.from(activeCronJobs.keys()) };
}

export function validateCron(expression) { return cron.validate(expression); }

export function getNextRun(expression) {
  const parts = expression.split(' ');
  if (parts.length !== 5) return 'Unknown';
  const [min, hour, , , dow] = parts;
  if (min === '*' && hour === '*') return 'Every minute';
  if (min.startsWith('*/')) return `Every ${min.slice(2)} minutes`;
  if (hour.startsWith('*/')) return `Every ${hour.slice(2)} hours`;
  if (dow === '1-5') return `Weekdays at ${hour}:${min.padStart(2, '0')}`;
  if (dow === '1') return `Mondays at ${hour}:${min.padStart(2, '0')}`;
  return `Daily at ${hour}:${min.padStart(2, '0')}`;
}
