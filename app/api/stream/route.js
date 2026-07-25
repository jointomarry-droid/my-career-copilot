import { getRecentAgentLogs } from '../../../lib/mongodb.js';

export const dynamic = 'force-dynamic';

/**
 * GET /api/stream
 *
 * Server-Sent Events endpoint for real-time agent telemetry.
 */
export async function GET(request) {
  const encoder = new TextEncoder();
  let pollCount = 0;
  const maxPolls = 100;
  let intervalId = null;
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const safeEnqueue = (data) => {
        if (!closed) {
          try { controller.enqueue(encoder.encode(data)); } catch (e) {}
        }
      };

      safeEnqueue(`data: ${JSON.stringify({ type: 'connected', message: 'SSE stream connected', timestamp: new Date().toISOString() })}\n\n`);

      const recentLogs = await getRecentAgentLogs(20);
      for (const log of recentLogs) {
        safeEnqueue(`data: ${JSON.stringify({ type: 'log', ...log })}\n\n`);
      }

      let lastTimestamp = recentLogs.length > 0 ? recentLogs[0].timestamp : new Date().toISOString();

      intervalId = setInterval(async () => {
        try {
          pollCount++;
          if (pollCount >= maxPolls) {
            clearInterval(intervalId);
            safeEnqueue(`data: ${JSON.stringify({ type: 'stream_ended', message: 'Stream timeout reached' })}\n\n`);
            closed = true;
            try { controller.close(); } catch (e) {}
            return;
          }

          const logs = await getRecentAgentLogs(5);
          const newLogs = logs.filter(l => l.timestamp > lastTimestamp);

          if (newLogs.length > 0) {
            lastTimestamp = newLogs[0].timestamp;
            for (const log of newLogs) {
              safeEnqueue(`data: ${JSON.stringify({ type: 'log', ...log })}\n\n`);
            }
          }

          safeEnqueue(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: new Date().toISOString(), pollCount })}\n\n`);
        } catch (err) {
          console.error('[SSE] Poll error:', err.message);
        }
      }, 3000);
    },
    cancel() {
      if (intervalId) clearInterval(intervalId);
      closed = true;
    },
  });

  request.signal?.addEventListener('abort', () => {
    if (intervalId) clearInterval(intervalId);
    closed = true;
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
