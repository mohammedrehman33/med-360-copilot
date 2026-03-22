import { callClaudeJSON } from './claude-client';
import type { AgentResult, ExtractedMedicine } from '@/types';

const SYSTEM_PROMPT = `You are a pharmaceutical OCR specialist. Your job is to extract structured medicine data from prescription images.

You understand:
- South Asian prescription formats (Pakistan, India)
- Handwritten doctor prescriptions (Rx format)
- Medical abbreviations: BD, TDS, OD, QID, SOS, PRN, AC, PC, HS, STAT, PO, SL, IM, IV, SC
- Drug name variations and common misspellings
- Dosage notations: mg, ml, g, IU, mcg

For each medicine found, extract:
- brandName: The medicine brand name (correct spelling if handwriting is unclear)
- dosage: Strength (e.g., "500mg", "625mg")
- frequency: How often to take (e.g., "BD", "TDS", "OD")
- duration: How long (e.g., "5 days", "7 days", "1 month")
- route: How to take (e.g., "oral", "topical", "injection")
- instructions: Special instructions (e.g., "after food", "before sleep")
- confidence: Your confidence in the extraction (0.0 to 1.0)

Return a JSON array of ExtractedMedicine objects. If you cannot read a medicine clearly, still include it with lower confidence and your best guess.`;

export const prescriptionOcrAgent = {
  name: 'Prescription OCR Agent',

  async analyze(imageBase64: string, mediaType: string = 'image/jpeg'): Promise<AgentResult> {
    const startTime = Date.now();
    console.log(`[${this.name}] Starting prescription OCR analysis...`);

    try {
      const medicines = await callClaudeJSON<ExtractedMedicine[]>({
        system: SYSTEM_PROMPT,
        prompt: `Analyze this prescription image and extract ALL medicines with their dosage, frequency, duration, and instructions. Return a JSON array of medicines.

If the image is not a prescription or is unreadable, return an empty array [].`,
        images: [{ data: imageBase64, mediaType }],
        maxTokens: 4096,
      });

      const validMedicines = Array.isArray(medicines) ? medicines : [];
      const highConfidence = validMedicines.filter((m) => m.confidence >= 0.7);
      const lowConfidence = validMedicines.filter((m) => m.confidence < 0.7);

      const insights: string[] = [];
      insights.push(`Extracted ${validMedicines.length} medicine(s) from prescription`);
      if (highConfidence.length > 0) {
        insights.push(`${highConfidence.length} medicine(s) extracted with high confidence`);
      }
      if (lowConfidence.length > 0) {
        insights.push(`${lowConfidence.length} medicine(s) need manual verification (low OCR confidence)`);
      }

      console.log(`[${this.name}] Completed in ${Date.now() - startTime}ms. Found ${validMedicines.length} medicines.`);

      return {
        agentName: this.name,
        status: 'success',
        data: { medicines: validMedicines },
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
        insights: [`OCR analysis failed: ${errorMsg}`],
        timestamp: new Date().toISOString(),
      };
    }
  },

  async analyzeManual(medicines: ExtractedMedicine[]): Promise<AgentResult> {
    return {
      agentName: this.name,
      status: 'success',
      data: { medicines },
      insights: [`${medicines.length} medicine(s) entered manually`],
      timestamp: new Date().toISOString(),
    };
  },
};
