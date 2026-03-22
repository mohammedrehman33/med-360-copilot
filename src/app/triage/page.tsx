'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from '@/components/ui/select';
import { MEDICAL_DISCLAIMER } from '@/lib/constants';
import ShareResultModal from '@/components/ui/ShareResultModal';
import AnalysisLoader from '@/components/ui/AnalysisLoader';

/* ── types ────────────────────────────────────────────────────────── */

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

const STEPS = ['Basic Info', 'Symptoms', 'Medical History', 'Assessment'];
const STEP_ICONS = ['person', 'vital_signs', 'clinical_notes', 'psychology'];

const AI_PROMPTS: Record<number, string> = {
  0: "Hello! I'm your AI triage assistant. Let's start with some basic information about you so I can provide a more accurate assessment.",
  1: 'Thank you. Now, please describe the symptoms you are experiencing. The more detail you provide, the better I can help.',
  2: "Almost there. Do you have any relevant medical history, current medications, or allergies? This is optional but helps me consider interactions and risk factors.",
};

const urgencyConfig: Record<string, { label: string; color: string; bg: string; icon: string; pct: number }> = {
  emergency:    { label: 'Emergency',    color: '#DC2626', bg: '#FEF2F2', icon: 'emergency',       pct: 100 },
  urgent:       { label: 'Urgent',       color: '#EA580C', bg: '#FFF7ED', icon: 'warning',         pct: 75 },
  'semi-urgent':{ label: 'Semi-Urgent',  color: '#D97706', bg: '#FFFBEB', icon: 'schedule',        pct: 50 },
  'non-urgent': { label: 'Non-Urgent',   color: '#16A34A', bg: '#F0FDF4', icon: 'check_circle',    pct: 25 },
};

/* ── page ─────────────────────────────────────────────────────────── */

