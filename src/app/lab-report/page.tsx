'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';
import { MEDICAL_DISCLAIMER } from '@/lib/constants';
import type { LabReportAnalysis, LabValue } from '@/types';

const statusConfig: Record<string, { icon: string; colorClass: string; bgClass: string }> = {
  normal: { icon: 'remove', colorClass: 'text-[#7C3AED]', bgClass: 'bg-[#EDE9FE]/30 text-[#7C3AED]' },
  low: { icon: 'arrow_downward', colorClass: 'text-[#3B82F6]', bgClass: 'bg-[#DBEAFE] text-[#3B82F6]' },
  high: { icon: 'arrow_upward', colorClass: 'text-amber-600', bgClass: 'bg-amber-100 text-amber-700' },
  critical: { icon: 'emergency', colorClass: 'text-[#bd0c3b]', bgClass: 'bg-[#bd0c3b]/10 text-[#bd0c3b]' },
};

export default function LabReportPage() {
  const [analysis, setAnalysis] = useState<LabReportAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', acceptedFiles[0]);
      formData.append('userId', 'default-user');

      const res = await fetch('/api/lab-reports', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.analysis?.data?.analysis) {
        setAnalysis(data.analysis.data.analysis);
      }
    } catch (error) {
      console.error('Lab report analysis failed:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'], 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#EFF6FF] py-14 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="material-symbols-outlined text-[#3B82F6] mb-4 block" style={{ fontSize: '48px' }}>lab_panel</span>
              <h1 className="font-headline text-5xl font-extrabold text-[#00345e] mb-3">
                Lab Report Analysis
              </h1>
              <p className="text-[#475569] text-lg max-w-xl mx-auto">
                Upload your lab report and get an AI-powered breakdown of your results, abnormal findings, and lifestyle recommendations.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Upload Zone */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div
              {...getRootProps()}
              className={cn(
                'bg-[#EFF6FF] rounded-xl p-10 text-center cursor-pointer transition-all duration-200 mb-8',
                isDragActive
                  ? 'bg-[#DBEAFE] ring-2 ring-[#3B82F6]/30'
                  : 'hover:bg-[#DBEAFE]'
              )}
            >
              <input {...getInputProps()} />
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[#3B82F6] mb-3 block" style={{ fontSize: '40px' }}>progress_activity</span>
                  <p className="text-sm font-semibold text-[#00345e]">
                    Analyzing lab report...
                  </p>
                  <p className="text-xs text-[#475569] mt-1">This may take a moment</p>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[#475569]/50 mb-3 block" style={{ fontSize: '40px' }}>cloud_upload</span>
                  <p className="text-sm font-semibold mb-1 text-[#00345e]">
                    {isDragActive ? 'Drop your lab report here' : 'Drop lab report image here, or click to browse'}
                  </p>
                  <p className="text-xs text-[#475569]/60">
                    Supports PNG, JPG, and PDF. Blood tests, CBC, lipid panel, liver/kidney function, etc.
                  </p>
                </>
              )}
            </div>
          </motion.div>

          {/* Results */}
          <AnimatePresence>
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Lab Values Table */}
                <div className="bg-white rounded-xl p-8 overflow-hidden">
                  <h2 className="font-headline text-base font-bold text-[#00345e] flex items-center gap-2 mb-5">
                    <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '22px' }}>science</span>
                    Lab Values ({analysis.values.length})
                  </h2>
                  <div className="overflow-x-auto rounded-xl bg-[#f8f9ff]">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#EFF6FF]">
                          <th className="text-left px-5 py-3 font-semibold text-[#475569] text-xs">Test</th>
                          <th className="text-right px-5 py-3 font-semibold text-[#475569] text-xs">Value</th>
                          <th className="text-right px-5 py-3 font-semibold text-[#475569] text-xs">Reference</th>
                          <th className="text-center px-5 py-3 font-semibold text-[#475569] text-xs">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.values.map((val: LabValue, i: number) => {
                          const config = statusConfig[val.status] || statusConfig.normal;
                          return (
                            <tr key={i} className={cn(i % 2 === 0 ? 'bg-white' : 'bg-[#f8f9ff]')}>
                              <td className="px-5 py-3 font-medium text-[#00345e]">{val.testName}</td>
                              <td className={cn('px-5 py-3 text-right font-mono text-xs', config.colorClass)}>
                                {val.value} {val.unit}
                              </td>
                              <td className="px-5 py-3 text-right text-[#475569]/60">{val.referenceRange}</td>
                              <td className="px-5 py-3 text-center">
                                <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full', config.bgClass)}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{config.icon}</span>
                                  {val.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Abnormal Findings */}
                {analysis.abnormalFindings.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-8"
                  >
                    <h3 className="font-headline text-base font-bold flex items-center gap-2 mb-4 text-amber-700">
                      <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>report</span>
                      Abnormal Findings
                    </h3>
                    <ul className="space-y-2.5">
                      {analysis.abnormalFindings.map((finding: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-[#00345e]/80">
                          <span className="material-symbols-outlined text-amber-500 mt-0.5" style={{ fontSize: '16px' }}>warning</span>
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Possible Drug Categories */}
                {analysis.possibleDrugCategories.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-8"
                  >
                    <h3 className="font-headline text-base font-bold flex items-center gap-2 mb-4 text-[#00345e]">
                      <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '22px' }}>medication</span>
                      Possible Drug Categories Doctor May Consider
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.possibleDrugCategories.map((cat: string, i: number) => (
                        <span key={i} className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-[#DBEAFE] text-[#3B82F6]">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Lifestyle Recommendations */}
                {analysis.lifestyleRecommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl p-8"
                  >
                    <h3 className="font-headline text-base font-bold flex items-center gap-2 mb-4 text-[#7C3AED]">
                      <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>spa</span>
                      Lifestyle Recommendations
                    </h3>
                    <ul className="space-y-2.5">
                      {analysis.lifestyleRecommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-[#00345e]/80">
                          <span className="material-symbols-outlined text-[#7C3AED]" style={{ fontSize: '16px' }}>check_circle</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {/* Disclaimer */}
                <div className="bg-[#EFF6FF] rounded-xl p-6 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#475569]" style={{ fontSize: '22px' }}>gavel</span>
                  <p className="text-xs text-[#475569] leading-relaxed">{MEDICAL_DISCLAIMER}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Default Disclaimer when no analysis */}
          {!analysis && !loading && (
            <div className="bg-[#EFF6FF] rounded-xl p-6 flex items-start gap-3">
              <span className="material-symbols-outlined text-[#475569]" style={{ fontSize: '22px' }}>gavel</span>
              <p className="text-xs text-[#475569] leading-relaxed">{MEDICAL_DISCLAIMER}</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
