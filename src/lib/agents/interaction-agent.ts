import { callClaudeJSON } from './claude-client';
import type { AgentResult, DrugInfo, DrugInteractionResult } from '@/types';

const SYSTEM_PROMPT = `You are a drug interaction specialist pharmacist. Given a list of drugs with their salt compositions, check ALL possible drug-drug interactions and drug-food interactions.

For each interaction found, return:
- drug1: First drug name
- drug2: Second drug name (or food item)
- severity: "minor" | "moderate" | "major" | "contraindicated"
- description: Clear description of the interaction
- mechanism: Pharmacological mechanism
- management: How to manage/avoid the interaction
- evidence: Level of evidence or references

Check ALL N*(N-1)/2 drug pairs. Also check for common food interactions (alcohol, grapefruit, dairy, etc.)

Return a JSON array of interaction objects. Return empty array [] if no interactions found.`;

export const interactionAgent = {
  name: 'Drug Interaction Agent',

  async check(drugInfos: DrugInfo[]): Promise<AgentResult> {
    const startTime = Date.now();
    console.log(`[${this.name}] Checking interactions for ${drugInfos.length} drug(s) via Claude AI...`);

    try {
      const drugList = drugInfos.map((d) => `${d.brandName} (${d.saltComposition})`).join('\n');

      const interactions = await callClaudeJSON<DrugInteractionResult[]>({
        system: SYSTEM_PROMPT,
        prompt: `Check ALL drug-drug and drug-food interactions for these medicines:

${drugList}

Return a JSON array of all interactions found. Include food interactions too.`,
        maxTokens: 4096,
      });

      const validInteractions = Array.isArray(interactions) ? interactions : [];

      // Sort by severity
      const severityOrder: Record<string, number> = { contraindicated: 0, major: 1, moderate: 2, minor: 3 };
      validInteractions.sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));

      const insights: string[] = [];
      const critical = validInteractions.filter((i) => i.severity === 'contraindicated' || i.severity === 'major');
      insights.push(`Found ${validInteractions.length} interaction(s) total`);
      if (critical.length > 0) {
        insights.push(`WARNING: ${critical.length} critical/major interaction(s) detected!`);
        for (const c of critical) {
          insights.push(`${c.severity.toUpperCase()}: ${c.drug1} + ${c.drug2} — ${c.description}`);
        }
      }
      if (validInteractions.length === 0) {
        insights.push('No significant drug interactions detected');
      }

      console.log(`[${this.name}] Completed in ${Date.now() - startTime}ms. Found ${validInteractions.length} interactions.`);

      return {
        agentName: this.name,
        status: 'success',
        data: { interactions: validInteractions },
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
        insights: [`Interaction check failed: ${errorMsg}`],
        timestamp: new Date().toISOString(),
      };
    }
  },
};
