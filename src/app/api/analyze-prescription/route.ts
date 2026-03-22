import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { runPrescriptionPipeline } from '@/lib/agents/orchestrator';
import type { PipelineState, ExtractedMedicine } from '@/types';
import { readFile } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prescriptionId, manualMedicines } = body as {
      prescriptionId?: string;
      manualMedicines?: ExtractedMedicine[];
    };

    let prescriptionImage: string | undefined;
    let imageMediaType: string | undefined;
    let rxId = prescriptionId || `manual-${Date.now()}`;

    // If prescription ID provided, load the image
    if (prescriptionId) {
      const prescription = await prisma.prescription.findUnique({
        where: { id: prescriptionId },
      });

      if (!prescription) {
        return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
      }

      // Update status to analyzing
      await prisma.prescription.update({
        where: { id: prescriptionId },
        data: { status: 'analyzing' },
      });

      // Load image as base64
      const absolutePath = path.join(process.cwd(), 'public', prescription.filePath);
      const fileBuffer = await readFile(absolutePath);
      prescriptionImage = fileBuffer.toString('base64');
      imageMediaType = prescription.fileType;
    }

    // Run the full pipeline
    let finalState: PipelineState | null = null;

    const result = await runPrescriptionPipeline(
      {
        prescriptionId: rxId,
        prescriptionImage,
        imageMediaType,
        manualMedicines,
      },
      (state: PipelineState) => {
        finalState = state;
        console.log(`[Pipeline] ${state.currentAgent} — Status: ${state.status}`);
      }
    );

    // Save analysis results to DB
    if (prescriptionId) {
      const agentNames = ['ocr', 'drugKnowledge', 'dosage', 'interaction', 'alternative', 'patientGuide'] as const;
      for (const agentKey of agentNames) {
        const agentResult = result.agents[agentKey];
        if (agentResult) {
          await prisma.analysisResult.create({
            data: {
              prescriptionId,
              type: agentKey,
              agentName: agentResult.agentName,
              status: agentResult.status === 'success' ? 'completed' : 'failed',
              outputData: JSON.stringify(agentResult.data),
              insights: JSON.stringify(agentResult.insights),
              completedAt: new Date(),
            },
          });
        }
      }

      // Update prescription status
      await prisma.prescription.update({
        where: { id: prescriptionId },
        data: {
          status: result.status === 'completed' ? 'completed' : 'failed',
          parsedMedicines: result.agents.ocr?.data?.medicines
            ? JSON.stringify(result.agents.ocr.data.medicines)
            : null,
        },
      });
    }

    return NextResponse.json({ pipeline: result });
  } catch (error) {
    console.error('[API /analyze-prescription] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
