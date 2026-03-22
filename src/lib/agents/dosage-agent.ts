import { callClaudeJSON } from './claude-client';
import dosageAbbreviations from '@/lib/data/dosage-abbreviations.json';
import type { AgentResult, ExtractedMedicine, DrugInfo, DosageInterpretation } from '@/types';

const abbreviations = dosageAbbreviations as Record<string, { full: string; detail: string }>;

const SYSTEM_PROMPT = `You are a clinical pharmacist specializing in dosage validation. Given medicines with their prescribed dosages and known standard dosage ranges, you must:

1. Convert medical shorthand to plain language
2. Validate if the prescribed dose is within the standard therapeutic range
3. Flag any dosage concerns or warnings

Return a JSON array of DosageInterpretation objects with:
- original: The original prescription text
- plainLanguage: Full plain-language translation
- isWithinRange: Boolean - is dose within standard range
- warnings: Array of warning strings (empty if no concerns)

Be precise. Patients rely on this information.`;

function expandAbbreviations(text: string): string {
  let expanded = text;
  for (const [abbr, info] of Object.entries(abbreviations)) {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    expanded = expanded.replace(regex, info.full);
  }
  return expanded;
}

export const dosageAgent = {
  name: 'Dosage Interpretation Agent',

  async interpret(
    medicines: ExtractedMedicine[],
    drugInfos: DrugInfo[]
  ): Promise<AgentResult> {
    const startTime = Date.now();
    console.log(`[${this.name}] Interpreting dosage for ${medicines.length} medicine(s)...`);

    try {
      // Quick local abbreviation expansion
      const localExpansions = medicines.map((med) => {
        const original = `${med.brandName} ${med.dosage} ${med.frequency} x ${med.duration} ${med.instructions}`.trim();
        const plainLanguage = expandAbbreviations(original);
        return { original, plainLanguage, brandName: med.brandName, dosage: med.dosage };
      });

      // Claude validation against known ranges
      const medWithRanges = medicines.map((med) => {
        const drugInfo = drugInfos.find(
          (d) => d.brandName.toLowerCase() === med.brandName.toLowerCase()
        );
        return {
          brandName: med.brandName,
          prescribedDosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions,
          standardDosage: drugInfo?.standardDosage || 'Unknown',
          saltComposition: drugInfo?.saltComposition || 'Unknown',
        };
      });

      const interpretations = await callClaudeJSON<DosageInterpretation[]>({
        system: SYSTEM_PROMPT,
        prompt: `Interpret and validate these prescribed dosages:

${JSON.stringify(medWithRanges, null, 2)}

Local abbreviation expansions for reference:
${localExpansions.map((e) => `${e.original} → ${e.plainLanguage}`).join('\n')}

Return a JSON array of DosageInterpretation objects.`,
        maxTokens: 4096,
      });

      const validInterpretations = Array.isArray(interpretations) ? interpretations : [];
      const warnings = validInterpretations.filter((i) => !i.isWithinRange || i.warnings.length > 0);

      const insights: string[] = [];
      insights.push(`Interpreted dosage for ${validInterpretations.length} medicine(s)`);
      if (warnings.length > 0) {
        insights.push(`${warnings.length} dosage warning(s) detected`);
        for (const w of warnings) {
          insights.push(`Warning for ${w.original}: ${w.warnings.join('; ')}`);
        }
      } else {
        insights.push('All dosages are within standard therapeutic ranges');
      }

      console.log(`[${this.name}] Completed in ${Date.now() - startTime}ms.`);

      return {
        agentName: this.name,
        status: 'success',
        data: { interpretations: validInterpretations },
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
        insights: [`Dosage interpretation failed: ${errorMsg}`],
        timestamp: new Date().toISOString(),
      };
    }
  },
};
