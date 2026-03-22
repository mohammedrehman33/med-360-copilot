import { callClaudeJSON } from './claude-client';
import { MEDICAL_DISCLAIMER } from '@/lib/constants';
import type { AgentResult, LabReportAnalysis } from '@/types';

const SYSTEM_PROMPT = `You are a clinical pathologist and laboratory medicine specialist. Analyze lab reports and provide clear interpretations.

Given a lab report (image or text), extract ALL test values and provide:
- values: Array of lab values with testName, value, unit, referenceRange, and status (normal/low/high/critical)
- abnormalFindings: Array of plain-language explanations for each abnormal value
- possibleDrugCategories: Array of drug categories a doctor MIGHT consider (NOT specific prescriptions)
- lifestyleRecommendations: Array of lifestyle changes that may help
- disclaimer: Medical disclaimer

IMPORTANT RULES:
- NEVER prescribe specific drugs. Only suggest categories (e.g., "Statin class medications for cholesterol management")
- Always note that a doctor must interpret results in clinical context
- Flag critical values prominently
- Use reference ranges appropriate for South Asian population where available`;

export const labReportAgent = {
  name: 'Lab Report Agent',

  async analyze(imageBase64: string, mediaType: string = 'image/jpeg'): Promise<AgentResult> {
    const startTime = Date.now();
    console.log(`[${this.name}] Analyzing lab report...`);

    try {
      const analysis = await callClaudeJSON<LabReportAnalysis>({
        system: SYSTEM_PROMPT,
        prompt: `Analyze this lab report image. Extract all test values, identify abnormal results, and provide recommendations.

Return a single JSON object with: values, abnormalFindings, possibleDrugCategories, lifestyleRecommendations, disclaimer.

Disclaimer must be: "${MEDICAL_DISCLAIMER}"`,
        images: [{ data: imageBase64, mediaType }],
        maxTokens: 8192,
      });

      if (!analysis.disclaimer) {
        analysis.disclaimer = MEDICAL_DISCLAIMER;
      }

      const criticalValues = analysis.values.filter((v) => v.status === 'critical');
      const abnormalValues = analysis.values.filter((v) => v.status !== 'normal');

      const insights: string[] = [];
      insights.push(`Extracted ${analysis.values.length} lab value(s)`);
      if (criticalValues.length > 0) {
        insights.push(`CRITICAL: ${criticalValues.length} critical value(s) detected!`);
        for (const cv of criticalValues) {
          insights.push(`CRITICAL: ${cv.testName} = ${cv.value} ${cv.unit} (ref: ${cv.referenceRange})`);
        }
      }
      if (abnormalValues.length > 0) {
        insights.push(`${abnormalValues.length} abnormal value(s) found`);
      }
      if (analysis.lifestyleRecommendations.length > 0) {
        insights.push(`${analysis.lifestyleRecommendations.length} lifestyle recommendation(s) provided`);
      }

      console.log(`[${this.name}] Completed in ${Date.now() - startTime}ms. Found ${analysis.values.length} values.`);

      return {
        agentName: this.name,
        status: 'success',
        data: { analysis },
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
        insights: [`Lab report analysis failed: ${errorMsg}`],
        timestamp: new Date().toISOString(),
      };
    }
  },

  async analyzeText(labText: string): Promise<AgentResult> {
    const startTime = Date.now();
    console.log(`[${this.name}] Analyzing lab report text...`);

    try {
      const analysis = await callClaudeJSON<LabReportAnalysis>({
        system: SYSTEM_PROMPT,
        prompt: `Analyze this lab report text data:

${labText}

Return a single JSON object with: values, abnormalFindings, possibleDrugCategories, lifestyleRecommendations, disclaimer.

Disclaimer must be: "${MEDICAL_DISCLAIMER}"`,
        maxTokens: 8192,
      });

      if (!analysis.disclaimer) {
        analysis.disclaimer = MEDICAL_DISCLAIMER;
      }

      console.log(`[${this.name}] Completed in ${Date.now() - startTime}ms.`);

      return {
        agentName: this.name,
        status: 'success',
        data: { analysis },
        insights: [`Extracted ${analysis.values.length} lab value(s) from text`],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      return {
        agentName: this.name,
        status: 'error',
        data: { error: errorMsg },
        insights: [`Lab report analysis failed: ${errorMsg}`],
        timestamp: new Date().toISOString(),
      };
    }
  },
};
