'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DisclaimerBanner from '@/components/ui/DisclaimerBanner';
import PipelineProgress from '@/components/ui/PipelineProgress';
import AnalysisLoader from '@/components/ui/AnalysisLoader';
import ShareResultModal from '@/components/ui/ShareResultModal';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { PipelineState, DrugInfo, DrugInteractionResult, DosageInterpretation, PatientGuide, AlternativeMedicine } from '@/types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ACCENT_CYCLE = ['#3B82F6', '#7C3AED', '#bd0c3b'];
const GUIDE_PALETTE = ['#3B82F6', '#7C3AED', '#7c3aed', '#0e7490', '#b45309', '#be185d'];

function ConfidenceRing({ value, size = 36 }: { value: number; size?: number }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value);
  const color = value >= 0.8 ? '#7C3AED' : value >= 0.5 ? '#3B82F6' : '#bd0c3b';
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EFF6FF" strokeWidth={3} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, delay: 0.3 }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="text-[9px] font-bold fill-current" fill={color}>
        {Math.round(value * 100)}
      </text>
    </svg>
  );
}

function CountUp({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration * 60);
    const id = setInterval(() => {
      start += step;
      if (start >= target) {
        setVal(target);
        clearInterval(id);
      } else {
        setVal(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [inView, target, duration]);

  return <span ref={ref}>{val}</span>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const popIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.04, type: 'spring' as const, stiffness: 400, damping: 25 },
  }),
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AnalyzePage() {
  const [activeTab, setActiveTab] = useState('ocr');
  const [pipelineState, setPipelineState] = useState<PipelineState | null>(null);
  const [loading, setLoading] = useState(false);
  const [manualMedicines, setManualMedicines] = useState<Array<{ brandName: string; dosage: string; frequency: string; duration: string }>>([]);
  const [mode, setMode] = useState<'upload' | 'manual'>('upload');
  const [shareOpen, setShareOpen] = useState(false);
  const [expandedMed, setExpandedMed] = useState<number | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', acceptedFiles[0]);
      formData.append('userId', 'default-user');

      const uploadRes = await fetch('/api/prescriptions', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadData.prescription?.id) throw new Error('Upload failed');

      const analyzeRes = await fetch('/api/analyze-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prescriptionId: uploadData.prescription.id }),
      });
      const analyzeData = await analyzeRes.json();
      setPipelineState(analyzeData.pipeline);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeManual = async () => {
    if (manualMedicines.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch('/api/analyze-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manualMedicines: manualMedicines.map((m) => ({
            ...m,
            route: 'oral',
            instructions: '',
            confidence: 1.0,
          })),
        }),
      });
      const data = await res.json();
      setPipelineState(data.pipeline);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  const addManualMedicine = () => {
    setManualMedicines([...manualMedicines, { brandName: '', dosage: '', frequency: 'BD', duration: '5 days' }]);
  };

  const updateManualMedicine = (idx: number, field: string, value: string) => {
    const updated = [...manualMedicines];
    updated[idx] = { ...updated[idx], [field]: value };
    setManualMedicines(updated);
  };

  const removeManualMedicine = (idx: number) => {
    setManualMedicines(manualMedicines.filter((_, i) => i !== idx));
  };

  // Extract data from pipeline state
  const drugs = (pipelineState?.agents.drugKnowledge?.data?.drugs as DrugInfo[]) || [];
  const interactions = (pipelineState?.agents.interaction?.data?.interactions as DrugInteractionResult[]) || [];
  const dosages = (pipelineState?.agents.dosage?.data?.interpretations as DosageInterpretation[]) || [];
  const alternatives = (pipelineState?.agents.alternative?.data?.alternatives as Record<string, AlternativeMedicine[]>) || {};
  const guides = (pipelineState?.agents.patientGuide?.data?.guides as PatientGuide[]) || [];
  const ocrMedicines = (pipelineState?.agents.ocr?.data?.medicines as Array<{ brandName: string; dosage: string; frequency: string; duration: string; confidence: number }>) || [];

  const hasCriticalInteraction = interactions.some(
    (i) => i.severity === 'major' || i.severity === 'contraindicated'
  );

  const totalMeds = ocrMedicines.length || drugs.length;
  const dosageAlerts = dosages.filter((d) => !d.isWithinRange).length;
  const allMedicineNames = ocrMedicines.length > 0
    ? ocrMedicines.map((m) => m.brandName)
    : drugs.map((d) => d.brandName);

  // Build share summary text
  const shareSummaryText = [
    `Medicines (${totalMeds}): ${allMedicineNames.join(', ')}`,
    `Drug Interactions: ${interactions.length}`,
    `Dosage Alerts: ${dosageAlerts}`,
    interactions.length > 0
      ? `\nInteractions:\n${interactions.map((ix) => `- ${ix.drug1} + ${ix.drug2} (${ix.severity}): ${ix.description}`).join('\n')}`
      : '',
  ].filter(Boolean).join('\n');

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-8 py-12">
        {/* Hero Header */}
        <div className="mb-10">
          {pipelineState && pipelineState.status === 'completed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-[#EDE9FE] text-[#7C3AED] px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              AI Verification Complete
            </motion.div>
          )}
          <div className="flex items-end justify-between gap-6">
            <h1 className="font-headline text-5xl font-extrabold text-[#00345e] tracking-tight">
              Prescription Analysis
            </h1>
            {pipelineState && !loading && (
              <div className="flex items-center gap-3">
                <button className="inline-flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save Report
                </button>
                <button
                  onClick={() => setShareOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#3B82F6] px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">share</span>
                  Share
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Input Section (before analysis) */}
        {!pipelineState && !loading && (
          <div className="max-w-2xl mx-auto">
            {/* Mode Toggle */}
            <div className="flex bg-[#EFF6FF] rounded-xl p-1 mb-6">
              <button
                onClick={() => setMode('upload')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
                  mode === 'upload'
                    ? 'bg-white text-[#3B82F6] shadow-[0_4px_40px_-10px_rgba(0,52,94,0.06)]'
                    : 'text-[#475569] hover:text-[#3B82F6]'
                )}
              >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                Upload Image
              </button>
              <button
                onClick={() => setMode('manual')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
                  mode === 'manual'
                    ? 'bg-white text-[#3B82F6] shadow-[0_4px_40px_-10px_rgba(0,52,94,0.06)]'
                    : 'text-[#475569] hover:text-[#3B82F6]'
                )}
              >
                <span className="material-symbols-outlined text-[20px]">edit_note</span>
                Enter Manually
              </button>
            </div>

            {mode === 'upload' ? (
              <div
                {...getRootProps()}
                className={cn(
                  'rounded-xl p-12 text-center cursor-pointer transition-all duration-200',
                  isDragActive
                    ? 'bg-[#DBEAFE] shadow-[0_4px_40px_-10px_rgba(0,52,94,0.12)]'
                    : 'bg-white shadow-[0_4px_40px_-10px_rgba(0,52,94,0.06)] hover:shadow-[0_4px_40px_-10px_rgba(0,52,94,0.12)]'
                )}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 rounded-full bg-[#DBEAFE] flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[32px] text-[#3B82F6]">cloud_upload</span>
                </div>
                <p className="text-base font-semibold mb-1 text-[#00345e]">
                  Drop prescription image here
                </p>
                <p className="text-sm text-[#475569]">
                  PNG, JPG, or PDF up to 10MB
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 shadow-[0_4px_40px_-10px_rgba(0,52,94,0.06)]">
                <div className="space-y-4">
                  {manualMedicines.map((med, idx) => (
                    <div key={idx} className="bg-[#EFF6FF] rounded-xl p-4 relative">
                      <button
                        onClick={() => removeManualMedicine(idx)}
                        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#DBEAFE] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px] text-[#475569]">close</span>
                      </button>
                      <Input
                        placeholder="Medicine name (e.g., Augmentin)"
                        value={med.brandName}
                        onChange={(e) => updateManualMedicine(idx, 'brandName', e.target.value)}
                        className="mb-3 h-11 bg-white rounded-xl text-sm border-0 focus-visible:ring-2 focus-visible:ring-[#3B82F6]/20"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          placeholder="Dosage"
                          value={med.dosage}
                          onChange={(e) => updateManualMedicine(idx, 'dosage', e.target.value)}
                          className="h-9 text-xs bg-white rounded-xl border-0 focus-visible:ring-2 focus-visible:ring-[#3B82F6]/20"
                        />
                        <Select
                          value={med.frequency}
                          onValueChange={(value) => updateManualMedicine(idx, 'frequency', value)}
                        >
                          <SelectTrigger className="h-9 text-xs bg-white rounded-xl border-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OD">OD</SelectItem>
                            <SelectItem value="BD">BD</SelectItem>
                            <SelectItem value="TDS">TDS</SelectItem>
                            <SelectItem value="QID">QID</SelectItem>
                            <SelectItem value="SOS">SOS</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Duration"
                          value={med.duration}
                          onChange={(e) => updateManualMedicine(idx, 'duration', e.target.value)}
                          className="h-9 text-xs bg-white rounded-xl border-0 focus-visible:ring-2 focus-visible:ring-[#3B82F6]/20"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addManualMedicine}
                    className="w-full py-3 rounded-xl bg-[#EFF6FF] text-[#3B82F6] text-sm font-semibold hover:bg-[#DBEAFE] transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Add Medicine
                  </button>

                  {manualMedicines.length > 0 && (
                    <button
                      onClick={analyzeManual}
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#2563EB] transition-colors disabled:opacity-50"
                    >
                      Analyze Medicines
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6">
              <DisclaimerBanner />
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <AnalysisLoader estimatedSeconds={60} agentCount={6} variant="prescription" />
        )}

        {/* Results */}
        {pipelineState && !loading && (
          <div className="space-y-8">

            {/* ============================================================ */}
            {/* 1. CRITICAL INTERACTION ALERT — gradient banner              */}
            {/* ============================================================ */}
            {hasCriticalInteraction && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#bd0c3b] to-[#9f403d] text-white p-6 pl-8"
              >
                {/* Left thick accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white/30" />
                <div className="flex items-start gap-4">
                  <motion.span
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="material-symbols-outlined text-[28px] text-white mt-0.5"
                  >
                    warning
                  </motion.span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1">Critical Interaction Alert</h3>
                    <p className="text-sm text-white/85">
                      {interactions.filter((i) => i.severity === 'major' || i.severity === 'contraindicated').length} serious
                      drug interaction{interactions.filter((i) => i.severity === 'major' || i.severity === 'contraindicated').length > 1 ? 's' : ''} detected.
                      Please consult your physician immediately.
                    </p>
                    <div className="mt-4 space-y-2">
                      {interactions
                        .filter((i) => i.severity === 'major' || i.severity === 'contraindicated')
                        .map((interaction, i) => (
                          <motion.div
                            key={i}
                            initial="hidden"
                            animate="visible"
                            custom={i}
                            variants={fadeUp}
                            className="bg-white/15 backdrop-blur-sm rounded-lg px-4 py-3 text-sm"
                          >
                            <span className="font-bold">{interaction.drug1}</span>
                            <span className="mx-2 text-white/60">+</span>
                            <span className="font-bold">{interaction.drug2}</span>
                            <p className="text-white/80 mt-1 text-xs">{interaction.description}</p>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ============================================================ */}
            {/* BENTO GRID                                                    */}
            {/* ============================================================ */}
            <div className="grid grid-cols-12 gap-6">

              {/* ======================================================== */}
              {/* LEFT COLUMN                                               */}
              {/* ======================================================== */}
              <div className="col-span-12 lg:col-span-8 space-y-6">

                {/* ---------------------------------------------------- */}
                {/* 2. MEDICATIONS SECTION — accent strip cards            */}
                {/* ---------------------------------------------------- */}
                <h2 className="font-headline text-xl font-bold text-[#00345e]">
                  Medications ({ocrMedicines.length || drugs.length})
                </h2>

                {/* OCR Extracted Medicines */}
                {ocrMedicines.map((med, i) => {
                  const drugInfo = drugs.find((d) => d.brandName.toLowerCase() === med.brandName.toLowerCase());
                  const dosageInfo = dosages.find((d) => d.original.toLowerCase().includes(med.brandName.toLowerCase()));
                  const accentColor = ACCENT_CYCLE[i % ACCENT_CYCLE.length];
                  const isExpanded = expandedMed === i;

                  return (
                    <motion.div
                      key={i}
                      initial="hidden"
                      animate="visible"
                      custom={i}
                      variants={fadeUp}
                      whileHover={{ y: -2, boxShadow: '0 8px 40px -10px rgba(0,52,94,0.12)' }}
                      className="relative bg-white rounded-xl overflow-hidden shadow-[0_4px_40px_-10px_rgba(0,52,94,0.06)] cursor-pointer transition-shadow"
                      onClick={() => setExpandedMed(isExpanded ? null : i)}
                    >
                      {/* Left accent strip */}
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: accentColor }} />

                      <div className="pl-6 pr-6 pt-6 pb-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-[#00345e]">{med.brandName}</h3>
                            {drugInfo && (
                              <p className="text-sm text-[#3B82F6] font-medium mt-0.5">{drugInfo.saltComposition}</p>
                            )}
                          </div>
                          <ConfidenceRing value={med.confidence} />
                        </div>

                        {/* Pill badges for dosage/frequency/duration */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#00345e] text-xs font-semibold px-3 py-1.5 rounded-full">
                            <span className="material-symbols-outlined text-[14px] text-[#3B82F6]">medication</span>
                            {med.dosage}
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#00345e] text-xs font-semibold px-3 py-1.5 rounded-full">
                            <span className="material-symbols-outlined text-[14px] text-[#3B82F6]">schedule</span>
                            {med.frequency}
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#00345e] text-xs font-semibold px-3 py-1.5 rounded-full">
                            <span className="material-symbols-outlined text-[14px] text-[#3B82F6]">event</span>
                            {med.duration}
                          </span>
                        </div>

                        {/* Expandable detail */}
                        <AnimatePresence>
                          {isExpanded && drugInfo && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="pt-3 border-t border-[#EFF6FF]">
                                <p className="text-xs uppercase tracking-widest text-[#475569] mb-1">Purpose</p>
                                <p className="text-sm text-[#00345e]">{drugInfo.mechanism}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {dosageInfo && !dosageInfo.isWithinRange && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-4 bg-[#bd0c3b]/5 rounded-xl p-4 flex items-start gap-2"
                          >
                            <span className="material-symbols-outlined text-[18px] text-[#bd0c3b] mt-0.5">error</span>
                            <div>
                              <p className="text-sm font-semibold text-[#bd0c3b]">Dosage outside standard range</p>
                              {dosageInfo.warnings.map((w, j) => (
                                <p key={j} className="text-xs text-[#bd0c3b]/80 mt-0.5">{w}</p>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Fallback: Drug cards when no OCR data */}
                {ocrMedicines.length === 0 && drugs.length > 0 && drugs.map((drug, i) => {
                  const accentColor = ACCENT_CYCLE[i % ACCENT_CYCLE.length];
                  return (
                    <motion.div
                      key={i}
                      initial="hidden"
                      animate="visible"
                      custom={i}
                      variants={fadeUp}
                      whileHover={{ y: -2, boxShadow: '0 8px 40px -10px rgba(0,52,94,0.12)' }}
                      className="relative bg-white rounded-xl overflow-hidden shadow-[0_4px_40px_-10px_rgba(0,52,94,0.06)] transition-shadow"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: accentColor }} />
                      <div className="pl-6 pr-6 pt-6 pb-5">
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-[#00345e]">{drug.brandName}</h3>
                          <p className="text-sm text-[#3B82F6] font-medium mt-0.5">{drug.saltComposition}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#00345e] text-xs font-semibold px-3 py-1.5 rounded-full">
                            <span className="material-symbols-outlined text-[14px] text-[#3B82F6]">category</span>
                            {drug.drugClass}
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#00345e] text-xs font-semibold px-3 py-1.5 rounded-full">
                            <span className="material-symbols-outlined text-[14px] text-[#3B82F6]">medication</span>
                            {drug.standardDosage}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-[#EFF6FF]">
                          <p className="text-xs uppercase tracking-widest text-[#475569] mb-1">Mechanism</p>
                          <p className="text-sm text-[#00345e]">{drug.mechanism}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {ocrMedicines.length === 0 && drugs.length === 0 && (
                  <div className="bg-white rounded-xl p-12 text-center shadow-[0_4px_40px_-10px_rgba(0,52,94,0.06)]">
                    <span className="material-symbols-outlined text-[48px] text-[#DBEAFE] mb-3 block">medication</span>
                    <p className="text-sm text-[#475569]">No medications extracted</p>
                  </div>
                )}

                {/* ---------------------------------------------------- */}
                {/* 3. DRUG INTERACTIONS — gradient background strips      */}
                {/* ---------------------------------------------------- */}
                {interactions.length > 0 && !hasCriticalInteraction && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    custom={2}
                    variants={fadeUp}
                    className="rounded-xl bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] p-6"
                  >
                    <h3 className="font-headline text-lg font-bold text-[#00345e] mb-5 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[22px] text-[#3B82F6]">compare_arrows</span>
                      Drug Interactions
                    </h3>
                    <div className="space-y-3">
                      {interactions.map((interaction, i) => {
                        const sevColor = interaction.severity === 'minor' ? '#3B82F6'
                          : interaction.severity === 'moderate' ? '#D97706'
                          : '#bd0c3b';
                        return (
                          <motion.div
                            key={i}
                            initial="hidden"
                            animate="visible"
                            custom={i}
                            variants={fadeUp}
                            className="bg-white/80 backdrop-blur-sm rounded-xl overflow-hidden flex"
                          >
                            {/* Severity color edge */}
                            <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: sevColor }} />
                            <div className="flex-1 p-4">
                              <div className="flex items-center gap-2 mb-2">
                                {/* Severity badge shapes */}
                                {interaction.severity === 'minor' && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide" style={{ backgroundColor: `${sevColor}15`, color: sevColor }}>
                                    {interaction.severity}
                                  </span>
                                )}
                                {interaction.severity === 'moderate' && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide" style={{ backgroundColor: `${sevColor}15`, color: sevColor, clipPath: 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)' }}>
                                    <span className="px-1">{interaction.severity}</span>
                                  </span>
                                )}
                                {(interaction.severity === 'major' || interaction.severity === 'contraindicated') && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide" style={{ backgroundColor: `${sevColor}15`, color: sevColor, clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                                    <span className="px-1">{interaction.severity}</span>
                                  </span>
                                )}

                                <div className="flex items-center gap-1.5 text-sm font-semibold text-[#00345e]">
                                  <span>{interaction.drug1}</span>
                                  <span className="material-symbols-outlined text-[16px] text-[#475569]">link</span>
                                  <span>{interaction.drug2}</span>
                                </div>
                              </div>
                              <p className="text-sm text-[#00345e]">{interaction.description}</p>
                              <p className="text-xs text-[#475569] mt-1.5">{interaction.management}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {interactions.length === 0 && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    custom={2}
                    variants={fadeUp}
                    className="bg-[#EDE9FE]/20 rounded-xl p-6 flex items-center gap-3"
                  >
                    <span className="material-symbols-outlined text-[24px] text-[#7C3AED]">check_circle</span>
                    <p className="text-sm font-semibold text-[#7C3AED]">No significant drug interactions detected</p>
                  </motion.div>
                )}

                {/* ---------------------------------------------------- */}
                {/* 4. ALTERNATIVES — dark inverted card                   */}
                {/* ---------------------------------------------------- */}
                {Object.keys(alternatives).length > 0 && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    custom={3}
                    variants={fadeUp}
                    className="relative rounded-xl bg-[#00345e] text-white p-6 overflow-hidden"
                  >
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
                    <h3 className="font-headline text-lg font-bold mb-5 flex items-center gap-2 relative z-10">
                      <span className="material-symbols-outlined text-[22px] text-[#EDE9FE]">swap_horiz</span>
                      Alternative Medicines
                    </h3>
                    <div className="relative z-10 space-y-5">
                      {Object.entries(alternatives).map(([drug, alts]) => (
                        <div key={drug}>
                          <p className="text-xs uppercase tracking-widest text-white/50 mb-3">Alternatives for {drug}</p>
                          {(alts as AlternativeMedicine[]).length === 0 ? (
                            <p className="text-sm text-white/60">No alternatives found</p>
                          ) : (
                            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
                              {(alts as AlternativeMedicine[]).map((alt, i) => (
                                <motion.div
                                  key={i}
                                  initial="hidden"
                                  animate="visible"
                                  custom={i}
                                  variants={popIn}
                                  className="inline-flex flex-col bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[160px] hover:bg-white/15 transition-colors"
                                >
                                  <p className="text-sm font-semibold text-white">{alt.brandName}</p>
                                  <p className="text-xs text-white/60 mt-0.5">{alt.saltComposition}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-white/40">{alt.manufacturer}</span>
                                    {alt.priceRange && (
                                      <span className="text-xs font-semibold bg-[#EDE9FE]/20 text-[#EDE9FE] px-2 py-0.5 rounded-full">
                                        PKR {alt.priceRange}
                                      </span>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ======================================================== */}
              {/* RIGHT COLUMN — Patient Intelligence Sidebar              */}
              {/* ======================================================== */}
              <div className="col-span-12 lg:col-span-4 space-y-5">

                {/* ---------------------------------------------------- */}
                {/* 5a. SIDE EFFECTS — tag cloud with varying sizes        */}
                {/* ---------------------------------------------------- */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  custom={1}
                  variants={fadeUp}
                  className="rounded-xl p-6 shadow-[0_4px_40px_-10px_rgba(0,52,94,0.06)] relative overflow-hidden"
                  style={{
                    backgroundColor: 'white',
                    backgroundImage: 'radial-gradient(circle, #DBEAFE 1px, transparent 1px)',
                    backgroundSize: '16px 16px',
                  }}
                >
                  <h3 className="font-headline text-base font-bold text-[#00345e] mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#bd0c3b]">report</span>
                    Side Effects
                  </h3>
                  {drugs.length > 0 ? (
                    <div className="space-y-4">
                      {drugs.map((drug, i) => (
                        <div key={i}>
                          <p className="text-xs uppercase tracking-widest text-[#475569] mb-2">{drug.brandName}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {drug.sideEffects.map((effect, j) => {
                              // First few = common (larger), later = rarer (smaller)
                              const isCommon = j < 3;
                              const isRare = j >= 5;
                              return (
                                <motion.span
                                  key={j}
                                  initial="hidden"
                                  animate="visible"
                                  custom={j}
                                  variants={popIn}
                                  className={cn(
                                    'inline-block rounded-lg bg-white border border-[#EFF6FF]',
                                    isCommon
                                      ? 'text-sm font-semibold text-[#00345e] px-3 py-1.5'
                                      : isRare
                                        ? 'text-[10px] text-[#475569] px-2 py-1'
                                        : 'text-xs text-[#00345e] px-2.5 py-1'
                                  )}
                                >
                                  {effect}
                                </motion.span>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#475569]">No side effect data available</p>
                  )}
                </motion.div>

                {/* ---------------------------------------------------- */}
                {/* 5b. PRECAUTIONS — amber themed card                   */}
                {/* ---------------------------------------------------- */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  custom={2}
                  variants={fadeUp}
                  className="rounded-xl p-6 shadow-[0_4px_40px_-10px_rgba(0,52,94,0.06)] bg-[#FFFBEB]"
                >
                  <h3 className="font-headline text-base font-bold text-[#92400E] mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-[#D97706]">shield</span>
                    Precautions
                  </h3>
                  {drugs.length > 0 ? (
                    <div className="space-y-4">
                      {drugs.map((drug, i) => (
                        <div key={i}>
                          <p className="text-xs uppercase tracking-widest text-[#92400E]/60 mb-2">{drug.brandName}</p>
                          {drug.contraindications.length > 0 && (
                            <div className="space-y-1.5 mb-2">
                              {drug.contraindications.map((c, j) => (
                                <div key={j} className="flex items-start gap-2 text-sm text-[#92400E] bg-white/60 rounded-lg px-3 py-2 border-l-[3px] border-[#bd0c3b]">
                                  <span className="material-symbols-outlined text-[16px] text-[#bd0c3b] mt-0.5 flex-shrink-0">block</span>
                                  {c}
                                </div>
                              ))}
                            </div>
                          )}
                          {drug.foodInteractions.length > 0 && (
                            <div className="space-y-1.5">
                              {drug.foodInteractions.map((f, j) => (
                                <div key={j} className="flex items-start gap-2 text-sm text-[#92400E] bg-white/60 rounded-lg px-3 py-2 border-l-[3px] border-[#3B82F6]">
                                  <span className="material-symbols-outlined text-[16px] text-[#3B82F6] mt-0.5 flex-shrink-0">restaurant</span>
                                  {f}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#92400E]/60">No precaution data available</p>
                  )}
                </motion.div>

                {/* ---------------------------------------------------- */}
                {/* 5c. DOSAGE INSIGHTS — clock card timeline              */}
                {/* ---------------------------------------------------- */}
                {dosages.length > 0 && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    custom={3}
                    variants={fadeUp}
                    className="rounded-xl p-6 shadow-[0_4px_40px_-10px_rgba(0,52,94,0.06)] bg-white"
                  >
                    <h3 className="font-headline text-base font-bold text-[#00345e] mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-[#7C3AED]">schedule</span>
                      Dosage Insights
                    </h3>
                    <div className="relative space-y-0">
                      {/* Timeline line */}
                      <div className="absolute left-[17px] top-6 bottom-6 w-px bg-[#DBEAFE]" />

                      {dosages.map((d, i) => {
                        const isOk = d.isWithinRange;
                        const ringColor = isOk ? '#7C3AED' : '#bd0c3b';
                        return (
                          <motion.div
                            key={i}
                            initial="hidden"
                            animate="visible"
                            custom={i}
                            variants={fadeUp}
                            className="relative flex gap-4 py-3"
                          >
                            {/* Clock icon node */}
                            <div className="relative z-10 flex-shrink-0">
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${ringColor}15` }}
                              >
                                <span className="material-symbols-outlined text-[18px]" style={{ color: ringColor }}>
                                  {isOk ? 'check_circle' : 'error'}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 bg-[#f8f9ff] rounded-xl p-3">
                              <p className="text-xs font-mono text-[#475569] mb-1">{d.original}</p>
                              <p className="text-sm font-medium text-[#00345e]">{d.plainLanguage}</p>
                              <div className={cn(
                                'inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold',
                                isOk ? 'bg-[#EDE9FE] text-[#7C3AED]' : 'bg-[#bd0c3b]/10 text-[#bd0c3b]'
                              )}>
                                {isOk ? 'Within range' : 'Outside range'}
                              </div>
                              {d.warnings.length > 0 && (
                                <div className="mt-2">
                                  {d.warnings.map((w, j) => (
                                    <p key={j} className="text-xs text-[#bd0c3b]">{w}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ---------------------------------------------------- */}
                {/* 7. PIPELINE PROGRESS — with scan line                  */}
                {/* ---------------------------------------------------- */}
                {pipelineState && (
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    custom={4}
                    variants={fadeUp}
                    className="relative overflow-hidden rounded-xl"
                  >
                    {/* Animated scan line */}
                    <motion.div
                      className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[#3B82F6]/30 to-transparent z-10 pointer-events-none"
                      animate={{ top: ['0%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                    <PipelineProgress state={pipelineState} />
                  </motion.div>
                )}

                <DisclaimerBanner />
              </div>
            </div>

            {/* ============================================================ */}
            {/* 6. PATIENT INSTRUCTIONS — horizontal scrollable tall cards   */}
            {/* ============================================================ */}
            {guides.length > 0 && (
              <motion.div
                initial="hidden"
                animate="visible"
                custom={5}
                variants={fadeUp}
              >
                <h2 className="font-headline text-xl font-bold text-[#00345e] mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[24px] text-[#3B82F6]">menu_book</span>
                  Patient Instructions
                </h2>
                <div className="flex gap-5 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory">
                  {guides.map((guide, i) => {
                    const headerColor = GUIDE_PALETTE[i % GUIDE_PALETTE.length];
                    return (
                      <motion.div
                        key={i}
                        initial="hidden"
                        animate="visible"
                        custom={i}
                        variants={fadeUp}
                        whileHover={{ y: -4, boxShadow: '0 12px 40px -10px rgba(0,52,94,0.15)' }}
                        className="flex-shrink-0 w-[340px] bg-white rounded-xl overflow-hidden shadow-[0_4px_40px_-10px_rgba(0,52,94,0.06)] snap-start transition-shadow"
                      >
                        {/* Colored header bar */}
                        <div className="px-5 py-4" style={{ backgroundColor: headerColor }}>
                          <h4 className="font-headline text-base font-bold text-white">{guide.medicineName}</h4>
                          <p className="text-xs text-white/70 mt-0.5">{guide.saltName}</p>
                        </div>

                        <div className="p-5 space-y-4">
                          {/* What it does */}
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-[18px] text-[#3B82F6]">pill</span>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-widest text-[#475569] mb-0.5">What it does</p>
                              <p className="text-sm text-[#00345e]">{guide.whatItDoes}</p>
                            </div>
                          </div>

                          {/* How to take */}
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-[18px] text-[#3B82F6]">schedule</span>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-widest text-[#475569] mb-0.5">How to take</p>
                              <p className="text-sm text-[#00345e]">{guide.howToTake}</p>
                            </div>
                          </div>

                          {/* Do's — green tinted */}
                          {guide.dos.length > 0 && (
                            <div className="bg-[#f0fdf4] rounded-xl p-3">
                              <p className="text-xs uppercase tracking-widest text-[#7C3AED] font-semibold mb-2">Do&apos;s</p>
                              <ul className="space-y-1.5">
                                {guide.dos.map((d, j) => (
                                  <li key={j} className="text-sm text-[#00345e] flex items-start gap-2">
                                    <span className="material-symbols-outlined text-[16px] text-[#7C3AED] mt-0.5">check_circle</span>
                                    {d}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Don'ts — red tinted */}
                          {guide.donts.length > 0 && (
                            <div className="bg-[#fef2f2] rounded-xl p-3">
                              <p className="text-xs uppercase tracking-widest text-[#bd0c3b] font-semibold mb-2">Don&apos;ts</p>
                              <ul className="space-y-1.5">
                                {guide.donts.map((d, j) => (
                                  <li key={j} className="text-sm text-[#00345e] flex items-start gap-2">
                                    <span className="material-symbols-outlined text-[16px] text-[#bd0c3b] mt-0.5">cancel</span>
                                    {d}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* When to call doctor */}
                          {guide.whenToCallDoctor.length > 0 && (
                            <div>
                              <p className="text-xs uppercase tracking-widest text-[#bd0c3b] mb-1.5">When to call doctor</p>
                              <ul className="space-y-1">
                                {guide.whenToCallDoctor.map((w, j) => (
                                  <li key={j} className="text-sm text-[#00345e] flex items-start gap-2">
                                    <span className="material-symbols-outlined text-[16px] text-[#bd0c3b] mt-0.5">emergency</span>
                                    {w}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ============================================================ */}
            {/* 8. FLOATING REPORT SUMMARY — sticky glass card               */}
            {/* ============================================================ */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="sticky bottom-6 z-40"
            >
              <div className="max-w-xl mx-auto bg-white/90 backdrop-blur-md rounded-xl px-6 py-4 shadow-[0_8px_40px_-10px_rgba(0,52,94,0.18)] flex items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#3B82F6]">
                      <CountUp target={totalMeds} />
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-[#475569]">Medicines</p>
                  </div>
                  <div className="w-px h-8 bg-[#DBEAFE]" />
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#00345e]">
                      <CountUp target={interactions.length} />
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-[#475569]">Interactions</p>
                  </div>
                  <div className="w-px h-8 bg-[#DBEAFE]" />
                  <div className="text-center">
                    <p className={cn('text-xl font-bold', dosageAlerts > 0 ? 'text-[#bd0c3b]' : 'text-[#7C3AED]')}>
                      <CountUp target={dosageAlerts} />
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-[#475569]">Alerts</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#3B82F6]">summarize</span>
                  <span className="text-xs font-semibold text-[#00345e]">Report Summary</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </main>

      <Footer />

      {/* Share Modal */}
      <ShareResultModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Prescription Analysis Report"
        summary={shareSummaryText}
      />
    </div>
  );
}
