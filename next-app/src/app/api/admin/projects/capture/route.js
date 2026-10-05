import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Portfolio from '@/models/Portfolio';
import { requireAdmin } from '@/lib/auth';
import { validateSafeProjectUrl, captureProjectVisualServerSide } from '@/lib/projectVisualCapture';
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  try {
    await connectDB();

    const authResult = await requireAdmin(request);
    if (authResult.error) {
      return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }

    const body = await request.json();
    const { projectId, url } = body;

    if (!projectId || !url) {
      return NextResponse.json(
        { message: 'projectId and url are required' },
        { status: 400 }
      );
    }

    // SSRF-Protected validation
    const validation = await validateSafeProjectUrl(url);
    if (!validation.ok) {
      return NextResponse.json(
        { message: `Invalid or unsafe project URL: ${validation.reason}` },
        { status: 422 }
      );
    }

    // Server-side controlled capture execution
    const captureResult = await captureProjectVisualServerSide(validation.cleanUrl);

    if (!captureResult.success) {
      return NextResponse.json(
        { message: `Capture failed: ${captureResult.error || 'Server unreachable'}` },
        { status: 502 }
      );
    }

    // Update MongoDB Portfolio project document
    const portfolio = await Portfolio.findOne({});
    if (!portfolio || !portfolio.projects) {
      return NextResponse.json({ message: 'Portfolio projects not found' }, { status: 404 });
    }

    const projectIndex = portfolio.projects.findIndex(
      (p) => String(p.id) === String(projectId) || String(p._id) === String(projectId)
    );

    if (projectIndex === -1) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Set authoritative live visual metadata
    portfolio.projects[projectIndex].livePreviewImageUrl = validation.cleanUrl;
    portfolio.projects[projectIndex].visualSource = 'live-capture';
    portfolio.projects[projectIndex].visualCapturedAt = new Date();

    await portfolio.save();

    try {
      revalidatePath('/', 'page');
      revalidatePath('/api/portfolio');
    } catch (e) {
      console.warn('[ProjectCapture] revalidatePath warning:', e.message);
    }

    return NextResponse.json({
      message: 'Live project visual captured and saved successfully',
      project: portfolio.projects[projectIndex],
    });
  } catch (err) {
    console.error('[ProjectCapture POST]', err.message);
    return NextResponse.json(
      { message: 'Internal server error during visual capture' },
      { status: 500 }
    );
  }
}
