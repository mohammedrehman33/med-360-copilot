import { callClaudeJSON } from './claude-client';
import type { AgentResult, DrugInfo, AlternativeMedicine } from '@/types';

const SYSTEM_PROMPT = `You are a pharmaceutical alternatives specialist. Given a drug with its salt composition, find alternative brands with the SAME salt/active ingredient.

For each alternative, provide:
- brandName: Alternative brand name
- saltComposition: Salt (should match the original)
- manufacturer: Manufacturing company
- priceRange: Approximate price range in PKR
- region: Market availability (PK, IN, global)

Focus on Pakistani and South Asian market alternatives. Only suggest bioequivalent alternatives with the same active ingredient and similar dosage forms.
Return a JSON array of alternative objects.`;

export const alternativeAgent = {
  name: 'Alternative Medicine Agent',

  async findAlternatives(drugInfos: DrugInfo[]): Promise<AgentResult> {
    const startTime = Date.now();
    console.log(`[${this.name}] Finding alternatives for ${drugInfos.length} drug(s) via Claude AI...`);

    try {
      const allAlternatives: Record<string, AlternativeMedicine[]> = {};

      for (const drug of drugInfos) {
        const aiAlts = await callClaudeJSON<AlternativeMedicine[]>({
          system: SYSTEM_PROMPT,
          prompt: `Find alternative brands for:
Drug: ${drug.brandName}
Salt: ${drug.saltComposition}
Drug Class: ${drug.drugClass}

Return up to 5 alternatives available in Pakistan/South Asian market. Do NOT include the original drug "${drug.brandName}" in the list.`,
          maxTokens: 2048,
        });

        allAlternatives[drug.brandName] = Array.isArray(aiAlts) ? aiAlts : [];
      }

      const insights: string[] = [];
      for (const [drug, alts] of Object.entries(allAlternatives)) {
        insights.push(`${drug}: ${alts.length} alternative(s) found — ${alts.map((a) => a.brandName).join(', ')}`);
      }

      console.log(`[${this.name}] Completed in ${Date.now() - startTime}ms.`);

      return {
        agentName: this.name,
        status: 'success',
        data: { alternatives: allAlternatives },
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
        insights: [`Alternative search failed: ${errorMsg}`],
        timestamp: new Date().toISOString(),
      };
    }
  },
};
