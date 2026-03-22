'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DisclaimerBanner from '@/components/ui/DisclaimerBanner';
import { cn } from '@/lib/utils';
import type { DrugInfo, DrugInteractionResult } from '@/types';

export default function DrugsPage() {
  const [query, setQuery] = useState('');
  const [drugs, setDrugs] = useState<DrugInfo[]>([]);
  const [interactions, setInteractions] = useState<DrugInteractionResult[]>([]);
  const [alternatives, setAlternatives] = useState<DrugInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchDrug = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/drugs/${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setDrugs(data.drugs || []);
      setInteractions(data.interactions || []);
      setAlternatives(data.alternatives || []);
    } catch {
      setDrugs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 sm:px-8 py-12">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="font-headline text-5xl font-extrabold text-[#00345e] tracking-tight mb-6">
            Drug Intelligence
          </h1>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-[#475569]">
                search
              </span>
              <input
                type="text"
                placeholder="Search by medicine name or salt composition..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchDrug()}
                className="w-full pl-12 pr-5 py-4 h-14 bg-white rounded-xl shadow-sm text-[#00345e] text-base placeholder:text-[#475569]/50 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-shadow"
              />
            </div>
            <button
              onClick={searchDrug}
              disabled={loading}
              className="px-8 h-14 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">search</span>
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-[#DBEAFE] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[28px] text-[#3B82F6] animate-spin">progress_activity</span>
            </div>
            <p className="text-sm text-[#475569]">Searching drug database...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && searched && drugs.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center shadow-[0_4px_40px_-10px_rgba(0,52,94,0.06)]">
            <span className="material-symbols-outlined text-[48px] text-[#DBEAFE] mb-3 block">medication</span>
            <p className="text-base font-semibold text-[#00345e] mb-1">No drugs found</p>
            <p className="text-sm text-[#475569]">
              No results for &quot;{query}&quot;. Try a different name or salt composition.
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && drugs.length > 0 && (
          <div className="space-y-8">
            {/* Drug Cards */}
            <section>
              <h2 className="font-headline text-xl font-bold text-[#00345e] mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[22px] text-[#3B82F6]">medication</span>
                Drug Information ({drugs.length})
              </h2>
              <div className="space-y-5">
                {drugs.map((drug, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-xl p-8 shadow-[0_4px_40px_-10px_rgba(0,52,94,0.06)]"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-[#00345e]">{drug.brandName}</h3>
                        {drug.manufacturer && (
                          <p className="text-sm text-[#475569] mt-0.5">{drug.manufacturer}</p>
                        )}
                      </div>
                      {drug.priceRange && (
                        <span className="bg-[#EDE9FE] text-[#7C3AED] px-3 py-1 rounded-full text-sm font-semibold">
                          {drug.priceRange}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Salt Composition */}
                      <div className="bg-[#EFF6FF] rounded-xl p-6">
                        <p className="text-xs uppercase tracking-widest text-[#475569] mb-2">Salt Composition</p>
                        <p className="text-sm font-semibold text-[#3B82F6]">{drug.saltComposition}</p>
                      </div>

                      {/* Drug Class */}
                      <div className="bg-[#EFF6FF] rounded-xl p-6">
                        <p className="text-xs uppercase tracking-widest text-[#475569] mb-2">Drug Class</p>
                        <p className="text-sm font-semibold text-[#00345e]">{drug.drugClass}</p>
                      </div>
                    </div>

                    {/* Mechanism */}
                    <div className="bg-[#EFF6FF] rounded-xl p-6 mb-4">
                      <p className="text-xs uppercase tracking-widest text-[#475569] mb-2">Mechanism of Action</p>
                      <p className="text-sm text-[#00345e] leading-relaxed">{drug.mechanism}</p>
                    </div>

                    {/* Standard Dosage */}
                    <div className="bg-[#EFF6FF] rounded-xl p-6 mb-4">
                      <p className="text-xs uppercase tracking-widest text-[#475569] mb-2">Standard Dosage</p>
                      <p className="text-sm font-semibold text-[#00345e]">{drug.standardDosage}</p>
                    </div>

                    {/* Side Effects */}
                    {drug.sideEffects.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs uppercase tracking-widest text-[#475569] mb-2">Side Effects</p>
                        <div className="flex flex-wrap gap-2">
                          {drug.sideEffects.map((effect, j) => (
                            <span key={j} className="bg-[#bd0c3b]/5 text-[#bd0c3b] text-xs px-3 py-1.5 rounded-lg font-medium">
                              {effect}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contraindications */}
                    {drug.contraindications.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs uppercase tracking-widest text-[#475569] mb-2">Contraindications</p>
                        <div className="space-y-1.5">
                          {drug.contraindications.map((c, j) => (
                            <div key={j} className="flex items-start gap-2 text-sm text-[#00345e]">
                              <span className="material-symbols-outlined text-[16px] text-[#bd0c3b] mt-0.5">block</span>
                              {c}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Food Interactions */}
                    {drug.foodInteractions.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-widest text-[#475569] mb-2">Food Interactions</p>
                        <div className="space-y-1.5">
                          {drug.foodInteractions.map((f, j) => (
                            <div key={j} className="flex items-start gap-2 text-sm text-[#00345e]">
                              <span className="material-symbols-outlined text-[16px] text-[#3B82F6] mt-0.5">restaurant</span>
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Known Interactions */}
            {interactions.length > 0 && (
              <section>
                <h2 className="font-headline text-xl font-bold text-[#00345e] mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px] text-[#bd0c3b]">compare_arrows</span>
                  Known Interactions ({interactions.length})
                </h2>
                <div className="space-y-3">
                  {interactions.map((interaction, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className={cn(
                        'bg-white rounded-xl p-6 shadow-[0_4px_40px_-10px_rgba(0,52,94,0.06)]',
                        (interaction.severity === 'major' || interaction.severity === 'contraindicated') &&
                          'border-l-4 border-[#bd0c3b]'
                      )}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className={cn(
                          'px-2.5 py-0.5 rounded-full text-xs font-bold uppercase',
                          interaction.severity === 'minor' ? 'bg-[#EFF6FF] text-[#475569]' :
                          interaction.severity === 'moderate' ? 'bg-[#DBEAFE] text-[#3B82F6]' :
                          interaction.severity === 'major' ? 'bg-[#bd0c3b]/10 text-[#bd0c3b]' :
                          'bg-[#bd0c3b] text-white'
                        )}>
                          {interaction.severity}
                        </span>
                        <span className="text-sm font-bold text-[#00345e]">
                          {interaction.drug1} + {interaction.drug2}
                        </span>
                      </div>
                      <p className="text-sm text-[#00345e] mb-2">{interaction.description}</p>
                      <div className="bg-[#EFF6FF] rounded-xl p-4">
                        <p className="text-xs uppercase tracking-widest text-[#475569] mb-1">Management</p>
                        <p className="text-sm text-[#00345e]">{interaction.management}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Alternatives */}
            {alternatives.length > 0 && (
              <section>
                <h2 className="font-headline text-xl font-bold text-[#00345e] mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px] text-[#7C3AED]">swap_horiz</span>
                  Same-Salt Alternatives ({alternatives.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {alternatives.map((alt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * i }}
                      className="bg-white rounded-xl p-6 shadow-[0_4px_40px_-10px_rgba(0,52,94,0.06)]"
                    >
                      <p className="text-base font-bold text-[#00345e]">{alt.brandName}</p>
                      <p className="text-sm text-[#3B82F6] font-medium mt-0.5">{alt.saltComposition}</p>
                      {alt.manufacturer && (
                        <p className="text-xs text-[#475569] mt-2">{alt.manufacturer}</p>
                      )}
                      {alt.priceRange && (
                        <span className="inline-block mt-2 bg-[#EDE9FE] text-[#7C3AED] text-xs px-2.5 py-1 rounded-full font-semibold">
                          {alt.priceRange}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <div className="mt-10">
          <DisclaimerBanner />
        </div>
      </main>

      <Footer />
    </div>
  );
}