export default function TriagePage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState('');
  const [shareOpen, setShareOpen] = useState(false);

  // Step 1: Basic Info
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [pregnancyStatus, setPregnancyStatus] = useState('');

  // Step 2: Symptoms
  const [mainSymptom, setMainSymptom] = useState('');
  const [duration, setDuration] = useState('');
  const [severity, setSeverity] = useState('5');
  const [additionalSymptoms, setAdditionalSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState('');

  // Step 3: Medical History
  const [medications, setMedications] = useState<string[]>([]);
  const [medicationInput, setMedicationInput] = useState('');
  const [allergies, setAllergies] = useState('');
  const [chronicConditions, setChronicConditions] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState('');

  /* ── helpers (unchanged) ──────────────────────────────────────── */

  const addTag = (
    value: string,
    setter: (v: string) => void,
    list: string[],
    listSetter: (v: string[]) => void,
  ) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      listSetter([...list, trimmed]);
    }
    setter('');
  };

  const removeTag = (index: number, list: string[], listSetter: (v: string[]) => void) => {
    listSetter(list.filter((_, i) => i !== index));
  };

  const canProceed = (): boolean => {
    if (step === 0) return !!age && !!gender;
    if (step === 1) return !!mainSymptom && !!duration && !!severity;
    if (step === 2) return true;
    return false;
  };

  const handleSubmit = async () => {
    setStep(3);
    setLoading(true);
    setError('');
    setLoadingProgress(0);

    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) { clearInterval(interval); return 90; }
        return prev + Math.random() * 15;
      });
    }, 400);

    try {
      const res = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(age),
          gender,
          pregnancyStatus: gender === 'Female' ? pregnancyStatus : undefined,
          mainSymptom,
          duration,
          severity: parseInt(severity),
          additionalSymptoms,
          medications,
          allergies,
          chronicConditions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Assessment failed');
      }

      clearInterval(interval);
      setLoadingProgress(100);

      setTimeout(() => {
        setResult(data.result);
        setLoading(false);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setResult(null);
    setError('');
    setLoading(false);
    setLoadingProgress(0);
    setAge('');
    setGender('');
    setPregnancyStatus('');
    setMainSymptom('');
    setDuration('');
    setSeverity('5');
    setAdditionalSymptoms([]);
    setSymptomInput('');
    setMedications([]);
    setMedicationInput('');
    setAllergies('');
    setChronicConditions([]);
    setConditionInput('');
  };

  /* ── reusable tag input ───────────────────────────────────────── */

  const renderTagInput = (
    label: string,
    placeholder: string,
    inputValue: string,
    setInputValue: (v: string) => void,
    tags: string[],
    setTags: (v: string[]) => void,
  ) => (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
        {label}
      </label>
      <div className="flex gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag(inputValue, setInputValue, tags, setTags);
            }
          }}
          className="flex-1 bg-white border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
          style={{ color: '#00345e' }}
        />
        <button
          type="button"
          onClick={() => addTag(inputValue, setInputValue, tags, setTags)}
          disabled={!inputValue.trim()}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity"
          style={{ background: '#3B82F6' }}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ background: '#EDE9FE', color: '#00345e' }}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i, tags, setTags)}
                className="hover:opacity-70 transition-opacity"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );

  /* ── AI chat bubble ───────────────────────────────────────────── */

  const AiBubble = ({ message }: { message: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 mb-6"
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: '#DBEAFE' }}
      >
        <span className="material-symbols-outlined text-[20px]" style={{ color: '#3B82F6' }}>smart_toy</span>
      </div>
      <div
        className="bg-white p-6 rounded-xl rounded-tl-none shadow-sm flex-1"
        style={{ color: '#00345e' }}
      >
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </motion.div>
  );

  /* ── quick-reply chips ────────────────────────────────────────── */

  const QuickChips = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
    <div className="flex flex-wrap gap-2 mb-4">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="px-5 py-2.5 rounded-full text-sm font-medium transition-all"
          style={{
            background: value === opt ? '#3B82F6' : '#EDE9FE',
            color: value === opt ? '#ffffff' : '#00345e',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  /* ── step renderers ───────────────────────────────────────────── */

  const renderStep0 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <AiBubble message={AI_PROMPTS[0]} />

      <div className="space-y-5 pl-[52px]">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
            Age <span style={{ color: '#bd0c3b' }}>*</span>
          </label>
          <input
            type="number"
            min={0}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
            className="w-full max-w-[200px] bg-white border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
            style={{ color: '#00345e' }}
          />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
            Gender <span style={{ color: '#bd0c3b' }}>*</span>
          </label>
          <QuickChips options={['Male', 'Female', 'Other']} value={gender} onChange={setGender} />
        </div>

        {gender === 'Female' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
              Are you currently pregnant?
            </label>
            <QuickChips options={['Yes', 'No', 'Not sure']} value={pregnancyStatus} onChange={setPregnancyStatus} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <AiBubble message={AI_PROMPTS[1]} />

      <div className="space-y-5 pl-[52px]">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
            Main symptom or concern <span style={{ color: '#bd0c3b' }}>*</span>
          </label>
          <textarea
            value={mainSymptom}
            onChange={(e) => setMainSymptom(e.target.value)}
            placeholder="e.g., I've been having a sharp pain in my lower right abdomen that gets worse when I move..."
            className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm outline-none min-h-[100px] resize-none focus:ring-2 focus:ring-[#3B82F6]/20"
            style={{ color: '#00345e' }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
              Duration <span style={{ color: '#bd0c3b' }}>*</span>
            </label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="bg-white border-none rounded-xl h-11 text-sm" style={{ color: '#00345e' }}>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Less than an hour">Less than an hour</SelectItem>
                <SelectItem value="A few hours">A few hours</SelectItem>
                <SelectItem value="1 day">1 day</SelectItem>
                <SelectItem value="2-3 days">2-3 days</SelectItem>
                <SelectItem value="4-7 days">4-7 days</SelectItem>
                <SelectItem value="1-2 weeks">1-2 weeks</SelectItem>
                <SelectItem value="2-4 weeks">2-4 weeks</SelectItem>
                <SelectItem value="1-3 months">1-3 months</SelectItem>
                <SelectItem value="More than 3 months">More than 3 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
              Severity (1-10) <span style={{ color: '#bd0c3b' }}>*</span>
            </label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="bg-white border-none rounded-xl h-11 text-sm" style={{ color: '#00345e' }}>
                <SelectValue placeholder="Rate severity" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n} {n <= 3 ? '- Mild' : n <= 6 ? '- Moderate' : n <= 8 ? '- Severe' : '- Very Severe'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {renderTagInput(
          'Additional symptoms (optional)',
          'e.g., headache, nausea, fever...',
          symptomInput,
          setSymptomInput,
          additionalSymptoms,
          setAdditionalSymptoms,
        )}
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <AiBubble message={AI_PROMPTS[2]} />

      <div className="space-y-5 pl-[52px]">
        {renderTagInput(
          'Current medications',
          'e.g., Lisinopril 10mg, Metformin...',
          medicationInput,
          setMedicationInput,
          medications,
          setMedications,
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
            Known allergies
          </label>
          <input
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="e.g., Penicillin, peanuts, latex..."
            className="w-full bg-white border-none rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
            style={{ color: '#00345e' }}
          />
        </div>

        {renderTagInput(
          'Chronic conditions',
          'e.g., Diabetes, hypertension, asthma...',
          conditionInput,
          setConditionInput,
          chronicConditions,
          setChronicConditions,
        )}
      </div>
    </motion.div>
  );

  /* ── loading state ────────────────────────────────────────────── */

  const renderLoadingState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <AnalysisLoader estimatedSeconds={25} agentCount={4} variant="triage" />
    </motion.div>
  );

  /* ── error state ──────────────────────────────────────────────── */

  const renderError = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-white p-10 rounded-xl shadow-sm text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: '#FEF2F2' }}
        >
          <span className="material-symbols-outlined text-[28px]" style={{ color: '#DC2626' }}>warning</span>
        </div>
        <h3 className="text-lg font-semibold mb-2 font-headline" style={{ color: '#00345e' }}>
          Assessment failed
        </h3>
        <p className="text-sm mb-6" style={{ color: '#475569' }}>
          {error}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{ background: '#EFF6FF', color: '#3B82F6' }}
          >
            Start Over
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
            style={{ background: '#3B82F6' }}
          >
            Try Again
          </button>
        </div>
      </div>
    </motion.div>
  );

  /* ── results ──────────────────────────────────────────────────── */

  const renderResults = () => {
    if (!result) return null;
    const urgency = urgencyConfig[result.urgencyLevel] || urgencyConfig['non-urgent'];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Analysis Summary */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6" style={{ background: urgency.bg }}>
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: urgency.color + '20' }}
              >
                <span className="material-symbols-outlined text-[28px]" style={{ color: urgency.color }}>{urgency.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: '#475569' }}
                  >
                    Analysis Summary
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-white"
                    style={{ background: urgency.color }}
                  >
                    {urgency.label}
                  </span>
                </div>
                {/* Urgency Gauge */}
                <div className="mb-3">
                  <div className="h-2.5 rounded-full w-full" style={{ background: '#DBEAFE' }}>
                    <div
                      className="h-2.5 rounded-full transition-all duration-700"
                      style={{ background: urgency.color, width: `${urgency.pct}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#00345e' }}>
                  {result.assessment}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Likely Conditions — clickable, links to marham.pk specialist */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[20px]" style={{ color: '#3B82F6' }}>stethoscope</span>
            <h3 className="text-base font-semibold font-headline" style={{ color: '#00345e' }}>Possible Conditions</h3>
          </div>
          <p className="text-xs mb-4" style={{ color: '#475569' }}>
            These are possibilities only — a healthcare professional must evaluate you. Click any condition to find the right specialist on Marham.pk.
          </p>
          <div className="space-y-3">
            {result.possibleConditions.map((condition, i) => {
              const spec = result.recommendedSpecialists?.find(
                (s) => s.condition.toLowerCase() === condition.toLowerCase()
              );
              const marhamUrl = spec
                ? `https://www.marham.pk/doctors/${spec.marhamSlug}`
                : `https://www.marham.pk/doctors/general-physician`;

              return (
                <a
                  key={i}
                  href={marhamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl transition-all hover:shadow-md group cursor-pointer"
                  style={{ background: '#EFF6FF' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#DBEAFE' }}
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ color: '#3B82F6' }}>
                        medical_services
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#00345e' }}>{condition}</p>
                      {spec && (
                        <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
                          Recommended: <strong>{spec.specialist}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-bold px-3 py-1.5 rounded-full"
                      style={{ background: '#3B82F6', color: '#f3f8ff' }}
                    >
                      Find Doctor
                    </span>
                    <span
                      className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform"
                      style={{ color: '#3B82F6' }}
                    >
                      arrow_forward
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[20px]" style={{ color: '#3B82F6' }}>task_alt</span>
            <h3 className="text-base font-semibold font-headline" style={{ color: '#00345e' }}>Recommended Actions</h3>
          </div>
          <ul className="space-y-3">
            {result.recommendedActions.map((action, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: '#DBEAFE', color: '#3B82F6' }}
                >
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed" style={{ color: '#00345e' }}>
                  {action}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Self-Care Tips */}
        {result.selfCareAdvice.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[20px]" style={{ color: '#7C3AED' }}>favorite</span>
              <h3 className="text-base font-semibold font-headline" style={{ color: '#00345e' }}>Self-Care Tips</h3>
            </div>
            <ul className="space-y-2">
              {result.selfCareAdvice.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#00345e' }}>
                  <span style={{ color: '#7C3AED' }} className="mt-0.5">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warning Signs */}
        <div className="rounded-xl shadow-sm p-6" style={{ background: '#FFFBEB' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[20px]" style={{ color: '#D97706' }}>warning</span>
            <h3 className="text-base font-semibold font-headline" style={{ color: '#92400E' }}>Warning Signs to Watch</h3>
          </div>
          <ul className="space-y-2">
            {result.warningSignsToWatch.map((sign, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#92400E' }}>
                <span className="material-symbols-outlined text-[16px] mt-0.5" style={{ color: '#D97706' }}>report</span>
                {sign}
              </li>
            ))}
          </ul>
        </div>

        {/* Emergency Care */}
        <div className="rounded-xl shadow-sm p-6" style={{ background: '#FEF2F2' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[20px]" style={{ color: '#DC2626' }}>emergency</span>
            <h3 className="text-base font-semibold font-headline" style={{ color: '#991B1B' }}>Seek Emergency Care If...</h3>
          </div>
          <ul className="space-y-2">
            {result.whenToSeekEmergencyCare.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-medium" style={{ color: '#991B1B' }}>
                <span className="material-symbols-outlined text-[16px] mt-0.5" style={{ color: '#DC2626' }}>shield</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Consult on Marham.pk CTA */}
        {(() => {
          const primarySpec = result.recommendedSpecialists?.[0];
          const ctaUrl = primarySpec
            ? `https://www.marham.pk/doctors/${primarySpec.marhamSlug}`
            : 'https://www.marham.pk/doctors/general-physician';
          const ctaLabel = primarySpec
            ? `Find a ${primarySpec.specialist} on Marham`
            : 'Find a Doctor on Marham';

          return (
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-lg transition-shadow"
              style={{ background: '#3B82F6' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <span className="material-symbols-outlined text-[28px] text-white">local_hospital</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white font-headline">Book a Doctor on Marham.pk</h3>
                  <p className="text-sm text-white/80">
                    {primarySpec
                      ? `Based on your assessment, we recommend consulting a ${primarySpec.specialist}`
                      : 'Connect with a verified healthcare professional'}
                  </p>
                </div>
              </div>
              <div
                className="px-6 py-3 rounded-xl text-sm font-bold whitespace-nowrap flex items-center gap-2"
                style={{ background: '#EDE9FE', color: '#00345e' }}
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                {ctaLabel}
              </div>
            </a>
          );
        })()}

        {/* Disclaimer */}
        <div
          className="rounded-xl p-6"
          style={{ background: '#FFFBEB' }}
        >
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[24px] flex-shrink-0 mt-0.5" style={{ color: '#D97706' }}>info</span>
            <div>
              <p className="font-bold text-sm mb-2" style={{ color: '#92400E' }}>
                Important: This is NOT a diagnosis
              </p>
              <p className="text-sm leading-relaxed" style={{ color: '#92400E' }}>
                {MEDICAL_DISCLAIMER}
              </p>
            </div>
          </div>
        </div>

        {/* Start Over */}
        <div className="text-center pt-2 pb-4 flex flex-wrap justify-center gap-3">
          <button
            onClick={handleReset}
            className="px-8 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{ background: '#EFF6FF', color: '#3B82F6' }}
          >
            <span className="inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Start New Assessment
            </span>
          </button>
          <button
            onClick={() => setShareOpen(true)}
            className="px-8 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{ background: '#3B82F6', color: 'white' }}
          >
            <span className="inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">share</span>
              Share Results
            </span>
          </button>
        </div>
      </motion.div>
    );
  };

  /* ── main render ──────────────────────────────────────────────── */

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f9ff' }}>
      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-8 py-12">

        {/* ─── Hero Section ──────────────────────────────────────── */}
        <section className="grid grid-cols-12 gap-8 mb-12">
          <div className="col-span-12 lg:col-span-7 flex flex-col justify-center">
            <h1 className="text-5xl font-extrabold leading-tight mb-4 font-headline" style={{ color: '#00345e' }}>
              AI Symptom Triage
            </h1>
            <p className="text-lg leading-relaxed max-w-xl" style={{ color: '#475569' }}>
              Describe your symptoms in your own words and our AI will assess their urgency, suggest possible conditions, and recommend next steps.
            </p>
          </div>
          <div className="col-span-12 lg:col-span-5 relative">
            <div
              className="p-8 rounded-xl relative overflow-hidden"
              style={{ background: '#EFF6FF' }}
            >
              {/* blur decoration */}
              <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-40 blur-3xl"
                style={{ background: '#DBEAFE' }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[20px]" style={{ color: '#3B82F6' }}>verified_user</span>
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#3B82F6' }}>Clinical Integrity</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#00345e' }}>
                  Our triage engine cross-references your symptoms against clinical guidelines to provide evidence-based urgency assessments. Always confirm with a healthcare professional.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Progress Stepper ──────────────────────────────────── */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#3B82F6' }}>
              Step {step + 1} of 4: {STEPS[step]}
            </span>
            <div className="flex gap-1">
              {STEPS.map((s, i) => (
                <span
                  key={s}
                  className="material-symbols-outlined text-[18px]"
                  style={{ color: i <= step ? '#3B82F6' : '#DBEAFE' }}
                >
                  {STEP_ICONS[i]}
                </span>
              ))}
            </div>
          </div>
          <div className="h-2 rounded-full" style={{ background: '#DBEAFE' }}>
            <motion.div
              className="h-2 rounded-full"
              style={{ background: '#3B82F6' }}
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / 4) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* ─── Step Content ──────────────────────────────────────── */}
        <div
          className="rounded-xl p-8 mb-8"
          style={{ background: '#EFF6FF' }}
        >
          {step === 0 && renderStep0()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && loading && renderLoadingState()}
          {step === 3 && !loading && error && renderError()}
          {step === 3 && !loading && result && renderResults()}
        </div>

        {/* ─── Navigation ────────────────────────────────────────── */}
        {step < 3 && (
          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
              style={{ background: '#EFF6FF', color: '#3B82F6' }}
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              Back
            </button>

            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
                style={{ background: '#3B82F6' }}
              >
                Next
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: '#3B82F6' }}
              >
                <span className="material-symbols-outlined text-[18px]">psychology</span>
                Get Assessment
              </button>
            )}
          </div>
        )}

        {/* ─── Medical Disclaimer ────────────────────────────────── */}
        <div className="mt-8 rounded-xl p-5" style={{ background: '#EFF6FF' }}>
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] flex-shrink-0 mt-0.5" style={{ color: '#475569' }}>info</span>
            <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>
              {MEDICAL_DISCLAIMER}
            </p>
          </div>
        </div>
      </main>

      <Footer />

      {result && (
        <ShareResultModal
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          title="Symptom Assessment Results"
          summary={`PharmaAI Copilot - Symptom Assessment\n\nUrgency: ${result.urgencyLevel.toUpperCase()}\n\nAssessment: ${result.assessment}\n\nPossible Conditions: ${result.possibleConditions.join(', ')}\n\nRecommended Actions:\n${result.recommendedActions.map((a, i) => `${i+1}. ${a}`).join('\n')}\n\nSelf-Care: ${result.selfCareAdvice.join(', ')}\n\n⚠️ This is not a diagnosis. Please consult a healthcare professional.\n\nPowered by PharmaAI Copilot`}
        />
      )}
    </div>
  );
}
