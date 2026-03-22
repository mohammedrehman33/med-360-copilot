import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { labReportAgent } from '@/lib/agents/lab-report-agent';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const userId = (formData.get('userId') as string) || 'default-user';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Save file
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', userId, 'lab-reports');
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Create lab report record
    const labReport = await prisma.labReport.create({
      data: {
        userId,
        fileName: file.name,
        filePath: `/uploads/${userId}/lab-reports/${fileName}`,
        fileType: file.type,
        status: 'analyzing',
      },
    });

    // Ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: `${userId}@pharmamind.local` },
    });

    // Analyze the lab report
    const imageBase64 = buffer.toString('base64');
    const result = await labReportAgent.analyze(imageBase64, file.type);

    // Update lab report with results
    await prisma.labReport.update({
      where: { id: labReport.id },
      data: {
        status: result.status === 'success' ? 'completed' : 'failed',
        parsedResults: result.data?.analysis ? JSON.stringify((result.data.analysis as Record<string, unknown>).values) : null,
        abnormalValues: result.data?.analysis ? JSON.stringify((result.data.analysis as Record<string, unknown>).abnormalFindings) : null,
        recommendations: result.data?.analysis ? JSON.stringify((result.data.analysis as Record<string, unknown>).lifestyleRecommendations) : null,
      },
    });

    return NextResponse.json({ labReport, analysis: result });
  } catch (error) {
    console.error('[API /lab-reports] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lab report analysis failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const reports = await prisma.labReport.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lab reports' }, { status: 500 });
  }
}
