import { NextResponse } from 'next/server';
import { orchestrator } from '../../../../lib/orchestrator.js';
import { getUserProfile } from '../../../../lib/mongodb.js';
import { insertAgentLog } from '../../../../lib/mongodb.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { profileId, targetJobDescription, optimizationType } = body;

    if (!profileId) {
      return NextResponse.json({
        success: false,
        error: 'profileId is required',
      }, { status: 400 });
    }

    const profile = await getUserProfile(profileId);
    if (!profile) {
      return NextResponse.json({
        success: false,
        error: `Profile ${profileId} not found`,
      }, { status: 404 });
    }

    const { SeoOptimizerAgent } = await import('../../../../lib/agents/SeoOptimizer.js');
    const agent = new SeoOptimizerAgent();

    const results = await agent.optimizeProfile(profile, {
      targetJobDescription,
      optimizationType: optimizationType || 'full',
    });

    await insertAgentLog({
      type: 'seo_optimization',
      status: 'completed',
      msg: `[SeoOptimizer] Profile optimized: ${results.overallScore}/100 (${results.grade})`,
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('[SEO Optimize API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
