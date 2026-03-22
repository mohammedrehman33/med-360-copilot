import { NextRequest, NextResponse } from 'next/server';
import { callClaudeJSON } from '@/lib/agents/claude-client';
import { interactionAgent } from '@/lib/agents/interaction-agent';
import type { DrugInfo } from '@/types';

const DRUG_LOOKUP_PROMPT = `You are an expert clinical pharmacologist. Given medicine names, provide their salt composition and drug class.
Return a JSON array with objects containing: brandName, saltComposition, drugClass, mechanism, standardDosage, sideEffects (array), contraindications (array), foodInteractions (array).`;

export async function POST(req: NextRequest) {
  try {
    const { medicines } = (await req.json()) as { medicines: string[] };

    if (!medicines || medicines.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 medicines required for interaction check' },
        { status: 400 }
      );
    }

    // Look up drug info via Claude AI
    const drugInfos = await callClaudeJSON<DrugInfo[]>({
      system: DRUG_LOOKUP_PROMPT,
      prompt: `Provide pharmacological information for these medicines: ${medicines.join(', ')}

Return a JSON array of drug info objects.`,
      maxTokens: 2048,
    });

    const validDrugs: DrugInfo[] = Array.isArray(drugInfos) ? drugInfos : medicines.map((name) => ({
      brandName: name,
      saltComposition: name,
      drugClass: 'Unknown',
      mechanism: '',
      standardDosage: '',
      sideEffects: [],
      contraindications: [],
      foodInteractions: [],
    }));

    const result = await interactionAgent.check(validDrugs);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('[API /check-interactions] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Interaction check failed' },
      { status: 500 }
    );
  }
}
