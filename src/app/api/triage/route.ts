import { NextRequest, NextResponse } from 'next/server';
import { callClaudeJSON } from '@/lib/agents/claude-client';

interface TriageRequest {
  age: number;
  gender: string;
  pregnancyStatus?: string;
  mainSymptom: string;
  duration: string;
  severity: number;
  additionalSymptoms: string[];
  medications: string[];
  allergies: string;
  chronicConditions: string[];
}

interface TriageResult {
  urgencyLevel: 'emergency' | 'urgent' | 'semi-urgent' | 'non-urgent';
  assessment: string;
  recommendedActions: string[];
  warningSignsToWatch: string[];
  whenToSeekEmergencyCare: string[];
  possibleConditions: string[];
  selfCareAdvice: string[];
  recommendedSpecialists: { condition: string; specialist: string; marhamSlug: string }[];
}

const TRIAGE_SYSTEM_PROMPT = `You are an experienced medical triage nurse performing an initial patient assessment. Based on the patient information provided, evaluate the symptoms and provide a structured triage assessment.

Your role is to help patients understand the urgency of their symptoms and guide them toward appropriate care. You are NOT diagnosing — you are triaging.

You must return a JSON object with the following fields:

- urgencyLevel: One of "emergency", "urgent", "semi-urgent", or "non-urgent"
  - "emergency": Life-threatening, needs immediate emergency care (e.g., chest pain with shortness of breath, signs of stroke, severe allergic reaction, uncontrolled bleeding)
  - "urgent": Needs medical attention within hours (e.g., high fever with other symptoms, significant pain, possible fractures)
  - "semi-urgent": Should see a doctor within 1-2 days (e.g., persistent symptoms, moderate pain, infections)
  - "non-urgent": Can be managed with self-care or scheduled appointment (e.g., mild cold, minor aches, routine concerns)

- assessment: A 2-3 sentence clinical assessment written in patient-friendly language explaining what the symptoms may indicate and why you've assigned this urgency level.

- recommendedActions: An array of 3-5 specific, actionable steps the patient should take (e.g., "Visit your primary care physician within the next 24 hours", "Keep a symptom diary noting any changes").

- warningSignsToWatch: An array of 3-5 warning signs that would indicate the condition is worsening and requires escalated care.

- whenToSeekEmergencyCare: An array of 2-3 specific scenarios when the patient should go to the emergency room or call emergency services immediately.

- possibleConditions: An array of 2-4 possible conditions that could explain the symptoms. Always note that only a qualified healthcare professional can provide a definitive diagnosis.

- selfCareAdvice: An array of 2-3 home care tips that may help manage symptoms in the meantime (e.g., rest, hydration, OTC medications if appropriate).

- recommendedSpecialists: An array of objects, one for each possible condition. Each object has:
  - "condition": The condition name (must exactly match one entry in possibleConditions)
  - "specialist": The specialist doctor type in human-readable form (e.g., "Dermatologist", "Cardiologist", "Pulmonologist", "General Physician", "Gastroenterologist", "Neurologist", "Orthopedic Surgeon", "ENT Specialist", "Gynecologist", "Urologist", "Psychiatrist", "Ophthalmologist", "Endocrinologist", "Nephrologist", "Oncologist", "Rheumatologist", "Allergist", "Dentist", etc.)
  - "marhamSlug": The URL slug for marham.pk doctor listings. Use lowercase, hyphenated format (e.g., "dermatologist", "cardiologist", "pulmonologist", "general-physician", "gastroenterologist", "neurologist", "orthopedic-surgeon", "ent-specialist", "gynecologist", "urologist", "psychiatrist", "eye-specialist", "endocrinologist", "nephrologist", "oncologist", "rheumatologist", "allergist", "dentist"). Pick the most appropriate specialist for each condition.

Consider the patient's age, gender, pregnancy status, symptom duration, severity, existing medications, allergies, and chronic conditions when making your assessment. Be thorough but compassionate. Always err on the side of caution.`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TriageRequest;

    if (!body.mainSymptom || !body.age || !body.gender) {
      return NextResponse.json(
        { error: 'Missing required fields: age, gender, and main symptom are required.' },
        { status: 400 }
      );
    }

    const patientSummary = `
Patient Information:
- Age: ${body.age}
- Gender: ${body.gender}
${body.pregnancyStatus ? `- Pregnancy Status: ${body.pregnancyStatus}` : ''}

Presenting Symptoms:
- Main Symptom: ${body.mainSymptom}
- Duration: ${body.duration}
- Severity: ${body.severity}/10
${body.additionalSymptoms.length > 0 ? `- Additional Symptoms: ${body.additionalSymptoms.join(', ')}` : '- No additional symptoms reported'}

Medical History:
${body.medications.length > 0 ? `- Current Medications: ${body.medications.join(', ')}` : '- No current medications'}
- Allergies: ${body.allergies || 'None reported'}
${body.chronicConditions.length > 0 ? `- Chronic Conditions: ${body.chronicConditions.join(', ')}` : '- No chronic conditions reported'}

Please provide your triage assessment as a JSON object.`;

    const result = await callClaudeJSON<TriageResult>({
      system: TRIAGE_SYSTEM_PROMPT,
      prompt: patientSummary,
      maxTokens: 2048,
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error('[API /triage] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Triage assessment failed' },
      { status: 500 }
    );
  }
}
