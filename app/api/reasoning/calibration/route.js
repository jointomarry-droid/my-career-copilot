import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { predictions } = await req.json();
    const preds = predictions || [];

    const calibrated = preds.map(p => ({
      ...p,
      reliability: p.confidence > 0.8 ? 'high' : p.confidence > 0.5 ? 'medium' : 'low',
      calibrationScore: Math.abs(p.confidence - (p.actual === p.predicted ? 1 : 0)),
    }));

    const avgCalibration = calibrated.length > 0
      ? (calibrated.reduce((s, p) => s + p.calibrationScore, 0) / calibrated.length).toFixed(3)
      : 0;

    const overconfident = calibrated.filter(p => p.confidence > 0.7 && p.actual !== p.predicted).length;
    const underconfident = calibrated.filter(p => p.confidence < 0.4 && p.actual === p.predicted).length;

    return NextResponse.json({
      success: true,
      data: {
        predictions: calibrated,
        avgCalibrationScore: parseFloat(avgCalibration),
        overconfidenceCount: overconfident,
        underconfidenceCount: underconfident,
        overallBias: overconfident > underconfident ? 'overconfident' : underconfident > overconfident ? 'underconfident' : 'balanced',
        recommendations: [
          overconfident > 2 ? 'You tend to be overconfident on predictions. Consider being more conservative.' : null,
          underconfident > 2 ? 'You underestimate yourself in some areas. Trust your capabilities more.' : null,
          calibrated.length < 5 ? 'Track more predictions to build a meaningful calibration dataset.' : null,
        ].filter(Boolean),
        totalPredictions: calibrated.length,
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
