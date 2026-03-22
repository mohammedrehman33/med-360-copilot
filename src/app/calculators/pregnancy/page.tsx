'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface PregnancyResult {
  dueDate: Date;
  currentWeek: number;
  currentDay: number;
  trimester: number;
  trimesterLabel: string;
  daysRemaining: number;
  progressPercent: number;
}

function calculatePregnancy(lmpDate: Date): PregnancyResult {
  const dueDate = new Date(lmpDate);
  dueDate.setDate(dueDate.getDate() + 280);

  const today = new Date();
  const diffMs = today.getTime() - lmpDate.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const currentWeek = Math.floor(totalDays / 7);
  const currentDay = totalDays % 7;

  const daysRemaining = Math.max(0, Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  let trimester = 1;
  let trimesterLabel = 'First Trimester';
  if (currentWeek >= 27) {
    trimester = 3;
    trimesterLabel = 'Third Trimester';
  } else if (currentWeek >= 13) {
    trimester = 2;
    trimesterLabel = 'Second Trimester';
  }

  const progressPercent = Math.min(Math.round((totalDays / 280) * 100), 100);

  return { dueDate, currentWeek, currentDay, trimester, trimesterLabel, daysRemaining, progressPercent };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function PregnancyCalculatorPage() {
  const [lmpInput, setLmpInput] = useState('');
  const [result, setResult] = useState<PregnancyResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    setResult(null);

    if (!lmpInput) {
      setError('Please select your last menstrual period date.');
      return;
    }

    const lmpDate = new Date(lmpInput);
    const today = new Date();

    if (lmpDate > today) {
      setError('The date cannot be in the future.');
      return;
    }

    const diffDays = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 300) {
      setError('The date seems too far in the past. Please check your input.');
      return;
    }

    setResult(calculatePregnancy(lmpDate));
  };

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
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#DBEAFE' }}>
                <span className="material-symbols-outlined text-[20px]" style={{ color: '#3B82F6' }}>pregnancy</span>
              </div>
              <div>
                <h1 className="font-headline text-xl font-bold" style={{ color: '#00345e' }}>Pregnancy Due Date Calculator</h1>
                <p className="text-sm" style={{ color: '#475569' }}>Estimate your due date using Naegele&apos;s Rule</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="lmp" className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Last Menstrual Period (LMP)</label>
                <input
                  id="lmp"
                  type="date"
                  value={lmpInput}
                  onChange={(e) => setLmpInput(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-[#ffffff] rounded-xl text-sm outline-none transition-all"
                  style={{ border: '2px solid #EFF6FF', color: '#00345e' }}
                  onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                  onBlur={(e) => e.target.style.borderColor = '#EFF6FF'}
                />
              </div>

              {error && (
                <p className="text-sm rounded-xl px-4 py-3" style={{ background: '#bd0c3b10', color: '#bd0c3b' }}>{error}</p>
              )}

              <button
                onClick={handleCalculate}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: '#3B82F6', color: '#ffffff' }}
              >
                Calculate Due Date
              </button>

              {result && (
                <div className="space-y-5 pt-2">
                  {/* Due Date */}
                  <div className="rounded-xl p-6 text-center" style={{ background: '#EFF6FF' }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Estimated Due Date</p>
                    <p className="text-2xl font-extrabold mb-3" style={{ color: '#3B82F6' }}>{formatDate(result.dueDate)}</p>
                    <span className="inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-bold" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                      {result.trimesterLabel}
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl p-4 text-center" style={{ background: '#EFF6FF' }}>
                      <span className="material-symbols-outlined text-[22px] mb-1" style={{ color: '#3B82F6' }}>calendar_today</span>
                      <p className="text-lg font-bold" style={{ color: '#00345e' }}>{result.currentWeek}w {result.currentDay}d</p>
                      <p className="text-xs" style={{ color: '#475569' }}>Current Week</p>
                    </div>
                    <div className="rounded-xl p-4 text-center" style={{ background: '#EFF6FF' }}>
                      <span className="material-symbols-outlined text-[22px] mb-1" style={{ color: '#3B82F6' }}>schedule</span>
                      <p className="text-lg font-bold" style={{ color: '#00345e' }}>{result.daysRemaining}</p>
                      <p className="text-xs" style={{ color: '#475569' }}>Days Remaining</p>
                    </div>
                    <div className="rounded-xl p-4 text-center" style={{ background: '#EFF6FF' }}>
                      <span className="material-symbols-outlined text-[22px] mb-1" style={{ color: '#3B82F6' }}>favorite</span>
                      <p className="text-lg font-bold" style={{ color: '#00345e' }}>{result.trimester}</p>
                      <p className="text-xs" style={{ color: '#475569' }}>Trimester</p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: '#00345e' }}>Pregnancy Progress</span>
                      <span className="text-sm font-bold" style={{ color: '#3B82F6' }}>{result.progressPercent}%</span>
                    </div>
                    <div className="h-2.5 rounded-xl overflow-hidden" style={{ background: '#E0F2FE' }}>
                      <div className="h-full rounded-xl transition-all duration-700" style={{ width: `${result.progressPercent}%`, background: '#3B82F6' }} />
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: '#475569' }}>
                      <span>Week 0</span>
                      <span>Week 13</span>
                      <span>Week 27</span>
                      <span>Week 40</span>
                    </div>
                  </div>

                  {/* Trimester Timeline */}
                  <div className="rounded-xl p-5" style={{ background: '#EFF6FF' }}>
                    <p className="text-sm font-bold mb-3" style={{ color: '#00345e' }}>Trimester Timeline</p>
                    {[
                      { label: 'First Trimester', weeks: 'Weeks 1-12', tri: 1 },
                      { label: 'Second Trimester', weeks: 'Weeks 13-26', tri: 2 },
                      { label: 'Third Trimester', weeks: 'Weeks 27-40', tri: 3 },
                    ].map((t) => (
                      <div key={t.tri} className="flex items-center gap-3 py-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            background: '#3B82F6',
                            opacity: result.trimester === t.tri ? 1 : 0.3,
                            boxShadow: result.trimester === t.tri ? '0 0 0 3px #DBEAFE' : 'none',
                          }}
                        />
                        <div className="flex-1">
                          <span className="text-sm font-semibold" style={{ color: '#00345e' }}>{t.label}</span>
                          <span className="text-xs ml-2" style={{ color: '#475569' }}>{t.weeks}</span>
                        </div>
                        {result.trimester === t.tri && (
                          <span className="px-3 py-1 rounded-xl text-xs font-bold" style={{ background: 'rgba(111,251,190,0.3)', color: '#7C3AED' }}>Current</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-center mt-6" style={{ color: '#475569' }}>
            This calculator provides an estimate only. Due dates can vary. Only about 5% of babies are born on their
            estimated due date. Please consult your obstetrician for accurate dating via ultrasound.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
