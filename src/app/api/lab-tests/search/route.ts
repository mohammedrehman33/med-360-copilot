import { NextRequest, NextResponse } from 'next/server';
import { callClaudeJSON } from '@/lib/agents/claude-client';

export interface LabTestInfo {
  testName: string;
  aliases: string[];
  category: string;
  purpose: string;
  whatItMeasures: string;
  preparation: {
    fasting: string;
    medications: string;
    specialInstructions: string;
  };
  procedure: {
    sampleType: string;
    howPerformed: string;
    duration: string;
    painLevel: string;
  };
  results: {
    normalRanges: Array<{ group: string; range: string }>;
    highMeaning: string;
    lowMeaning: string;
    criticalValues: string;
    affectingFactors: string[];
  };
  relatedTests: string[];
  conditions: string[];
  frequency: string;
  costRange: string;
}

const SYSTEM_PROMPT = `You are a medical laboratory specialist and patient educator. Given a lab test name or keyword, provide comprehensive, patient-friendly information about the lab test.

Return your response as a JSON object with this exact structure:
{
  "testName": "Full official name of the test",
  "aliases": ["Common alternative names or abbreviations"],
  "category": "Category (e.g., Blood Test, Urine Test, Imaging, etc.)",
  "purpose": "Clear explanation of why this test is ordered",
  "whatItMeasures": "What the test specifically measures in the body",
  "preparation": {
    "fasting": "Fasting requirements (e.g., '8-12 hours fasting required' or 'No fasting needed')",
    "medications": "Any medications to avoid or continue before the test",
    "specialInstructions": "Any other preparation steps the patient should know"
  },
  "procedure": {
    "sampleType": "Type of sample collected (e.g., Blood from vein, Urine, etc.)",
    "howPerformed": "Step-by-step description of how the test is performed",
    "duration": "How long the test takes and when results are typically available",
    "painLevel": "Expected pain or discomfort level (Minimal, Mild, Moderate, etc.)"
  },
  "results": {
    "normalRanges": [
      { "group": "Adult Males", "range": "specific range with units" },
      { "group": "Adult Females", "range": "specific range with units" },
      { "group": "Children", "range": "specific range with units if different" }
    ],
    "highMeaning": "What elevated values may indicate",
    "lowMeaning": "What decreased values may indicate",
    "criticalValues": "Values that require immediate medical attention",
    "affectingFactors": ["List of factors that can affect test results"]
  },
  "relatedTests": ["Names of related or commonly ordered companion tests"],
  "conditions": ["Medical conditions this test helps diagnose or monitor"],
  "frequency": "How often this test is typically recommended",
  "costRange": "Approximate cost range in USD"
}

Be accurate, thorough, and use patient-friendly language. If the query matches multiple tests, pick the single most relevant one. Always provide specific numeric reference ranges with proper units.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json(
        { error: 'Please provide a lab test name or keyword to search.' },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();

    console.log(`[API /lab-tests/search] Searching for: "${trimmedQuery}"`);

    const result = await callClaudeJSON<LabTestInfo>({
      system: SYSTEM_PROMPT,
      prompt: `Provide comprehensive information about this lab test: "${trimmedQuery}"`,
      maxTokens: 4096,
    });

    console.log(`[API /lab-tests/search] Success: ${result.testName}`);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('[API /lab-tests/search] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to retrieve lab test information' },
      { status: 500 }
    );
  }
}
