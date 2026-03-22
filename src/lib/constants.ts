export const MEDICAL_DISCLAIMER =
  'This tool provides informational support only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making any medical decisions. Do not disregard professional medical advice based on information provided by this tool.';

export const SHORT_DISCLAIMER =
  'For informational purposes only. Consult your doctor or pharmacist.';

export const SEVERITY_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  minor: { label: 'Minor', color: '#2563EB', bgColor: '#EFF6FF' },
  moderate: { label: 'Moderate', color: '#D97706', bgColor: '#FFFBEB' },
  major: { label: 'Major', color: '#EA580C', bgColor: '#FFF7ED' },
  contraindicated: { label: 'Contraindicated', color: '#DC2626', bgColor: '#FEF2F2' },
};

export const PIPELINE_AGENTS = [
  { key: 'ocr', label: 'Prescription OCR', icon: 'ScanLine' },
  { key: 'drugKnowledge', label: 'Drug Knowledge', icon: 'Pill' },
  { key: 'dosage', label: 'Dosage Check', icon: 'Clock' },
  { key: 'interaction', label: 'Interaction Check', icon: 'AlertTriangle' },
  { key: 'alternative', label: 'Alternatives', icon: 'ArrowLeftRight' },
  { key: 'patientGuide', label: 'Patient Guide', icon: 'BookOpen' },
] as const;
