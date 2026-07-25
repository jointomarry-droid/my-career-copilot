import { NextResponse } from 'next/server';
import { updateUserProfile, getUserProfile } from '../../../lib/mongodb.js';
import { parseResume, tailorForApplication, generateCoverLetter } from '../../../lib/resume-parser.js';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.pdf'];

function validateFile(file) {
  if (!file) return { valid: false, error: 'No file provided' };

  const name = file.name || '';
  const ext = '.' + name.split('.').pop().toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `Invalid file type "${ext}". Only PDF files are accepted.` };
  }

  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const maxMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    return { valid: false, error: `File too large (${sizeMB}MB). Maximum size is ${maxMB}MB.` };
  }

  return { valid: true };
}

/**
 * POST /api/resume
 *
 * Upload and parse a PDF resume.
 * Extracts structured profile data and optionally updates the user profile.
 */
export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { userId = 'usr-fiaz-001', resumeText, action = 'parse' } = body;

      if (action === 'tailor' && body.opportunity) {
        const profile = await getUserProfile(userId);
        if (!profile) {
          return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }
        const tailored = await tailorForApplication(profile, body.opportunity);
        return NextResponse.json({ success: true, data: tailored });
      }

      if (action === 'cover-letter' && body.opportunity) {
        const profile = await getUserProfile(userId);
        if (!profile) {
          return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
        }
        const letter = await generateCoverLetter(profile, body.opportunity);
        return NextResponse.json({ success: true, data: { coverLetter: letter } });
      }

      if (resumeText) {
        const profile = await parseResume(Buffer.from(resumeText));
        if (body.autoUpdate) {
          await updateUserProfile(userId, profile);
        }
        return NextResponse.json({ success: true, data: profile });
      }

      return NextResponse.json({ error: 'No resume content provided' }, { status: 400 });
    }

    // Form data: PDF upload
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId') || 'usr-fiaz-001';
    const autoUpdate = formData.get('autoUpdate') === 'true';

    // Server-side validation
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Uploaded file is empty' }, { status: 400 });
    }

    const parsed = await parseResume(buffer);

    if (!parsed || !parsed.rawText) {
      return NextResponse.json({ error: 'Could not extract text from PDF. The file may be image-based or corrupted.' }, { status: 422 });
    }

    if (autoUpdate) {
      await updateUserProfile(userId, {
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        email: parsed.email,
        phone: parsed.phone,
        coreStack: parsed.skills.join(', '),
      });
    }

    return NextResponse.json({
      success: true,
      data: parsed,
      fileName: file.name,
      fileSize: buffer.length,
    });
  } catch (error) {
    console.error('[Resume] Error:', error);
    return NextResponse.json(
      { error: 'Resume processing failed', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/resume
 *
 * Get current profile/resume status for a user.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'usr-fiaz-001';

    const profile = await getUserProfile(userId);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('[Resume] Get error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    );
  }
}
