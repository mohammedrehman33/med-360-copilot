'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ShareResultModal from '@/components/ui/ShareResultModal';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LabTestInfo {
  testName: string;
  aliases: string[];
  category: string;
  purpose: string;
  whatItMeasures: string;
  preparation: {
    fasting: string;
    medications: string;
    specialInstructions: string;
  };
  procedure: {
    sampleType: string;
    howPerformed: string;
    duration: string;
    painLevel: string;
  };
  results: {
    normalRanges: Array<{ group: string; range: string }>;
    highMeaning: string;
    lowMeaning: string;
    criticalValues: string;
    affectingFactors: string[];
  };
  relatedTests: string[];
  conditions: string[];
  frequency: string;
  costRange: string;
}

function PainLevelIndicator({ level }: { level: string }) {
  const normalized = level.toLowerCase();
  let color = 'bg-[#7C3AED]/10 text-[#7C3AED]';
  let dots = 1;
  if (normalized.includes('moderate')) {
    color = 'bg-amber-100 text-amber-700';
    dots = 2;
  } else if (normalized.includes('significant') || normalized.includes('high')) {
    color = 'bg-[#bd0c3b]/10 text-[#bd0c3b]';
    dots = 3;
  }

  return (
    <div className="flex items-center gap-2">
      <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', color)}>{level}</span>
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full',
              i <= dots ? (dots === 1 ? 'bg-[#7C3AED]' : dots === 2 ? 'bg-amber-400' : 'bg-[#bd0c3b]') : 'bg-[#DBEAFE]'
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default function LabTestsPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [testInfo, setTestInfo] = useState<LabTestInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [activeCommonTest, setActiveCommonTest] = useState<string | null>(null);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const searchLabTest = async (searchQuery?: string) => {
    const trimmed = (searchQuery || query).trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setTestInfo(null);
    setSearched(true);

    try {
      const res = await fetch('/api/lab-tests/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch lab test information');
      }

      setTestInfo(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestClick = (test: string) => {
    setQuery(test);
    setActiveCommonTest(test);
    searchLabTest(test);
  };

  const commonTests = [
    { name: 'Complete Blood Count (CBC)', icon: 'water_drop' },
    { name: 'HbA1c', icon: 'bloodtype' },
    { name: 'Lipid Panel', icon: 'monitor_heart' },
    { name: 'Thyroid (TSH)', icon: 'psychology' },
    { name: 'Liver Function', icon: 'gastroenterology' },
    { name: 'Vitamin D', icon: 'sunny' },
    { name: 'Kidney Function', icon: 'nephrology' },
    { name: 'Iron Studies', icon: 'science' },
  ];

  const suggestedTests = ['CBC', 'HbA1c', 'Lipid Panel', 'Thyroid (TSH)', 'Liver Function', 'Vitamin D'];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <Header />

      <main className="flex-1">
        {/* Hero Search Section */}
        <section className="bg-[#EFF6FF] py-14 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-headline text-5xl font-extrabold text-[#00345e] mb-3"
            >
              Lab Test Information Hub
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-[#475569] text-lg mb-8"
            >
              Understand what your lab tests measure, how to prepare, and what results mean.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative max-w-2xl mx-auto"
            >
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" style={{ fontSize: '24px' }}>
                search
              </span>
              <input
                type="text"
                placeholder="Search a lab test (e.g., CBC, Hemoglobin, HbA1c, Liver Function)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchLabTest()}
                className="w-full pl-13 pr-28 py-4 rounded-xl bg-white text-[#00345e] text-base placeholder:text-[#475569]/50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/30 shadow-sm"
                style={{ paddingLeft: '52px' }}
              />
              <button
                onClick={() => searchLabTest()}
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-lg bg-[#3B82F6] text-white text-sm font-semibold disabled:opacity-50 hover:bg-[#2563EB] transition-colors"
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>progress_activity</span>
                ) : (
                  'Search'
                )}
              </button>
            </motion.div>

            {/* Suggested Searches */}
            {!searched && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs font-medium text-[#475569]/60">Popular:</span>
                {suggestedTests.map((test) => (
                  <button
                    key={test}
                    onClick={() => handleTestClick(test)}
                    className="text-xs px-3.5 py-1.5 rounded-full bg-white text-[#475569] hover:bg-[#DBEAFE] transition-colors cursor-pointer font-medium"
                  >
                    {test}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Sidebar */}
            <div className="col-span-12 lg:col-span-4 space-y-6">
              {/* Common Tests List */}
              <div className="bg-[#EFF6FF] rounded-xl p-5">
                <h2 className="font-headline text-sm font-bold text-[#00345e] mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '20px' }}>labs</span>
                  Common Tests
                </h2>
                <div className="space-y-1">
                  {commonTests.map((test) => {
                    const isActive = activeCommonTest === test.name;
                    return (
                      <button
                        key={test.name}
                        onClick={() => handleTestClick(test.name)}
                        className={cn(
                          'w-full text-left px-4 py-3 rounded-xl text-sm transition-colors flex items-center gap-3',
                          isActive
                            ? 'bg-white text-[#3B82F6] font-bold shadow-sm'
                            : 'text-[#00345e] hover:bg-[#DBEAFE]'
                        )}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isActive ? '#3B82F6' : '#475569' }}>
                          {test.icon}
                        </span>
                        {test.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Need Help CTA */}
              <div className="bg-[#3B82F6] text-white rounded-xl p-8">
                <h3 className="font-headline text-lg font-bold mb-2">Need Help?</h3>
                <p className="text-sm text-white/80 mb-5 leading-relaxed">
                  Not sure which test you need? Our AI copilot can guide you based on your symptoms.
                </p>
                <button className="px-5 py-2.5 bg-white text-[#3B82F6] rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors">
                  Consult Copilot
                </button>
              </div>
            </div>

            {/* Right Content */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
              {/* Loading State */}
              <AnimatePresence mode="wait">
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-white rounded-xl p-8">
                      <div className="animate-pulse space-y-4">
                        <div className="h-7 w-64 bg-[#DBEAFE] rounded-lg" />
                        <div className="h-4 w-40 bg-[#EFF6FF] rounded-lg" />
                        <div className="flex gap-2 mt-4">
                          <div className="h-8 w-24 bg-[#EFF6FF] rounded-lg" />
                          <div className="h-8 w-32 bg-[#EFF6FF] rounded-lg" />
                          <div className="h-8 w-28 bg-[#EFF6FF] rounded-lg" />
                        </div>
                        <div className="h-4 w-full bg-[#EFF6FF] rounded" />
                        <div className="h-4 w-5/6 bg-[#EFF6FF] rounded" />
                        <div className="h-20 w-full bg-[#EFF6FF] rounded-xl" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error State */}
              <AnimatePresence>
                {error && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-[#bd0c3b]/5 rounded-xl p-6 flex items-start gap-3"
                  >
                    <span className="material-symbols-outlined text-[#bd0c3b]" style={{ fontSize: '22px' }}>error</span>
                    <div>
                      <p className="text-sm font-semibold text-[#bd0c3b]">Unable to find test information</p>
                      <p className="text-sm text-[#bd0c3b]/70 mt-1">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Empty State */}
              {!loading && !testInfo && !error && searched && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-xl p-12 text-center"
                >
                  <span className="material-symbols-outlined text-[#475569]/40 mb-3 block" style={{ fontSize: '40px' }}>science</span>
                  <p className="text-sm text-[#475569]/60">
                    No results found for &quot;{query}&quot;. Try a different test name.
                  </p>
                </motion.div>
              )}

              {/* Welcome State */}
              {!loading && !testInfo && !error && !searched && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl p-10 text-center"
                >
                  <span className="material-symbols-outlined text-[#3B82F6] mb-4 block" style={{ fontSize: '48px' }}>biotech</span>
                  <h2 className="font-headline text-xl font-bold text-[#00345e] mb-2">Search for a Lab Test</h2>
                  <p className="text-sm text-[#475569] max-w-md mx-auto">
                    Use the search bar above or select a common test from the sidebar to get detailed information about any lab test.
                  </p>
                </motion.div>
              )}

              {/* Results */}
              <AnimatePresence>
                {testInfo && !loading && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Share Button & Modal */}
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
                      title="Lab Test Information"
                      summary={`PharmaAI Copilot - Lab Test Info\n\nTest: ${testInfo.testName}\n\n${testInfo.purpose}\n\nPreparation: Fasting: ${testInfo.preparation.fasting}. Medications: ${testInfo.preparation.medications}. ${testInfo.preparation.specialInstructions}\n\nPowered by PharmaAI Copilot`}
                    />

                    {/* Test Header */}
                    <div className="bg-white rounded-xl p-8">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <h2 className="font-headline text-2xl font-bold text-[#00345e] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '28px' }}>science</span>
                            {testInfo.testName}
                          </h2>
                          {testInfo.aliases.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {testInfo.aliases.map((alias, i) => (
                                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#475569] font-medium">
                                  {alias}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-semibold whitespace-nowrap px-3.5 py-1.5 rounded-full bg-[#DBEAFE] text-[#3B82F6]">
                          {testInfo.category}
                        </span>
                      </div>
                    </div>

                    {/* Bento Grid: Overview + Procedure */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Overview Card */}
                      <div className="bg-white rounded-xl p-6">
                        <h3 className="font-headline text-sm font-bold text-[#00345e] mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '20px' }}>info</span>
                          Overview
                        </h3>
                        <div className="space-y-4">
                          <div className="bg-[#DBEAFE]/30 rounded-xl p-4">
                            <p className="text-xs font-semibold text-[#3B82F6] mb-1">Why is this test ordered?</p>
                            <p className="text-sm text-[#00345e] leading-relaxed">{testInfo.purpose}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#475569] mb-1">What does it measure?</p>
                            <p className="text-sm text-[#00345e]/80 leading-relaxed">{testInfo.whatItMeasures}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#EFF6FF] rounded-xl p-3">
                              <p className="text-xs text-[#475569]/70 mb-0.5">Category</p>
                              <p className="text-sm font-semibold text-[#00345e]">{testInfo.category}</p>
                            </div>
                            <div className="bg-[#EFF6FF] rounded-xl p-3">
                              <p className="text-xs text-[#475569]/70 mb-0.5">Sample Type</p>
                              <p className="text-sm font-semibold text-[#00345e]">{testInfo.procedure.sampleType}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Procedure Card */}
                      <div className="bg-white rounded-xl p-6">
                        <h3 className="font-headline text-sm font-bold text-[#00345e] mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '20px' }}>clinical_notes</span>
                          Procedure
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 py-2">
                            <span className="material-symbols-outlined text-[#475569]/50" style={{ fontSize: '18px' }}>water_drop</span>
                            <div>
                              <p className="text-xs text-[#475569]/70">Sample Type</p>
                              <p className="text-sm text-[#00345e]">{testInfo.procedure.sampleType}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 py-2">
                            <span className="material-symbols-outlined text-[#475569]/50" style={{ fontSize: '18px' }}>medical_information</span>
                            <div>
                              <p className="text-xs text-[#475569]/70">How It&apos;s Done</p>
                              <p className="text-sm text-[#00345e]">{testInfo.procedure.howPerformed}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 py-2">
                            <span className="material-symbols-outlined text-[#475569]/50" style={{ fontSize: '18px' }}>schedule</span>
                            <div>
                              <p className="text-xs text-[#475569]/70">Duration / Turnaround</p>
                              <p className="text-sm text-[#00345e]">{testInfo.procedure.duration}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 py-2">
                            <span className="material-symbols-outlined text-[#475569]/50" style={{ fontSize: '18px' }}>sentiment_neutral</span>
                            <div>
                              <p className="text-xs text-[#475569]/70 mb-1">Pain / Discomfort</p>
                              <PainLevelIndicator level={testInfo.procedure.painLevel} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preparation Card */}
                    <div className="bg-white rounded-xl p-6">
                      <h3 className="font-headline text-sm font-bold text-[#00345e] mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '20px' }}>checklist</span>
                        Patient Preparation
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#EFF6FF] rounded-xl p-4">
                          <p className="text-xs font-semibold text-[#3B82F6] mb-1.5 flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>restaurant</span>
                            Fasting Required
                          </p>
                          <p className="text-sm text-[#00345e]">{testInfo.preparation.fasting}</p>
                        </div>
                        <div className="bg-[#EFF6FF] rounded-xl p-4">
                          <p className="text-xs font-semibold text-[#3B82F6] mb-1.5 flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>medication</span>
                            Medications
                          </p>
                          <p className="text-sm text-[#00345e]">{testInfo.preparation.medications}</p>
                        </div>
                        <div className="bg-[#EFF6FF] rounded-xl p-4">
                          <p className="text-xs font-semibold text-[#3B82F6] mb-1.5 flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                            Special Instructions
                          </p>
                          <p className="text-sm text-[#00345e]">{testInfo.preparation.specialInstructions}</p>
                        </div>
                      </div>
                    </div>

                    {/* Interpretation Guide Accordion */}
                    <div className="bg-white rounded-xl p-6">
                      <h3 className="font-headline text-sm font-bold text-[#00345e] mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '20px' }}>analytics</span>
                        Interpretation Guide
                      </h3>

                      {/* Normal Ranges */}
                      <div className="mb-2">
                        <button
                          onClick={() => setOpenAccordion(openAccordion === 'ranges' ? null : 'ranges')}
                          className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-colors text-left"
                        >
                          <span className="text-sm font-semibold text-[#00345e] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '18px' }}>straighten</span>
                            Normal Reference Ranges
                          </span>
                          <span className="material-symbols-outlined text-[#475569]" style={{ fontSize: '20px' }}>
                            {openAccordion === 'ranges' ? 'expand_less' : 'expand_more'}
                          </span>
                        </button>
                        {openAccordion === 'ranges' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="overflow-hidden mt-2"
                          >
                            <div className="rounded-xl overflow-hidden bg-[#f8f9ff]">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-[#EFF6FF]">
                                    <th className="text-left px-4 py-2.5 font-semibold text-[#475569] text-xs">Group</th>
                                    <th className="text-left px-4 py-2.5 font-semibold text-[#475569] text-xs">Range</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {testInfo.results.normalRanges.map((range, i) => (
                                    <tr key={i} className={cn(i % 2 === 0 ? 'bg-white' : 'bg-[#f8f9ff]')}>
                                      <td className="px-4 py-2.5 text-[#00345e]">{range.group}</td>
                                      <td className="px-4 py-2.5 font-mono text-xs text-[#3B82F6]">{range.range}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* High/Low Values */}
                      <div className="mb-2">
                        <button
                          onClick={() => setOpenAccordion(openAccordion === 'highlow' ? null : 'highlow')}
                          className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-colors text-left"
                        >
                          <span className="text-sm font-semibold text-[#00345e] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '18px' }}>swap_vert</span>
                            High &amp; Low Values Meaning
                          </span>
                          <span className="material-symbols-outlined text-[#475569]" style={{ fontSize: '20px' }}>
                            {openAccordion === 'highlow' ? 'expand_less' : 'expand_more'}
                          </span>
                        </button>
                        {openAccordion === 'highlow' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="overflow-hidden mt-2"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
                              <div className="rounded-xl p-4 bg-[#bd0c3b]/5">
                                <h4 className="text-sm font-semibold text-[#bd0c3b] mb-1.5 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_upward</span>
                                  High Values May Indicate
                                </h4>
                                <p className="text-sm text-[#00345e]/80 leading-relaxed">{testInfo.results.highMeaning}</p>
                              </div>
                              <div className="rounded-xl p-4 bg-[#3B82F6]/5">
                                <h4 className="text-sm font-semibold text-[#3B82F6] mb-1.5 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_downward</span>
                                  Low Values May Indicate
                                </h4>
                                <p className="text-sm text-[#00345e]/80 leading-relaxed">{testInfo.results.lowMeaning}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Critical Values */}
                      <div className="mb-2">
                        <button
                          onClick={() => setOpenAccordion(openAccordion === 'critical' ? null : 'critical')}
                          className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-colors text-left"
                        >
                          <span className="text-sm font-semibold text-[#00345e] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#bd0c3b]" style={{ fontSize: '18px' }}>emergency</span>
                            Critical Values
                          </span>
                          <span className="material-symbols-outlined text-[#475569]" style={{ fontSize: '20px' }}>
                            {openAccordion === 'critical' ? 'expand_less' : 'expand_more'}
                          </span>
                        </button>
                        {openAccordion === 'critical' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="overflow-hidden mt-2"
                          >
                            <div className="rounded-xl p-4 bg-[#bd0c3b]/5">
                              <p className="text-sm font-semibold text-[#bd0c3b] mb-1.5 flex items-center gap-1.5">
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>warning</span>
                                Seek Immediate Attention
                              </p>
                              <p className="text-sm text-[#00345e]/80 leading-relaxed">{testInfo.results.criticalValues}</p>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Affecting Factors */}
                      <div>
                        <button
                          onClick={() => setOpenAccordion(openAccordion === 'factors' ? null : 'factors')}
                          className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] transition-colors text-left"
                        >
                          <span className="text-sm font-semibold text-[#00345e] flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '18px' }}>tune</span>
                            Factors That Can Affect Results
                          </span>
                          <span className="material-symbols-outlined text-[#475569]" style={{ fontSize: '20px' }}>
                            {openAccordion === 'factors' ? 'expand_less' : 'expand_more'}
                          </span>
                        </button>
                        {openAccordion === 'factors' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="overflow-hidden mt-2 p-3"
                          >
                            <div className="flex flex-wrap gap-2">
                              {testInfo.results.affectingFactors.map((factor, i) => (
                                <span
                                  key={i}
                                  className="text-xs py-1.5 px-3 rounded-full bg-[#EFF6FF] text-[#475569] font-medium"
                                >
                                  {factor}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Related Tests & Conditions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Related Tests */}
                      <div className="bg-white rounded-xl p-6">
                        <h3 className="font-headline text-sm font-bold text-[#00345e] mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '20px' }}>link</span>
                          Related Tests
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {testInfo.relatedTests.map((test, i) => (
                            <button
                              key={i}
                              onClick={() => handleTestClick(test)}
                              className="text-sm px-3.5 py-1.5 rounded-full bg-[#DBEAFE]/40 text-[#3B82F6] font-medium hover:bg-[#DBEAFE] transition-colors cursor-pointer"
                            >
                              {test}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Conditions */}
                      <div className="bg-white rounded-xl p-6">
                        <h3 className="font-headline text-sm font-bold text-[#00345e] mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '20px' }}>diagnosis</span>
                          Conditions Diagnosed
                        </h3>
                        <div className="space-y-2">
                          {testInfo.conditions.map((condition, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 rounded-xl p-2.5 bg-[#EFF6FF] text-sm text-[#00345e]"
                            >
                              <span className="material-symbols-outlined text-[#7C3AED]" style={{ fontSize: '18px' }}>check_circle</span>
                              {condition}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Frequency & Cost */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl p-6">
                        <p className="text-xs font-medium text-[#475569]/60 mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>event_repeat</span>
                          Recommended Frequency
                        </p>
                        <p className="text-sm font-semibold text-[#00345e]">{testInfo.frequency}</p>
                      </div>
                      <div className="bg-white rounded-xl p-6">
                        <p className="text-xs font-medium text-[#475569]/60 mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>payments</span>
                          Approximate Cost (USD)
                        </p>
                        <p className="text-sm font-semibold text-[#00345e]">{testInfo.costRange}</p>
                      </div>
                    </div>

                    {/* Clinical Disclaimer */}
                    <div className="bg-[#EFF6FF] rounded-xl p-6 flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#475569]" style={{ fontSize: '22px' }}>gavel</span>
                      <div>
                        <p className="text-xs font-bold text-[#00345e] mb-1">Clinical Disclaimer</p>
                        <p className="text-xs text-[#475569] leading-relaxed">
                          This information is for educational purposes only and is not a substitute for professional medical advice.
                          Always consult a qualified healthcare professional for interpretation of lab results and medical decisions.
                          Reference ranges may vary between laboratories.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
