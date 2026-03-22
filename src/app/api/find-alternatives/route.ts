import { NextRequest, NextResponse } from 'next/server';
import { callClaudeJSON } from '@/lib/agents/claude-client';
import { alternativeAgent } from '@/lib/agents/alternative-agent';
import type { DrugInfo } from '@/types';

const DRUG_LOOKUP_PROMPT = `You are an expert clinical pharmacologist. Given a medicine name or salt, provide its full pharmacological info.
Return a JSON object with: brandName, saltComposition, drugClass, mechanism, standardDosage, sideEffects (array), contraindications (array), foodInteractions (array).`;

export async function POST(req: NextRequest) {
  try {
    const { brandName, salt } = (await req.json()) as { brandName?: string; salt?: string };

    if (!brandName && !salt) {
      return NextResponse.json({ error: 'Provide brandName or salt' }, { status: 400 });
    }

    const searchTerm = brandName || salt;

    // Look up drug info via Claude AI
    const drugInfo = await callClaudeJSON<DrugInfo>({
      system: DRUG_LOOKUP_PROMPT,
      prompt: `Provide pharmacological information for: "${searchTerm}"
Return a single JSON object with the drug info.`,
      maxTokens: 1024,
    });

    const validDrug: DrugInfo = drugInfo && drugInfo.brandName
      ? drugInfo
      : {
          brandName: brandName || '',
          saltComposition: salt || brandName || '',
          drugClass: 'Unknown',
          mechanism: '',
          standardDosage: '',
          sideEffects: [],
          contraindications: [],
          foodInteractions: [],
        };

    const result = await alternativeAgent.findAlternatives([validDrug]);

    return NextResponse.json({ result });
  } catch (error) {
    console.error('[API /find-alternatives] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Alternative search failed' },
      { status: 500 }
    );
  }
}
