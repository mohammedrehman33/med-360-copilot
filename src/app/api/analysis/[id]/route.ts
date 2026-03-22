import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const analyses = await prisma.analysisResult.findMany({
      where: { prescriptionId: id },
      orderBy: { createdAt: 'asc' },
    });

    if (analyses.length === 0) {
      return NextResponse.json({ error: 'No analysis found' }, { status: 404 });
    }

    // Parse JSON fields
    const parsed = analyses.map((a) => ({
      ...a,
      outputData: a.outputData ? JSON.parse(a.outputData) : null,
      insights: a.insights ? JSON.parse(a.insights) : [],
    }));

    return NextResponse.json({ analyses: parsed });
  } catch (error) {
    console.error('[API /analysis] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}
