'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function CalculatorsPage() {
  const [bmiHeight, setBmiHeight] = useState('');
  const [bmiWeight, setBmiWeight] = useState('');
  const [bmiResult, setBmiResult] = useState<{ bmi: number; category: string } | null>(null);

  const handleQuickBmi = () => {
    const h = parseFloat(bmiHeight);
    const w = parseFloat(bmiWeight);
    if (!h || !w || h < 100 || h > 250 || w < 30 || w > 250) return;
    const heightM = h / 100;
    const bmi = Math.round((w / (heightM * heightM)) * 10) / 10;
    let category = 'Obese';
    if (bmi < 18.5) category = 'Underweight';
    else if (bmi < 25) category = 'Normal';
    else if (bmi < 30) category = 'Overweight';
    setBmiResult({ bmi, category });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f8f9ff' }}>
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Hero */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold mb-5" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
              <span className="material-symbols-outlined text-[18px]">calculate</span>
              Clinical-Grade Health Tools
            </div>
            <h1 className="font-headline text-5xl font-extrabold tracking-tight mb-4" style={{ color: '#00345e' }}>
              Health Calculators Hub
            </h1>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: '#475569' }}>
              Quick, reliable calculators built on standard medical formulas. Get instant insights for BMI, nutrition, hydration, blood pressure, and reproductive health.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-12 gap-5">
            {/* BMI Card - col-span-8 */}
            <div className="col-span-12 lg:col-span-8 rounded-xl p-8 shadow-[0_2px_20px_-8px_rgba(59,130,246,0.04)]" style={{ background: '#ffffff' }}>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#DBEAFE' }}>
                  <span className="material-symbols-outlined text-[24px]" style={{ color: '#3B82F6' }}>monitor_weight</span>
                </div>
                <div className="flex-1">
                  <h2 className="font-headline text-xl font-bold" style={{ color: '#00345e' }}>BMI Calculator</h2>
                  <p className="text-sm mt-1" style={{ color: '#475569' }}>Calculate your Body Mass Index based on height and weight to understand your weight category.</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold" style={{ background: '#DBEAFE', color: '#1E40AF' }}>Popular</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Height (cm)</label>
                  <input
                    type="number"
                    placeholder="e.g. 170"
                    value={bmiHeight}
                    onChange={(e) => setBmiHeight(e.target.value)}
                    className="w-full px-4 py-3 bg-[#ffffff] rounded-xl text-sm outline-none transition-all"
                    style={{ border: '2px solid #EFF6FF', color: '#00345e' }}
                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.target.style.borderColor = '#EFF6FF'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Weight (kg)</label>
                  <input
                    type="number"
                    placeholder="e.g. 70"
                    value={bmiWeight}
                    onChange={(e) => setBmiWeight(e.target.value)}
                    className="w-full px-4 py-3 bg-[#ffffff] rounded-xl text-sm outline-none transition-all"
                    style={{ border: '2px solid #EFF6FF', color: '#00345e' }}
                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                    onBlur={(e) => e.target.style.borderColor = '#EFF6FF'}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleQuickBmi}
                  className="px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: '#3B82F6', color: '#ffffff' }}
                >
                  Calculate Results
                </button>
                {bmiResult && (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-extrabold" style={{ color: '#3B82F6' }}>{bmiResult.bmi}</span>
                    <span className="px-3 py-1 rounded-xl text-xs font-bold" style={{ background: bmiResult.category === 'Normal' ? 'rgba(111,251,190,0.3)' : '#DBEAFE', color: bmiResult.category === 'Normal' ? '#7C3AED' : '#1E40AF' }}>
                      {bmiResult.category}
                    </span>
                  </div>
                )}
                <Link href="/calculators/bmi" className="ml-auto text-sm font-semibold flex items-center gap-1 hover:opacity-80 transition-opacity" style={{ color: '#3B82F6' }}>
                  Full Calculator
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            {/* Nutrition & Hydration - col-span-4 */}
            <div className="col-span-12 lg:col-span-4 rounded-xl p-8 shadow-[0_2px_20px_-8px_rgba(59,130,246,0.04)]" style={{ background: '#ffffff' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: 'rgba(111,251,190,0.3)' }}>
                <span className="material-symbols-outlined text-[24px]" style={{ color: '#7C3AED' }}>nutrition</span>
              </div>
              <h2 className="font-headline text-xl font-bold mb-2" style={{ color: '#00345e' }}>Nutrition & Hydration</h2>
              <p className="text-sm mb-6" style={{ color: '#475569' }}>Track your daily calorie needs and optimal water intake based on your body and activity level.</p>
              <div className="space-y-3">
                <Link href="/calculators/water" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:shadow-sm" style={{ background: '#EFF6FF' }}>
                  <span className="material-symbols-outlined text-[20px]" style={{ color: '#3B82F6' }}>water_drop</span>
                  <span className="text-sm font-semibold" style={{ color: '#00345e' }}>Water Intake</span>
                  <span className="material-symbols-outlined text-[18px] ml-auto" style={{ color: '#475569' }}>chevron_right</span>
                </Link>
                <Link href="/calculators/calories" className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:shadow-sm" style={{ background: '#EFF6FF' }}>
                  <span className="material-symbols-outlined text-[20px]" style={{ color: '#3B82F6' }}>local_fire_department</span>
                  <span className="text-sm font-semibold" style={{ color: '#00345e' }}>Calorie Calculator</span>
                  <span className="material-symbols-outlined text-[18px] ml-auto" style={{ color: '#475569' }}>chevron_right</span>
                </Link>
              </div>
            </div>

            {/* Blood Pressure - col-span-4 */}
            <div className="col-span-12 lg:col-span-4 rounded-xl p-8 shadow-[0_2px_20px_-8px_rgba(59,130,246,0.04)]" style={{ background: '#ffffff' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: '#bd0c3b15' }}>
                <span className="material-symbols-outlined text-[24px]" style={{ color: '#bd0c3b' }}>bloodtype</span>
              </div>
              <h2 className="font-headline text-xl font-bold mb-2" style={{ color: '#00345e' }}>Blood Pressure</h2>
              <p className="text-sm mb-6" style={{ color: '#475569' }}>Classify your blood pressure reading based on AHA guidelines and get health insights.</p>
              <Link href="/calculators/blood-pressure" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90" style={{ background: '#bd0c3b', color: '#fff' }}>
                <span className="material-symbols-outlined text-[18px]">favorite</span>
                Check BP
              </Link>
            </div>

            {/* Cycle & Fertility Hub - col-span-8 */}
            <div className="col-span-12 lg:col-span-8 rounded-xl p-8 shadow-[0_2px_20px_-8px_rgba(59,130,246,0.04)]" style={{ background: '#ffffff' }}>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#DBEAFE' }}>
                  <span className="material-symbols-outlined text-[24px]" style={{ color: '#3B82F6' }}>pregnancy</span>
                </div>
                <div>
                  <h2 className="font-headline text-xl font-bold" style={{ color: '#00345e' }}>Cycle & Fertility Hub</h2>
                  <p className="text-sm mt-1" style={{ color: '#475569' }}>Predict your fertile window, track ovulation, and estimate your pregnancy due date with clinically validated formulas.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/calculators/ovulation" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90" style={{ background: '#3B82F6', color: '#ffffff' }}>
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  Ovulation Tracker
                </Link>
                <Link href="/calculators/pregnancy" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
                  <span className="material-symbols-outlined text-[18px]">child_friendly</span>
                  Pregnancy Due Date
                </Link>
              </div>
            </div>
          </div>

          {/* Live Result Example */}
          <div className="mt-14">
            <h2 className="font-headline text-2xl font-bold text-center mb-8" style={{ color: '#00345e' }}>Live Result Example</h2>
            <div className="max-w-2xl mx-auto rounded-xl p-8 shadow-[0_2px_20px_-8px_rgba(59,130,246,0.04)]" style={{ background: '#ffffff' }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#DBEAFE' }}>
                  <span className="material-symbols-outlined text-[20px]" style={{ color: '#3B82F6' }}>monitor_weight</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#475569' }}>Sample BMI Result</p>
                  <p className="text-sm" style={{ color: '#475569' }}>Height: 175 cm | Weight: 68.5 kg</p>
                </div>
              </div>
              <div className="rounded-xl p-6" style={{ background: '#EFF6FF' }}>
                <div className="flex items-end gap-4 mb-4">
                  <span className="text-5xl font-extrabold" style={{ color: '#3B82F6' }}>22.4</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold mb-2" style={{ background: 'rgba(111,251,190,0.3)', color: '#7C3AED' }}>Normal</span>
                </div>
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1" style={{ color: '#475569' }}>
                    <span>Underweight</span>
                    <span>Normal</span>
                    <span>Overweight</span>
                    <span>Obese</span>
                  </div>
                  <div className="h-2 rounded-xl overflow-hidden" style={{ background: '#E0F2FE' }}>
                    <div className="h-full rounded-xl" style={{ background: '#3B82F6', width: '56%' }} />
                  </div>
                  <div className="flex justify-between text-xs mt-1" style={{ color: '#475569' }}>
                    <span>15</span>
                    <span>18.5</span>
                    <span>25</span>
                    <span>30</span>
                    <span>40</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#475569' }}>Clinical Notes</p>
                  <ul className="space-y-1.5">
                    <li className="text-sm flex items-start gap-2" style={{ color: '#00345e' }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#7C3AED' }} />
                      BMI falls within the healthy weight range (18.5 &ndash; 24.9).
                    </li>
                    <li className="text-sm flex items-start gap-2" style={{ color: '#00345e' }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#7C3AED' }} />
                      Continue balanced nutrition and regular physical activity.
                    </li>
                    <li className="text-sm flex items-start gap-2" style={{ color: '#00345e' }}>
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#7C3AED' }} />
                      Regular health checkups help catch changes early.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-center mt-12 max-w-2xl mx-auto" style={{ color: '#475569' }}>
            These calculators are for informational purposes only and do not constitute medical advice.
            Always consult a qualified healthcare professional for diagnosis and treatment decisions.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
