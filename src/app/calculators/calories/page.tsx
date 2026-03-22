'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const activityMultipliers = [
  { value: '1.2', label: 'Sedentary', desc: 'Little to no exercise' },
  { value: '1.375', label: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
  { value: '1.55', label: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
  { value: '1.725', label: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
  { value: '1.9', label: 'Extra Active', desc: 'Very hard exercise or physical job' },
];

interface CalorieResult {
  bmr: number;
  tdee: number;
  weightLoss: number;
  weightGain: number;
}

function calculateCalories(
  age: number,
  gender: string,
  heightCm: number,
  weightKg: number,
  activityMultiplier: number
): CalorieResult {
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  bmr = Math.round(bmr * 10) / 10;
  const tdee = Math.round(bmr * activityMultiplier * 10) / 10;
  const weightLoss = Math.round((tdee - 500) * 10) / 10;
  const weightGain = Math.round((tdee + 500) * 10) / 10;

  return { bmr, tdee, weightLoss, weightGain };
}

export default function CalorieCalculatorPage() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('1.2');
  const [result, setResult] = useState<CalorieResult | null>(null);
  const [error, setError] = useState('');

  const handleCalculate = () => {
    setError('');
    setResult(null);

    const a = parseInt(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (!a || a < 15 || a > 100) {
      setError('Please enter a valid age between 15 and 100.');
      return;
    }
    if (!h || h < 100 || h > 250) {
      setError('Please enter a valid height between 100 and 250 cm.');
      return;
    }
    if (!w || w < 30 || w > 250) {
      setError('Please enter a valid weight between 30 and 250 kg.');
      return;
    }

    setResult(calculateCalories(a, gender, h, w, parseFloat(activityLevel)));
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
                <span className="material-symbols-outlined text-[20px]" style={{ color: '#3B82F6' }}>local_fire_department</span>
              </div>
              <div>
                <h1 className="font-headline text-xl font-bold" style={{ color: '#00345e' }}>Calorie Calculator</h1>
                <p className="text-sm" style={{ color: '#475569' }}>Estimate daily calorie needs using Mifflin-St Jeor</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Gender */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Gender</label>
                <div className="flex gap-3">
                  {['male', 'female'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: gender === g ? '#3B82F6' : '#EFF6FF',
                        color: gender === g ? '#ffffff' : '#3B82F6',
                      }}
                    >
                      {g.charAt(0).toUpperCase() + g.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age, Height, Weight */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="age" className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Age</label>
                  <input
                    id="age"
                    type="number"
                    placeholder="e.g. 30"
                    min={15}
                    max={100}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 bg-[#ffffff] rounded-xl text-sm outline-none transition-all"
                    style={{ border: '2px solid #EFF6FF', color: '#00345e' }}
                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.target.style.borderColor = '#EFF6FF'}
                  />
                </div>
                <div>
                  <label htmlFor="height" className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Height (cm)</label>
                  <input
                    id="height"
                    type="number"
                    placeholder="e.g. 170"
                    min={100}
                    max={250}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-4 py-3 bg-[#ffffff] rounded-xl text-sm outline-none transition-all"
                    style={{ border: '2px solid #EFF6FF', color: '#00345e' }}
                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.target.style.borderColor = '#EFF6FF'}
                  />
                </div>
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
              </div>

              {/* Activity Level */}
              <div>
                <label htmlFor="activity" className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Activity Level</label>
                <select
                  id="activity"
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full px-4 py-3 bg-[#ffffff] rounded-xl text-sm outline-none transition-all appearance-none"
                  style={{ border: '2px solid #EFF6FF', color: '#00345e' }}
                  onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                  onBlur={(e) => e.target.style.borderColor = '#EFF6FF'}
                >
                  {activityMultipliers.map((a) => (
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
                Calculate Calories
              </button>

              {result && (
                <div className="space-y-5 pt-2">
                  {/* TDEE Main */}
                  <div className="rounded-xl p-6 text-center" style={{ background: '#EFF6FF' }}>
                    <span className="material-symbols-outlined text-[28px] mb-2" style={{ color: '#3B82F6' }}>local_fire_department</span>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Total Daily Energy Expenditure</p>
                    <p className="text-5xl font-extrabold" style={{ color: '#3B82F6' }}>{Math.round(result.tdee)}</p>
                    <p className="text-sm mt-1" style={{ color: '#475569' }}>calories / day</p>
                  </div>

                  {/* BMR */}
                  <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: '#EFF6FF' }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#DBEAFE' }}>
                      <span className="material-symbols-outlined text-[20px]" style={{ color: '#3B82F6' }}>bolt</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: '#00345e' }}>Basal Metabolic Rate (BMR)</p>
                      <p className="text-xs" style={{ color: '#475569' }}>Calories burned at complete rest</p>
                    </div>
                    <span className="text-lg font-bold" style={{ color: '#3B82F6' }}>{Math.round(result.bmr)}</span>
                  </div>

                  {/* Goals */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl p-4 text-center" style={{ background: '#EFF6FF' }}>
                      <span className="material-symbols-outlined text-[22px] mb-1" style={{ color: '#7C3AED' }}>trending_down</span>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#475569' }}>Weight Loss (-500 cal)</p>
                      <p className="text-xl font-bold" style={{ color: '#7C3AED' }}>{Math.round(result.weightLoss)}</p>
                      <p className="text-xs" style={{ color: '#475569' }}>cal/day</p>
                    </div>
                    <div className="rounded-xl p-4 text-center" style={{ background: '#EFF6FF' }}>
                      <span className="material-symbols-outlined text-[22px] mb-1" style={{ color: '#3B82F6' }}>trending_up</span>
                      <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#475569' }}>Weight Gain (+500 cal)</p>
                      <p className="text-xl font-bold" style={{ color: '#3B82F6' }}>{Math.round(result.weightGain)}</p>
                      <p className="text-xs" style={{ color: '#475569' }}>cal/day</p>
                    </div>
                  </div>

                  {/* Visual Breakdown */}
                  <div className="rounded-xl p-5" style={{ background: '#EFF6FF' }}>
                    <p className="text-sm font-bold mb-3" style={{ color: '#00345e' }}>Calorie Breakdown</p>
                    {[
                      { label: 'BMR (Base Metabolism)', value: result.bmr, percent: (result.bmr / result.tdee) * 100 },
                      { label: 'Activity Calories', value: result.tdee - result.bmr, percent: ((result.tdee - result.bmr) / result.tdee) * 100 },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1 mb-3 last:mb-0">
                        <div className="flex items-center justify-between text-sm">
                          <span style={{ color: '#00345e' }}>{item.label}</span>
                          <span className="font-bold" style={{ color: '#3B82F6' }}>
                            {Math.round(item.value)} cal ({Math.round(item.percent)}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-xl overflow-hidden" style={{ background: '#E0F2FE' }}>
                          <div
                            className="h-full rounded-xl transition-all duration-700"
                            style={{ width: `${item.percent}%`, background: '#3B82F6' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-center mt-6" style={{ color: '#475569' }}>
            This calculator uses the Mifflin-St Jeor equation for estimation purposes only.
            Individual calorie needs vary based on many factors. Consult a registered dietitian or healthcare
            provider before making significant dietary changes.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
