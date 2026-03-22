'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatWithCopilot from '@/components/chat/ChatWithCopilot';

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const quickAccessCards = [
  {
    title: 'Assess Your Symptoms',
    desc: 'Describe how you feel and get AI-powered guidance on potential conditions and next steps.',
    icon: 'stethoscope',
    href: '/triage',
    bg: 'bg-[#DBEAFE]/40 hover:bg-[#DBEAFE]',
    iconColor: 'text-[#3B82F6]',
    btnBg: 'bg-[#3B82F6] text-white',
    btnLabel: 'Start Checkup',
  },
  {
    title: 'Upload Prescription',
    desc: 'Snap a photo of your prescription and let AI extract medicines, dosages, and instructions.',
    icon: 'document_scanner',
    href: '/analyze',
    bg: 'bg-[#EDE9FE]/40 hover:bg-[#EDE9FE]',
    iconColor: 'text-[#7C3AED]',
    btnBg: 'bg-[#7C3AED] text-white',
    btnLabel: 'Upload Image',
  },
  {
    title: 'Health Calculators',
    desc: 'BMI, dosage converters, renal function, and more clinical tools at your fingertips.',
    icon: 'calculate',
    href: '/calculators',
    bg: 'bg-[#DBEAFE] hover:bg-[#BFDBFE]',
    iconColor: 'text-[#475569]',
    btnBg: 'bg-white text-[#00345e]',
    btnLabel: 'Explore Tools',
  },
  {
    title: 'Drug Intelligence',
    desc: 'Search comprehensive drug information, interactions, contraindications, and clinical pharmacology.',
    icon: 'search',
    href: '/drugs',
    bg: 'bg-[#E0F2FE] hover:bg-[#BAE6FD]',
    iconColor: 'text-[#0EA5E9]',
    btnBg: 'bg-[#0EA5E9] text-white',
    btnLabel: 'Search Drugs',
  },
  {
    title: 'Lab Report Analysis',
    desc: 'Upload your lab reports and get AI-powered interpretation of results with clinical context.',
    icon: 'biotech',
    href: '/lab-report',
    bg: 'bg-[#EDE9FE]/50 hover:bg-[#EDE9FE]',
    iconColor: 'text-[#7C3AED]',
    btnBg: 'bg-[#7C3AED] text-white',
    btnLabel: 'Analyze Report',
  },
];

const insights = [
  {
    title: 'Sleep & Recovery',
    desc: 'Your sleep quality has improved 12% this week. Keep your bedtime routine consistent.',
    icon: 'bedtime',
    bg: 'bg-[#DBEAFE]/30',
  },
  {
    title: 'Hydration Reminder',
    desc: 'You are averaging 6 glasses daily. Aim for 8 glasses to support kidney function.',
    icon: 'water_drop',
    bg: 'bg-[#EDE9FE]/30',
  },
  {
    title: 'Medication Adherence',
    desc: '98% adherence this month. Outstanding consistency with your prescribed regimen.',
    icon: 'verified',
    bg: 'bg-[#DBEAFE]',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header />

      <main className="flex-1">
        {/* ============================================= */}
        {/* Chat With Copilot                             */}
        {/* ============================================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-6">
          <motion.div {...fadeUp}>
            <ChatWithCopilot />
          </motion.div>
        </section>

        {/* ============================================= */}
        {/* Quick Access Bento Grid                       */}
        {/* ============================================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {quickAccessCards.slice(0, 3).map((card) => (
              <motion.div key={card.title} variants={staggerItem}>
                <Link href={card.href} className="group block">
                  <div
                    className={`${card.bg} p-8 rounded-xl min-h-[240px] flex flex-col justify-between transition-colors duration-300`}
                  >
                    <div>
                      <span
                        className={`material-symbols-outlined text-4xl mb-4 ${card.iconColor} block`}
                      >
                        {card.icon}
                      </span>
                      <h3 className="text-2xl font-bold text-on-surface mb-2 font-headline">
                        {card.title}
                      </h3>
                      <p className="text-on-surface-variant text-sm leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                    <div className="mt-6">
                      <span
                        className={`inline-block ${card.btnBg} rounded-xl px-5 py-2.5 text-sm font-semibold transition-transform duration-200 group-hover:scale-105`}
                      >
                        {card.btnLabel}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {quickAccessCards.slice(3).map((card) => (
              <motion.div key={card.title} variants={staggerItem}>
                <Link href={card.href} className="group block">
                  <div
                    className={`${card.bg} p-8 rounded-xl min-h-[200px] flex flex-col justify-between transition-colors duration-300`}
                  >
                    <div>
                      <span
                        className={`material-symbols-outlined text-4xl mb-4 ${card.iconColor} block`}
                      >
                        {card.icon}
                      </span>
                      <h3 className="text-2xl font-bold text-on-surface mb-2 font-headline">
                        {card.title}
                      </h3>
                      <p className="text-on-surface-variant text-sm leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                    <div className="mt-6">
                      <span
                        className={`inline-block ${card.btnBg} rounded-xl px-5 py-2.5 text-sm font-semibold transition-transform duration-200 group-hover:scale-105`}
                      >
                        {card.btnLabel}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ============================================= */}
        {/* Health Sanctuary Insights                     */}
        {/* ============================================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h2 className="text-xl font-bold text-on-surface font-headline mb-6">
              Health Sanctuary Insights
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insights.map((insight) => (
                <div
                  key={insight.title}
                  className={`${insight.bg} p-6 rounded-xl transition-colors duration-300 hover:bg-[#DBEAFE]`}
                >
                  <span
                    className="material-symbols-outlined text-[#3B82F6] mb-3 block"
                    style={{ fontSize: '32px' }}
                  >
                    {insight.icon}
                  </span>
                  <h3 className="text-lg font-bold text-on-surface mb-2 font-headline">
                    {insight.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    {insight.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
