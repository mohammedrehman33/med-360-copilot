import { NextRequest, NextResponse } from 'next/server';
import { callClaudeJSON } from '@/lib/agents/claude-client';
import type { DrugInfo, DrugInteractionResult, AlternativeMedicine } from '@/types';

const DRUG_LOOKUP_PROMPT = `You are an expert clinical pharmacologist. Given a medicine name or salt composition, provide accurate pharmacological information.

For each matching medicine, return:
- brandName: The brand name
- saltComposition: Active ingredient(s) / salt(s)
- drugClass: Pharmacological class
- mechanism: Mechanism of action
- standardDosage: Standard adult dosage
- sideEffects: Array of common side effects
- contraindications: Array of contraindications
- foodInteractions: Array of food/drink interactions
- manufacturer: Manufacturing company (if known)
- priceRange: Approximate price range in PKR
- region: Market availability (PK, IN, global)

Focus on medicines available in Pakistan/South Asian market. Return a JSON array.`;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const searchTerm = decodeURIComponent(name);

    // Use Claude AI for drug lookup
    const drugs = await callClaudeJSON<DrugInfo[]>({
      system: DRUG_LOOKUP_PROMPT,
      prompt: `Provide pharmacological information for: "${searchTerm}"

If this is a brand name, return info for that specific brand.
If this is a salt/generic name, return info for common brands containing this salt.
Return up to 3 most relevant results as a JSON array. Keep responses concise.`,
      maxTokens: 3000,
    });

    const validDrugs = Array.isArray(drugs) ? drugs : [];

    if (validDrugs.length === 0) {
      return NextResponse.json({ error: 'Drug not found', drugs: [] }, { status: 404 });
    }

    // Get interactions for the found drugs via Claude
    const salts = [...new Set(validDrugs.map((d) => d.saltComposition))];
    const interactions = await callClaudeJSON<DrugInteractionResult[]>({
      system: 'You are a drug interaction specialist. Return a JSON array of known drug interactions. Keep descriptions brief.',
      prompt: `List the most important known drug-drug interactions for these salts: ${salts.join(', ')}

For each interaction return: drug1Salt, drug2Salt, severity (minor/moderate/major/contraindicated), description, mechanism, management.
Return up to 5 most clinically significant interactions as a JSON array. Be concise.`,
      maxTokens: 2000,
    });

    // Get alternatives via Claude
    const primaryDrug = validDrugs[0];
    const alternatives = await callClaudeJSON<AlternativeMedicine[]>({
      system: 'You are a pharmaceutical alternatives specialist. Return a JSON array of alternative brands.',
      prompt: `Find alternative brands for ${primaryDrug.brandName} (${primaryDrug.saltComposition}) available in Pakistan/South Asian market.
Do NOT include ${primaryDrug.brandName} itself. Return up to 5 alternatives as a JSON array with: brandName, saltComposition, manufacturer, priceRange, region.`,
      maxTokens: 1024,
    });

    return NextResponse.json({
      drugs: validDrugs,
      interactions: Array.isArray(interactions) ? interactions : [],
      alternatives: Array.isArray(alternatives) ? alternatives : [],
    });
  } catch (error) {
    console.error('[API /drugs] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Drug lookup failed' },
      { status: 500 }
    );
  }
}
