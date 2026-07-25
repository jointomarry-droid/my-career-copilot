import { NextResponse } from 'next/server';
import { calculateVisaProbability, batchVisaScore } from '../../../lib/visa-scorer.js';
import { getUserProfile } from '../../../lib/mongodb.js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/visa
 * Calculate visa probability for a country
 *
 * Body:
 *   country: string (e.g., "germany", "netherlands", "canada")
 *   visaType: string (optional)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { country, visaType, userId = 'usr-fiaz-001' } = body;

    if (!country) {
      return NextResponse.json({ error: 'country is required' }, { status: 400 });
    }

    const profile = await getUserProfile(userId);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const result = calculateVisaProbability(profile, country, visaType);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[Visa] Error:', error);
    return NextResponse.json({ error: 'Visa scoring failed', details: error.message }, { status: 500 });
  }
}

/**
 * GET /api/visa
 * Get batch visa scores for all supported countries
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-fiaz-001';

    const profile = await getUserProfile(userId);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const countries = ['germany', 'netherlands', 'switzerland', 'uk', 'canada', 'australia'];
    const results = batchVisaScore(profile, countries);

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error('[Visa] Error:', error);
    return NextResponse.json({ error: 'Visa scoring failed', details: error.message }, { status: 500 });
  }
}
