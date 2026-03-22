'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ShareResultModal from '@/components/ui/ShareResultModal';

interface BPResult {
  category: string;
  color: string;
  severity: number;
  advice: string[];
  seeDoctor: string;
}

function classifyBP(systolic: number, diastolic: number): BPResult {
  if (systolic > 180 || diastolic > 120) {
    return {
      category: 'Hypertensive Crisis',
      color: '#bd0c3b',
      severity: 4,
      advice: [
        'This reading requires immediate medical attention.',
        'Call emergency services or go to the nearest emergency room.',
        'Do not wait to see if pressure comes down on its own.',
      ],
      seeDoctor: 'Seek emergency medical care immediately.',
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      category: 'Stage 2 Hypertension',
      color: '#bd0c3b',
      severity: 3,
      advice: [
        'Your blood pressure is significantly elevated.',
        'Lifestyle modifications combined with medication are often recommended.',
        'Regular monitoring and follow-up with your doctor are important.',
      ],
      seeDoctor: 'Schedule an appointment with your doctor soon.',
    };
  }
  if (systolic >= 130 || diastolic >= 80) {
    return {
      category: 'Stage 1 Hypertension',
      color: '#c47900',
      severity: 2,
      advice: [
        'Your blood pressure is mildly elevated.',
        'Lifestyle changes such as diet, exercise, and stress management may help.',
        'Your doctor may consider medication based on your overall risk profile.',
      ],
      seeDoctor: 'Discuss with your doctor at your next visit.',
    };
  }
  if (systolic >= 120 && diastolic < 80) {
    return {
      category: 'Elevated',
      color: '#c47900',
      severity: 1,
      advice: [
        'Your blood pressure is slightly above the normal range.',
        'Healthy lifestyle habits can help prevent further increases.',
        'Reduce sodium intake and increase physical activity.',
      ],
      seeDoctor: 'Mention this at your next routine checkup.',
    };
  }
  return {
    category: 'Normal',
    color: '#7C3AED',
    severity: 0,
    advice: [
      'Your blood pressure is within the normal range.',
      'Continue maintaining a healthy lifestyle.',
      'Regular monitoring helps catch changes early.',
    ],
    seeDoctor: 'Continue routine checkups as recommended.',
  };
}

