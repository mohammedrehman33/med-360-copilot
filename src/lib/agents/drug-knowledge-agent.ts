import { callClaudeJSON } from './claude-client';
import type { AgentResult, ExtractedMedicine, DrugInfo } from '@/types';

const SYSTEM_PROMPT = `You are an expert clinical pharmacologist. Given medicine names, provide accurate pharmacological information.

For each medicine, return:
- brandName: The brand name
- saltComposition: Active ingredient(s) / salt(s) with correct chemical names
- drugClass: Pharmacological class (e.g., "Antibiotic - Penicillin", "NSAID", "PPI")
- mechanism: How the drug works (mechanism of action)
- standardDosage: Standard adult dosage
- sideEffects: Array of common side effects
- contraindications: Array of contraindications
- foodInteractions: Array of food/drink interactions

Be accurate. This is for healthcare professional reference. Use established pharmacological facts only.
Return a JSON array of drug info objects.`;

export const drugKnowledgeAgent = {
  name: 'Drug Knowledge Agent',

  async lookup(medicines: ExtractedMedicine[]): Promise<AgentResult> {
    const startTime = Date.now();
    console.log(`[${this.name}] Looking up ${medicines.length} medicine(s) via Claude AI...`);

    try {
      const medicineNames = medicines.map((m) => m.brandName).join(', ');

      const drugInfos = await callClaudeJSON<DrugInfo[]>({
        system: SYSTEM_PROMPT,
        prompt: `Provide pharmacological information for these medicines: ${medicineNames}

Return a JSON array of drug info objects.`,
        maxTokens: 4096,
      });

      const validDrugs = Array.isArray(drugInfos) ? drugInfos : [];

      const insights: string[] = [];
      insights.push(`Found information for ${validDrugs.length} out of ${medicines.length} medicine(s)`);

      const salts = validDrugs.map((d) => `${d.brandName} → ${d.saltComposition}`);
      insights.push(`Salt compositions: ${salts.join('; ')}`);

      console.log(`[${this.name}] Completed in ${Date.now() - startTime}ms.`);

      return {
        agentName: this.name,
        status: 'success',
        data: { drugs: validDrugs },
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
        insights: [`Drug knowledge lookup failed: ${errorMsg}`],
        timestamp: new Date().toISOString(),
      };
    }
  },
};
