import { prescriptionOcrAgent } from './prescription-ocr-agent';
import { drugKnowledgeAgent } from './drug-knowledge-agent';
import { dosageAgent } from './dosage-agent';
import { interactionAgent } from './interaction-agent';
import { alternativeAgent } from './alternative-agent';
import { patientGuideAgent } from './patient-guide-agent';
import type { AgentResult, ExtractedMedicine, DrugInfo, DosageInterpretation, PipelineState } from '@/types';

export interface OrchestratorInput {
  prescriptionId: string;
  prescriptionImage?: string;
  imageMediaType?: string;
  manualMedicines?: ExtractedMedicine[];
}

export async function runPrescriptionPipeline(
  input: OrchestratorInput,
  onProgress: (state: PipelineState) => void
): Promise<PipelineState> {
  const state: PipelineState = {
    prescriptionId: input.prescriptionId,
    status: 'running',
    currentAgent: 'initializing',
    agents: {
      ocr: null,
      drugKnowledge: null,
      dosage: null,
      interaction: null,
      alternative: null,
      patientGuide: null,
    },
    errors: [],
  };

  onProgress(state);

  try {
    // ========== Phase 1: OCR → Extract Medicines ==========
    state.currentAgent = 'ocr';
    onProgress(state);

    let ocrResult: AgentResult;
    if (input.prescriptionImage) {
      ocrResult = await prescriptionOcrAgent.analyze(
        input.prescriptionImage,
        input.imageMediaType || 'image/jpeg'
      );
    } else if (input.manualMedicines?.length) {
      ocrResult = await prescriptionOcrAgent.analyzeManual(input.manualMedicines);
    } else {
      state.status = 'failed';
      state.errors.push('No prescription image or manual medicines provided');
      onProgress(state);
      return state;
    }

    state.agents.ocr = ocrResult;
    onProgress(state);

    if (ocrResult.status === 'error') {
      state.status = 'failed';
      state.errors.push(`OCR failed: ${ocrResult.data?.error}`);
      onProgress(state);
      return state;
    }

    const medicines = (ocrResult.data?.medicines as ExtractedMedicine[]) || [];
    if (medicines.length === 0) {
      state.status = 'failed';
      state.errors.push('No medicines extracted from prescription');
      onProgress(state);
      return state;
    }

    // ========== Phase 1b: Drug Knowledge Lookup ==========
    state.currentAgent = 'drugKnowledge';
    onProgress(state);

    const knowledgeResult = await drugKnowledgeAgent.lookup(medicines);
    state.agents.drugKnowledge = knowledgeResult;
    onProgress(state);

    const drugInfos = (knowledgeResult.data?.drugs as DrugInfo[]) || [];

    // ========== Phase 2: Parallel Analysis ==========
    state.currentAgent = 'parallel-analysis';
    onProgress(state);

    const [dosageResult, interactionResult, alternativeResult] = await Promise.allSettled([
      dosageAgent.interpret(medicines, drugInfos),
      interactionAgent.check(drugInfos),
      alternativeAgent.findAlternatives(drugInfos),
    ]);

    // Handle dosage result
    if (dosageResult.status === 'fulfilled') {
      state.agents.dosage = dosageResult.value;
    } else {
      state.errors.push(`Dosage Agent: ${dosageResult.reason}`);
    }

    // Handle interaction result
    if (interactionResult.status === 'fulfilled') {
      state.agents.interaction = interactionResult.value;
    } else {
      state.errors.push(`Interaction Agent: ${interactionResult.reason}`);
    }

    // Handle alternative result
    if (alternativeResult.status === 'fulfilled') {
      state.agents.alternative = alternativeResult.value;
    } else {
      state.errors.push(`Alternative Agent: ${alternativeResult.reason}`);
    }

    onProgress(state);

    // ========== Phase 3: Patient Guide Generation ==========
    state.currentAgent = 'patientGuide';
    onProgress(state);

    const dosageInterpretations =
      (state.agents.dosage?.data?.interpretations as DosageInterpretation[]) || [];

    const guideResult = await patientGuideAgent.generate(drugInfos, dosageInterpretations);
    state.agents.patientGuide = guideResult;

    // ========== Complete ==========
    state.status = 'completed';
    state.currentAgent = 'complete';
    onProgress(state);

    return state;
  } catch (error) {
    state.status = 'failed';
    const errorMsg = error instanceof Error ? error.message : String(error);
    state.errors.push(`Pipeline error: ${errorMsg}`);
    onProgress(state);
    return state;
  }
}
