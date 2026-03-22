import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { patientGuideAgent } from '@/lib/agents/patient-guide-agent';
import { MEDICAL_DISCLAIMER } from '@/lib/constants';
import type { DrugInfo, DosageInterpretation } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { prescriptionId, medicines } = (await req.json()) as {
      prescriptionId?: string;
      medicines?: Array<{ brandName: string; dosage: string; frequency: string }>;
    };

    let drugInfos: DrugInfo[] = [];
    const dosageInterpretations: DosageInterpretation[] = [];

    if (prescriptionId) {
      // Load from existing analysis
      const analyses = await prisma.analysisResult.findMany({
        where: { prescriptionId },
      });

      const drugAnalysis = analyses.find((a) => a.type === 'drugKnowledge');
      if (drugAnalysis?.outputData) {
        const parsed = JSON.parse(drugAnalysis.outputData);
        drugInfos = parsed.drugs || [];
      }

      const dosageAnalysis = analyses.find((a) => a.type === 'dosage');
      if (dosageAnalysis?.outputData) {
        const parsed = JSON.parse(dosageAnalysis.outputData);
        dosageInterpretations.push(...(parsed.interpretations || []));
      }
    } else if (medicines) {
      // Build drug info from manual input
      for (const med of medicines) {
        const drug = await prisma.drug.findFirst({
          where: { brandName: { contains: med.brandName } },
        });

        drugInfos.push({
          brandName: med.brandName,
          saltComposition: drug?.saltComposition || 'Unknown',
          drugClass: drug?.drugClass || 'Unknown',
          mechanism: drug?.mechanism || '',
          standardDosage: drug?.standardDosage || '',
          sideEffects: drug?.sideEffects ? JSON.parse(drug.sideEffects) : [],
          contraindications: drug?.contraindications ? JSON.parse(drug.contraindications) : [],
          foodInteractions: drug?.foodInteractions ? JSON.parse(drug.foodInteractions) : [],
        });

        dosageInterpretations.push({
          original: `${med.brandName} ${med.dosage} ${med.frequency}`,
          plainLanguage: `Take ${med.brandName} ${med.dosage} ${med.frequency}`,
          isWithinRange: true,
          warnings: [],
        });
      }
    }

    if (drugInfos.length === 0) {
      return NextResponse.json({ error: 'No medicines found to generate guide' }, { status: 400 });
    }

    const result = await patientGuideAgent.generate(drugInfos, dosageInterpretations);

    // Save guides to DB if prescription exists
    if (prescriptionId && result.status === 'success') {
      const guides = (result.data?.guides as Array<{ medicineName: string; saltName: string; howToTake: string; dos: string[]; donts: string[]; commonSideEffects: string[]; whenToCallDoctor: string[] }>) || [];
      for (const guide of guides) {
        await prisma.medicationGuide.create({
          data: {
            prescriptionId,
            medicineName: guide.medicineName,
            saltName: guide.saltName,
            instructions: guide.howToTake,
            dosList: JSON.stringify(guide.dos),
            dontsList: JSON.stringify(guide.donts),
            sideEffects: JSON.stringify(guide.commonSideEffects),
            whenToCallDoc: JSON.stringify(guide.whenToCallDoctor),
            disclaimer: MEDICAL_DISCLAIMER,
          },
        });
      }
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('[API /generate-guide] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Guide generation failed' },
      { status: 500 }
    );
  }
}
