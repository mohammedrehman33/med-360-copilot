import { create } from 'zustand';
import type { ExtractedMedicine, AgentResult, DrugInfo, LabReportAnalysis, Prescription } from '@/types';

interface PharmaMindState {
  currentPrescription: Prescription | null;
  extractedMedicines: ExtractedMedicine[];
  pipelineStatus: 'idle' | 'running' | 'completed' | 'failed';
  currentAgent: string;
  agentResults: Record<string, AgentResult>;
  searchQuery: string;
  searchResults: DrugInfo[];
  currentLabReport: LabReportAnalysis | null;
  activeTab: string;

  setPrescription: (p: Prescription | null) => void;
  setExtractedMedicines: (m: ExtractedMedicine[]) => void;
  setPipelineStatus: (s: PharmaMindState['pipelineStatus']) => void;
  setCurrentAgent: (a: string) => void;
  setAgentResult: (name: string, result: AgentResult) => void;
  setSearchQuery: (q: string) => void;
  setSearchResults: (r: DrugInfo[]) => void;
  setLabReport: (r: LabReportAnalysis | null) => void;
  setActiveTab: (t: string) => void;
  reset: () => void;
}

export const useAppStore = create<PharmaMindState>((set) => ({
  currentPrescription: null,
  extractedMedicines: [],
  pipelineStatus: 'idle',
  currentAgent: '',
  agentResults: {},
  searchQuery: '',
  searchResults: [],
  currentLabReport: null,
  activeTab: 'ocr',

  setPrescription: (currentPrescription) => set({ currentPrescription }),
  setExtractedMedicines: (extractedMedicines) => set({ extractedMedicines }),
  setPipelineStatus: (pipelineStatus) => set({ pipelineStatus }),
  setCurrentAgent: (currentAgent) => set({ currentAgent }),
  setAgentResult: (name, result) =>
    set((state) => ({ agentResults: { ...state.agentResults, [name]: result } })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setLabReport: (currentLabReport) => set({ currentLabReport }),
  setActiveTab: (activeTab) => set({ activeTab }),
  reset: () =>
    set({
      currentPrescription: null,
      extractedMedicines: [],
      pipelineStatus: 'idle',
      currentAgent: '',
      agentResults: {},
      currentLabReport: null,
      activeTab: 'ocr',
    }),
}));