export default function BloodPressureCalculatorPage() {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [result, setResult] = useState<BPResult | null>(null);
  const [error, setError] = useState('');
  const [shareOpen, setShareOpen] = useState(false);

  const handleCalculate = () => {
    setError('');
    setResult(null);

    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);

    if (!sys || sys < 70 || sys > 250) {
      setError('Please enter a valid systolic value (70-250 mmHg).');
      return;
    }
    if (!dia || dia < 40 || dia > 150) {
      setError('Please enter a valid diastolic value (40-150 mmHg).');
      return;
    }
    if (dia >= sys) {
      setError('Diastolic pressure should be lower than systolic pressure.');
      return;
    }

    setResult(classifyBP(sys, dia));
  };

  const severityPercent = result ? Math.min(((result.severity + 1) / 5) * 100, 100) : 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f9ff' }}>
      <Header />

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/calculators"
            className="inline-flex items-center gap-1.5 text-sm font-semibold mb-6 transition-opacity hover:opacity-80"
            style={{ color: '#3B82F6' }}
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Calculators
          </Link>

          <div className="bg-[#ffffff] rounded-xl p-8 shadow-[0_2px_20px_-8px_rgba(59,130,246,0.04)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#bd0c3b15' }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: '#bd0c3b' }}>bloodtype</span>
              </div>
              <div>
                <h1 className="font-headline text-xl font-bold" style={{ color: '#00345e' }}>Blood Pressure Classifier</h1>
                <p className="text-sm" style={{ color: '#475569' }}>Classify your reading based on AHA guidelines</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="systolic" className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Systolic (mmHg)</label>
                  <input
                    id="systolic"
                    type="number"
                    placeholder="e.g. 120"
                    min={70}
                    max={250}
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    className="w-full px-4 py-3 bg-[#ffffff] rounded-xl text-sm outline-none transition-all"
                    style={{ border: '2px solid #EFF6FF', color: '#00345e' }}
                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.target.style.borderColor = '#EFF6FF'}
                  />
                  <p className="text-xs mt-1" style={{ color: '#475569' }}>Top number</p>
                </div>
                <div>
                  <label htmlFor="diastolic" className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Diastolic (mmHg)</label>
                  <input
                    id="diastolic"
                    type="number"
                    placeholder="e.g. 80"
                    min={40}
                    max={150}
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    className="w-full px-4 py-3 bg-[#ffffff] rounded-xl text-sm outline-none transition-all"
                    style={{ border: '2px solid #EFF6FF', color: '#00345e' }}
                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.target.style.borderColor = '#EFF6FF'}
                  />
                  <p className="text-xs mt-1" style={{ color: '#475569' }}>Bottom number</p>
                </div>
              </div>

              {error && (
                <p className="text-sm rounded-xl px-4 py-3" style={{ background: '#bd0c3b10', color: '#bd0c3b' }}>{error}</p>
              )}

              <button
                onClick={handleCalculate}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: '#3B82F6', color: '#ffffff' }}
              >
                Classify Blood Pressure
              </button>

              {result && (
                <div className="space-y-5 pt-2">
                  {/* Share Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShareOpen(true)}
                      className="inline-flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      Share Result
                    </button>
                  </div>
                  <ShareResultModal
                    isOpen={shareOpen}
                    onClose={() => setShareOpen(false)}
                    title="Blood Pressure Result"
                    summary={`PharmaAI Copilot - Blood Pressure\n\nReading: ${systolic}/${diastolic} mmHg\nClassification: ${result.category}\n\nPowered by PharmaAI Copilot`}
                  />

                  {/* Result */}
                  <div className="rounded-xl p-6 text-center" style={{ background: '#EFF6FF' }}>
                    <span className="material-symbols-outlined text-[28px] mb-2" style={{ color: result.color }}>bloodtype</span>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>{systolic}/{diastolic} mmHg</p>
                    <p className="text-2xl font-extrabold mb-3" style={{ color: result.color }}>{result.category}</p>
                    <span
                      className="inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-bold"
                      style={{
                        background: result.severity === 0 ? 'rgba(111,251,190,0.3)' : result.severity <= 2 ? '#DBEAFE' : '#bd0c3b20',
                        color: result.severity === 0 ? '#7C3AED' : result.severity <= 2 ? '#1E40AF' : '#bd0c3b',
                      }}
                    >
                      {result.severity === 0 ? 'Healthy' : result.severity <= 2 ? 'Caution' : 'Urgent'}
                    </span>
                  </div>

                  {/* Severity Scale */}
                  <div className="space-y-2">
                    <p className="text-sm font-bold" style={{ color: '#00345e' }}>Risk Level</p>
                    <div className="h-2.5 rounded-xl overflow-hidden" style={{ background: '#E0F2FE' }}>
                      <div
                        className="h-full rounded-xl transition-all duration-700"
                        style={{ width: `${severityPercent}%`, background: result.color }}
                      />
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: '#475569' }}>
                      <span>Normal</span>
                      <span>Elevated</span>
                      <span>Stage 1</span>
                      <span>Stage 2</span>
                      <span>Crisis</span>
                    </div>
                  </div>

                  {/* AHA Classification Reference */}
                  <div className="rounded-xl p-5" style={{ background: '#EFF6FF' }}>
                    <p className="text-sm font-bold mb-3" style={{ color: '#00345e' }}>AHA Classification Reference</p>
                    {[
                      { label: 'Normal', range: '< 120 / < 80', sev: 0 },
                      { label: 'Elevated', range: '120-129 / < 80', sev: 1 },
                      { label: 'Stage 1 HTN', range: '130-139 / 80-89', sev: 2 },
                      { label: 'Stage 2 HTN', range: '>= 140 / >= 90', sev: 3 },
                      { label: 'Crisis', range: '> 180 / > 120', sev: 4 },
                    ].map((item) => {
                      const isActive = result.severity === item.sev;
                      return (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-xl px-4 py-2.5 mb-1.5 last:mb-0 text-sm transition-all"
                          style={{
                            background: isActive ? '#DBEAFE' : 'transparent',
                            opacity: isActive ? 1 : 0.5,
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#3B82F6' }} />
                            <span className="font-semibold" style={{ color: '#00345e' }}>{item.label}</span>
                          </div>
                          <span style={{ color: '#475569' }}>{item.range}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Advice */}
                  <div className="rounded-xl p-5" style={{ background: '#EFF6FF' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-[18px]" style={{ color: '#3B82F6' }}>info</span>
                      <span className="text-sm font-bold" style={{ color: '#00345e' }}>Health Guidance</span>
                    </div>
                    <ul className="space-y-2">
                      {result.advice.map((tip, i) => (
                        <li key={i} className="text-sm flex items-start gap-2" style={{ color: '#00345e' }}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: result.color }} />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* See Doctor */}
                  <div
                    className="rounded-xl p-4 flex items-start gap-3"
                    style={{ background: result.severity >= 3 ? '#bd0c3b10' : 'rgba(111,251,190,0.15)' }}
                  >
                    <span className="material-symbols-outlined text-[20px] mt-0.5" style={{ color: result.severity >= 3 ? '#bd0c3b' : '#7C3AED' }}>
                      {result.severity >= 3 ? 'warning' : 'verified_user'}
                    </span>
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#00345e' }}>When to See a Doctor</p>
                      <p className="text-sm" style={{ color: '#475569' }}>{result.seeDoctor}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-center mt-6" style={{ color: '#475569' }}>
            This tool classifies blood pressure readings based on the American Heart Association guidelines.
            A single reading is not sufficient for diagnosis. Always consult your healthcare provider for
            proper evaluation and treatment decisions.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
