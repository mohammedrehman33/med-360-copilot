// ========== Agent Types ==========

export interface AgentResult {
  agentName: string;
  status: 'success' | 'error';
  data: Record<string, unknown>;
  insights: string[];
  timestamp: string;
}

// ========== Prescription & Medicine Types ==========

export interface ExtractedMedicine {
  brandName: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: string;
  instructions: string;
  confidence: number;
}

export interface DrugInfo {
  id?: string;
  brandName: string;
  saltComposition: string;
  drugClass: string;
  mechanism: string;
  standardDosage: string;
  sideEffects: string[];
  contraindications: string[];
  foodInteractions: string[];
  manufacturer?: string;
  priceRange?: string;
  region?: string;
}

export interface DosageInterpretation {
  original: string;
  plainLanguage: string;
  isWithinRange: boolean;
  warnings: string[];
}

// ========== Interaction Types ==========

export type InteractionSeverity = 'minor' | 'moderate' | 'major' | 'contraindicated';

export interface DrugInteractionResult {
  drug1: string;
  drug2: string;
  severity: InteractionSeverity;
  description: string;
  mechanism: string;
  management: string;
  evidence: string;
}

// ========== Alternative Medicine Types ==========

export interface AlternativeMedicine {
  brandName: string;
  saltComposition: string;
  manufacturer: string;
  priceRange: string;
  region: string;
}

// ========== Patient Guide Types ==========

export interface PatientGuide {
  medicineName: string;
  saltName: string;
  whatItDoes: string;
  howToTake: string;
  dos: string[];
  donts: string[];
  commonSideEffects: string[];
  seriousSideEffects: string[];
  whenToCallDoctor: string[];
  foodInteractions: string[];
  disclaimer: string;
}

// ========== Lab Report Types ==========

export interface LabValue {
  testName: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'low' | 'high' | 'critical';
}

export interface LabReportAnalysis {
  values: LabValue[];
  abnormalFindings: string[];
  possibleDrugCategories: string[];
  lifestyleRecommendations: string[];
  disclaimer: string;
}

// ========== Pipeline Types ==========

export interface PipelineState {
  prescriptionId: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  currentAgent: string;
  agents: {
    ocr: AgentResult | null;
    drugKnowledge: AgentResult | null;
    dosage: AgentResult | null;
    interaction: AgentResult | null;
    alternative: AgentResult | null;
    patientGuide: AgentResult | null;
  };
  errors: string[];
}

// ========== Database Model Types (matching Prisma) ==========

export interface Prescription {
  id: string;
  userId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  ocrText?: string | null;
  ocrStatus: string;
  parsedMedicines?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LabReport {
  id: string;
  userId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  parsedResults?: string | null;
  abnormalValues?: string | null;
  recommendations?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// ========== Chat Types ==========
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
