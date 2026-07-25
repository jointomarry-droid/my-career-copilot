import { NextResponse } from 'next/server';
import { insertCampaign, getCampaigns, updateCampaignRunCount, getActiveCampaigns } from '../../../lib/mongodb.js';
import { startScheduler, scheduleCampaign, stopCampaign, getSchedulerStatus, CAMPAIGN_PRESETS, validateCron } from '../../../lib/scheduler.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/campaigns
 *
 * List all campaigns for a user, or get scheduler status.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-fiaz-001';
    const action = searchParams.get('action');

    if (action === 'status') {
      return NextResponse.json({
        success: true,
        scheduler: getSchedulerStatus(),
        presets: CAMPAIGN_PRESETS,
      });
    }

    const campaigns = await getCampaigns(userId);

    return NextResponse.json({
      success: true,
      data: campaigns,
      presets: CAMPAIGN_PRESETS,
    });
  } catch (error) {
    console.error('[Campaigns] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/campaigns
 *
 * Create a new campaign and schedule it.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId = 'usr-fiaz-001',
      name,
      preset = 'moderate',
      cron: cronExpression,
      maxApplications,
      delay,
      types = ['scholarship', 'job', 'work_permit'],
      countries = [],
    } = body;

    const presetConfig = CAMPAIGN_PRESETS[preset] || CAMPAIGN_PRESETS.moderate;
    const finalCron = cronExpression || presetConfig.cron;

    if (!validateCron(finalCron)) {
      return NextResponse.json(
        { error: `Invalid cron expression: ${finalCron}` },
        { status: 400 }
      );
    }

    const campaign = await insertCampaign({
      userId,
      name: name || presetConfig.name,
      preset,
      cron: finalCron,
      maxApplications: maxApplications || presetConfig.maxApplicationsPerRun,
      delay: delay || presetConfig.delayBetweenApplications,
      types,
      countries,
      description: presetConfig.description,
    });

    scheduleCampaign(campaign);

    return NextResponse.json({
      success: true,
      message: `Campaign "${campaign.name}" created and scheduled.`,
      data: campaign,
      nextRun: presetConfig.cron,
    });
  } catch (error) {
    console.error('[Campaigns] Create error:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/campaigns
 *
 * Update a campaign's status (pause/resume)
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { campaignId, action } = body;

    if (!campaignId || !action) {
      return NextResponse.json(
        { error: 'Missing campaignId or action' },
        { status: 400 }
      );
    }

    if (action === 'pause') {
      stopCampaign(campaignId);
      return NextResponse.json({
        success: true,
        message: 'Campaign paused.',
      });
    }

    if (action === 'resume') {
      const campaigns = await getActiveCampaigns();
      const campaign = campaigns.find(c => c._id === campaignId);
      if (campaign) {
        scheduleCampaign(campaign);
        return NextResponse.json({
          success: true,
          message: 'Campaign resumed.',
        });
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Campaigns] Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign', details: error.message },
      { status: 500 }
    );
  }
}
