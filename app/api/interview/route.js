import { NextResponse } from 'next/server';
import { orchestrator } from '../../../lib/orchestrator.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { profileId, opportunity } = body;

    if (!profileId || !opportunity) {
      return NextResponse.json({
        success: false,
        error: 'profileId and opportunity are required',
      }, { status: 400 });
    }

    const interviewPackage = await orchestrator.prepareInterview(profileId, opportunity);

    return NextResponse.json({
      success: true,
      data: interviewPackage,
    });
  } catch (error) {
    console.error('[Interview API] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}