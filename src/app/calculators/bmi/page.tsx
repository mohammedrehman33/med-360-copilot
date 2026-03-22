'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ShareResultModal from '@/components/ui/ShareResultModal';

interface BMIResult {
  bmi: number;
  category: string;
  color: string;
  tips: string[];
}

function calculateBMI(heightCm: number, weightKg: number): BMIResult {
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  if (bmi < 18.5) {
    return {
      bmi,
      category: 'Underweight',
      color: '#3B82F6',
      tips: [
        'Consider nutrient-dense foods to reach a healthy weight.',
        'Consult a dietitian for a personalized meal plan.',
        'Strength training can help build healthy muscle mass.',
      ],
    };
  } else if (bmi < 25) {
    return {
      bmi,
      category: 'Normal',
      color: '#7C3AED',
      tips: [
        'Great job maintaining a healthy weight!',
        'Continue balanced nutrition and regular physical activity.',
        'Regular health checkups help keep you on track.',
      ],
    };
  } else if (bmi < 30) {
    return {
      bmi,
      category: 'Overweight',
      color: '#c47900',
      tips: [
        'Small lifestyle changes can make a meaningful difference.',
        'Aim for at least 150 minutes of moderate activity weekly.',
        'Focus on whole grains, fruits, vegetables, and lean proteins.',
      ],
    };
  } else {
    return {
      bmi,
      category: 'Obese',
      color: '#bd0c3b',
      tips: [
        'Speak with a healthcare provider about a weight management plan.',
        'Gradual, sustained changes are more effective than crash diets.',
        'Even modest weight loss (5-10%) can improve health markers.',
      ],
    };
  }
}

export default function BMICalculatorPage() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState<BMIResult | null>(null);
  const [error, setError] = useState('');
  const [shareOpen, setShareOpen] = useState(false);

  const handleCalculate = () => {
    setError('');
    setResult(null);
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (!h || !w || h < 100 || h > 250 || w < 30 || w > 250) {
      setError('Please enter valid height (100-250 cm) and weight (30-250 kg).');
      return;
    }

    setResult(calculateBMI(h, w));
  };

  const bmiProgress = result ? Math.min((result.bmi / 40) * 100, 100) : 0;

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
                <span className="material-symbols-outlined text-[20px]" style={{ color: '#3B82F6' }}>monitor_weight</span>
              </div>
              <div>
                <h1 className="font-headline text-xl font-bold" style={{ color: '#00345e' }}>BMI Calculator</h1>
                <p className="text-sm" style={{ color: '#475569' }}>Body Mass Index based on height and weight</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
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

              {error && (
                <p className="text-sm rounded-xl px-4 py-3" style={{ background: '#bd0c3b10', color: '#bd0c3b' }}>{error}</p>
              )}

              <button
                onClick={handleCalculate}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: '#3B82F6', color: '#ffffff' }}
              >
                Calculate BMI
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
                    title="BMI Result"
                    summary={`PharmaAI Copilot - BMI Result\n\nBMI: ${result.bmi}\nCategory: ${result.category}\nHeight: ${height}cm, Weight: ${weight}kg\n\nPowered by PharmaAI Copilot`}
                  />

                  {/* Result Display */}
                  <div className="rounded-xl p-6 text-center" style={{ background: '#EFF6FF' }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#475569' }}>Your BMI</p>
                    <p className="text-5xl font-extrabold mb-3" style={{ color: '#3B82F6' }}>{result.bmi}</p>
                    <span
                      className="inline-flex items-center px-4 py-1.5 rounded-xl text-sm font-bold"
                      style={{
                        background: result.category === 'Normal' ? 'rgba(111,251,190,0.3)' : '#DBEAFE',
                        color: result.category === 'Normal' ? '#7C3AED' : '#1E40AF',
                      }}
                    >
                      {result.category}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs" style={{ color: '#475569' }}>
                      <span>Underweight</span>
                      <span>Normal</span>
                      <span>Overweight</span>
                      <span>Obese</span>
                    </div>
                    <div className="h-2.5 rounded-xl overflow-hidden" style={{ background: '#E0F2FE' }}>
                      <div
                        className="h-full rounded-xl transition-all duration-700"
                        style={{ width: `${bmiProgress}%`, background: '#3B82F6' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: '#475569' }}>
                      <span>15</span>
                      <span>18.5</span>
                      <span>25</span>
                      <span>30</span>
                      <span>40</span>
                    </div>
                  </div>

                  {/* Health Tips */}
                  <div className="rounded-xl p-5" style={{ background: '#EFF6FF' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-[18px]" style={{ color: '#3B82F6' }}>info</span>
                      <span className="text-sm font-bold" style={{ color: '#00345e' }}>Health Tips</span>
                    </div>
                    <ul className="space-y-2">
                      {result.tips.map((tip, i) => (
                        <li key={i} className="text-sm flex items-start gap-2" style={{ color: '#00345e' }}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: result.color }} />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-center mt-6" style={{ color: '#475569' }}>
            This calculator is for informational purposes only. BMI does not account for muscle mass, bone density, or
            body composition. Always consult a healthcare professional for personalized health advice.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
