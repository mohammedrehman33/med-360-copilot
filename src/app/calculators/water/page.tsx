'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary', multiplier: 1.0, desc: 'Little to no exercise' },
  { value: 'light', label: 'Light', multiplier: 1.1, desc: 'Light exercise 1-3 days/week' },
  { value: 'moderate', label: 'Moderate', multiplier: 1.2, desc: 'Moderate exercise 3-5 days/week' },
  { value: 'active', label: 'Active', multiplier: 1.3, desc: 'Hard exercise 6-7 days/week' },
  { value: 'very-active', label: 'Very Active', multiplier: 1.4, desc: 'Intense exercise or physical job' },
];

interface WaterResult {
  liters: number;
  glasses: number;
  hourlyMl: number;
}

function calculateWater(weightKg: number, activityValue: string): WaterResult {
  const activity = activityLevels.find((a) => a.value === activityValue) || activityLevels[0];
  const baseLiters = weightKg * 0.033;
  const liters = Math.round(baseLiters * activity.multiplier * 10) / 10;
  const glasses = Math.round((liters * 1000) / 250);
  const hourlyMl = Math.round((liters * 1000) / 16);

  return { liters, glasses, hourlyMl };
}

export default function WaterIntakeCalculatorPage() {
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('sedentary');
  const [result, setResult] = useState<WaterResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    setResult(null);
    const w = parseFloat(weight);

    if (!w || w < 30 || w > 250) {
      setError('Please enter a valid weight between 30 and 250 kg.');
      return;
    }

    setResult(calculateWater(w, activity));
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
                <span className="material-symbols-outlined text-[20px]" style={{ color: '#3B82F6' }}>water_drop</span>
              </div>
              <div>
                <h1 className="font-headline text-xl font-bold" style={{ color: '#00345e' }}>Water Intake Calculator</h1>
                <p className="text-sm" style={{ color: '#475569' }}>Find your recommended daily water intake</p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="weight" className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Weight (kg)</label>
                <input
                  id="weight"
                  type="number"
                  placeholder="e.g. 70"
                  min={30}
                  max={250}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3 bg-[#ffffff] rounded-xl text-sm outline-none transition-all"
                  style={{ border: '2px solid #EFF6FF', color: '#00345e' }}
                  onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                  onBlur={(e) => e.target.style.borderColor = '#EFF6FF'}
                />
              </div>

              <div>
                <label htmlFor="activity" className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Activity Level</label>
                <select
                  id="activity"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full px-4 py-3 bg-[#ffffff] rounded-xl text-sm outline-none transition-all appearance-none"
                  style={{ border: '2px solid #EFF6FF', color: '#00345e' }}
                  onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                  onBlur={(e) => e.target.style.borderColor = '#EFF6FF'}
                >
                  {activityLevels.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label} — {a.desc}
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
                Calculate Water Intake
              </button>

              {result && (
                <div className="space-y-5 pt-2">
                  {/* Main Result */}
                  <div className="rounded-xl p-6 text-center" style={{ background: '#EFF6FF' }}>
                    <span className="material-symbols-outlined text-[32px] mb-2" style={{ color: '#3B82F6' }}>water_drop</span>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Daily Recommended Intake</p>
                    <p className="text-5xl font-extrabold" style={{ color: '#3B82F6' }}>{result.liters} L</p>
                    <p className="text-sm mt-1" style={{ color: '#475569' }}>{Math.round(result.liters * 1000)} mL per day</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-4 text-center" style={{ background: '#EFF6FF' }}>
                      <span className="material-symbols-outlined text-[22px] mb-1" style={{ color: '#3B82F6' }}>local_drink</span>
                      <p className="text-2xl font-bold" style={{ color: '#00345e' }}>{result.glasses}</p>
                      <p className="text-xs" style={{ color: '#475569' }}>Glasses (250 mL each)</p>
                    </div>
                    <div className="rounded-xl p-4 text-center" style={{ background: '#EFF6FF' }}>
                      <span className="material-symbols-outlined text-[22px] mb-1" style={{ color: '#3B82F6' }}>schedule</span>
                      <p className="text-2xl font-bold" style={{ color: '#00345e' }}>{result.hourlyMl} mL</p>
                      <p className="text-xs" style={{ color: '#475569' }}>Per Hour (16 waking hrs)</p>
                    </div>
                  </div>

                  {/* Visual Glasses */}
                  <div className="rounded-xl p-5" style={{ background: '#EFF6FF' }}>
                    <p className="text-sm font-bold mb-3" style={{ color: '#00345e' }}>Daily Glass Tracker</p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: result.glasses }, (_, i) => (
                        <div
                          key={i}
                          className="w-9 h-9 rounded-xl flex items-center justify-center"
                          style={{ background: '#DBEAFE' }}
                        >
                          <span className="material-symbols-outlined text-[16px]" style={{ color: '#3B82F6' }}>local_drink</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs mt-3" style={{ color: '#475569' }}>Each glass represents 250 mL of water</p>
                  </div>

                  {/* Progress toward 8-glass minimum */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: '#00345e' }}>vs. Standard 8-Glass Recommendation</span>
                      <span
                        className="px-3 py-1 rounded-xl text-xs font-bold"
                        style={{
                          background: result.glasses >= 8 ? 'rgba(111,251,190,0.3)' : '#DBEAFE',
                          color: result.glasses >= 8 ? '#7C3AED' : '#1E40AF',
                        }}
                      >
                        {result.glasses >= 8 ? 'Meets goal' : 'Below standard'}
                      </span>
                    </div>
                    <div className="h-2.5 rounded-xl overflow-hidden" style={{ background: '#E0F2FE' }}>
                      <div
                        className="h-full rounded-xl transition-all duration-700"
                        style={{ width: `${Math.min((result.glasses / 8) * 100, 100)}%`, background: '#3B82F6' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-center mt-6" style={{ color: '#475569' }}>
            This calculator provides a general estimate. Actual needs vary based on climate, health conditions, and
            individual factors. Consult a healthcare provider for personalized hydration advice.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
