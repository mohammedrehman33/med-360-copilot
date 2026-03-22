import { callClaudeJSON } from './claude-client';
import { MEDICAL_DISCLAIMER } from '@/lib/constants';
import type { AgentResult, DrugInfo, DosageInterpretation, PatientGuide } from '@/types';

const SYSTEM_PROMPT = `You are a patient education pharmacist. Create clear, simple medication guides that patients can understand.

Write at a 6th grade reading level. Use simple Urdu/English bilingual-friendly language.

For each medicine, generate:
- medicineName: Brand name
- saltName: Active ingredient
- whatItDoes: Simple 1-sentence explanation of why this medicine is prescribed
- howToTake: Clear timing instructions (e.g., "Take 1 tablet at 8 AM and 8 PM with food")
- dos: Array of things the patient SHOULD do
- donts: Array of things the patient should NOT do
- commonSideEffects: Array of common side effects (things that might happen but are usually not serious)
- seriousSideEffects: Array of serious side effects (things that need immediate medical attention)
- whenToCallDoctor: Array of specific situations when to contact doctor immediately
- foodInteractions: Array of food/drink to avoid or take with
- disclaimer: Standard medical disclaimer

Be specific with timings. Say "8 AM and 8 PM" not just "twice a day". Be practical and actionable.`;

export const patientGuideAgent = {
  name: 'Patient Guide Agent',

  async generate(
    drugInfos: DrugInfo[],
    dosageInterpretations: DosageInterpretation[]
  ): Promise<AgentResult> {
    const startTime = Date.now();
    console.log(`[${this.name}] Generating patient guides for ${drugInfos.length} medicine(s)...`);

    try {
      const medDetails = drugInfos.map((drug, idx) => ({
        brandName: drug.brandName,
        salt: drug.saltComposition,
        drugClass: drug.drugClass,
        sideEffects: drug.sideEffects,
        contraindications: drug.contraindications,
        foodInteractions: drug.foodInteractions,
        dosageInstruction: dosageInterpretations[idx]?.plainLanguage || 'As prescribed by doctor',
      }));

      const guides = await callClaudeJSON<PatientGuide[]>({
        system: SYSTEM_PROMPT,
        prompt: `Generate patient-friendly medication guides for these medicines:

${JSON.stringify(medDetails, null, 2)}

Return a JSON array of PatientGuide objects. Each guide must include the disclaimer: "${MEDICAL_DISCLAIMER}"`,
        maxTokens: 8192,
      });

      const validGuides = Array.isArray(guides) ? guides : [];

      // Ensure disclaimer is present
      for (const guide of validGuides) {
        if (!guide.disclaimer) {
          guide.disclaimer = MEDICAL_DISCLAIMER;
        }
      }

      const insights: string[] = [];
      insights.push(`Generated ${validGuides.length} patient medication guide(s)`);
      for (const guide of validGuides) {
        insights.push(`${guide.medicineName}: ${guide.dos.length} do's, ${guide.donts.length} don'ts, ${guide.commonSideEffects.length} common side effects`);
      }

      console.log(`[${this.name}] Completed in ${Date.now() - startTime}ms.`);

      return {
        agentName: this.name,
        status: 'success',
        data: { guides: validGuides },
        insights,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[${this.name}] Failed:`, errorMsg);
      return {
        agentName: this.name,
        status: 'error',
        data: { error: errorMsg },
        insights: [`Patient guide generation failed: ${errorMsg}`],
        timestamp: new Date().toISOString(),
      };
    }
  },
};
