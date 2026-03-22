'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface OvulationResult {
  ovulationDate: Date;
  fertileStart: Date;
  fertileEnd: Date;
  nextPeriod: Date;
}

function calculateOvulation(lastPeriod: Date, cycleLength: number): OvulationResult {
  const ovulationDate = new Date(lastPeriod);
  ovulationDate.setDate(ovulationDate.getDate() + cycleLength - 14);

  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(fertileStart.getDate() - 5);

  const fertileEnd = new Date(ovulationDate);

  const nextPeriod = new Date(lastPeriod);
  nextPeriod.setDate(nextPeriod.getDate() + cycleLength);

  return { ovulationDate, fertileStart, fertileEnd, nextPeriod };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function OvulationCalculatorPage() {
  const [lastPeriod, setLastPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [result, setResult] = useState<OvulationResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    setResult(null);

    if (!lastPeriod) {
      setError('Please select your last period start date.');
      return;
    }

    const cl = parseInt(cycleLength);
    if (!cl || cl < 21 || cl > 35) {
      setError('Cycle length must be between 21 and 35 days.');
      return;
    }

    const lpDate = new Date(lastPeriod);
    setResult(calculateOvulation(lpDate, cl));
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
                <span className="material-symbols-outlined text-[20px]" style={{ color: '#3B82F6' }}>calendar_month</span>
              </div>
              <div>
                <h1 className="font-headline text-xl font-bold" style={{ color: '#00345e' }}>Ovulation Calculator</h1>
                <p className="text-sm" style={{ color: '#475569' }}>Predict your fertile window and ovulation date</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="last-period" className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Last Period Start Date</label>
                <input
                  id="last-period"
                  type="date"
                  value={lastPeriod}
                  onChange={(e) => setLastPeriod(e.target.value)}
                  className="w-full px-4 py-3 bg-[#ffffff] rounded-xl text-sm outline-none transition-all"
                  style={{ border: '2px solid #EFF6FF', color: '#00345e' }}
                  onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                  onBlur={(e) => e.target.style.borderColor = '#EFF6FF'}
                />
              </div>

              <div>
                <label htmlFor="cycle-length" className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Average Cycle Length</label>
                <select
                  id="cycle-length"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(e.target.value)}
                  className="w-full px-4 py-3 bg-[#ffffff] rounded-xl text-sm outline-none transition-all appearance-none"
                  style={{ border: '2px solid #EFF6FF', color: '#00345e' }}
                  onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                  onBlur={(e) => e.target.style.borderColor = '#EFF6FF'}
                >
                  {Array.from({ length: 15 }, (_, i) => i + 21).map((d) => (
                    <option key={d} value={String(d)}>
                      {d} days {d === 28 ? '(Average)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-sm rounded-xl px-4 py-3" style={{ background: '#bd0c3b10', color: '#bd0c3b' }}>{error}</p>
              )}

              <button
                onClick={handleCalculate}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: '#3B82F6', color: '#ffffff' }}
              >
                Calculate Ovulation
              </button>

              {result && (
                <div className="space-y-5 pt-2">
                  {/* Ovulation Date */}
                  <div className="rounded-xl p-6 text-center" style={{ background: '#EFF6FF' }}>
                    <span className="material-symbols-outlined text-[28px] mb-2" style={{ color: '#3B82F6' }}>egg_alt</span>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Estimated Ovulation Date</p>
                    <p className="text-xl font-extrabold" style={{ color: '#3B82F6' }}>{formatDate(result.ovulationDate)}</p>
                  </div>

                  {/* Key Dates */}
                  <div className="space-y-3">
                    <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: '#EFF6FF' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(111,251,190,0.3)' }}>
                        <span className="material-symbols-outlined text-[20px]" style={{ color: '#7C3AED' }}>date_range</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold" style={{ color: '#00345e' }}>Fertile Window</p>
                        <p className="text-sm" style={{ color: '#475569' }}>{formatShort(result.fertileStart)} &ndash; {formatShort(result.fertileEnd)}</p>
                      </div>
                      <span className="px-3 py-1 rounded-xl text-xs font-bold" style={{ background: 'rgba(111,251,190,0.3)', color: '#7C3AED' }}>6 days</span>
                    </div>

                    <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: '#EFF6FF' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#DBEAFE' }}>
                        <span className="material-symbols-outlined text-[20px]" style={{ color: '#3B82F6' }}>event</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold" style={{ color: '#00345e' }}>Next Period Expected</p>
                        <p className="text-sm" style={{ color: '#475569' }}>{formatDate(result.nextPeriod)}</p>
                      </div>
                      <span className="px-3 py-1 rounded-xl text-xs font-bold" style={{ background: '#DBEAFE', color: '#1E40AF' }}>Upcoming</span>
                    </div>
                  </div>

                  {/* Visual Timeline */}
                  <div className="rounded-xl p-5" style={{ background: '#EFF6FF' }}>
                    <p className="text-sm font-bold mb-3" style={{ color: '#00345e' }}>Cycle Timeline</p>
                    <div className="flex items-center gap-[2px]">
                      {Array.from({ length: parseInt(cycleLength) }, (_, i) => {
                        const dayDate = new Date(lastPeriod);
                        dayDate.setDate(dayDate.getDate() + i);
                        const isFertile = dayDate >= result.fertileStart && dayDate <= result.fertileEnd;
                        const isOvulation = dayDate.toDateString() === result.ovulationDate.toDateString();
                        const isMenstrual = i < 5;

                        let bg = '#DBEAFE';
                        if (isOvulation) bg = '#3B82F6';
                        else if (isFertile) bg = '#EDE9FE';
                        else if (isMenstrual) bg = '#bd0c3b60';

                        return (
                          <div
                            key={i}
                            className="flex-1 h-3 rounded-full transition-all"
                            style={{
                              background: bg,
                              minWidth: '4px',
                              boxShadow: isOvulation ? '0 0 0 2px #DBEAFE' : 'none',
                            }}
                            title={`Day ${i + 1}`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: '#475569' }}>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#bd0c3b60' }} /> Menstrual
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#EDE9FE' }} /> Fertile
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#3B82F6' }} /> Ovulation
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-center mt-6" style={{ color: '#475569' }}>
            This calculator provides estimates based on average cycle patterns. Actual ovulation may vary.
            It should not be used as a sole method of contraception. Consult your healthcare provider for personalized guidance.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
