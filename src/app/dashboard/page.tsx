'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { Prescription, LabReport } from '@/types';

export default function DashboardPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [rxRes, labRes] = await Promise.all([
          fetch('/api/prescriptions'),
          fetch('/api/lab-reports'),
        ]);
        const rxData = await rxRes.json();
        const labData = await labRes.json();
        setPrescriptions(rxData.prescriptions || []);
        setLabReports(labData.reports || []);
      } catch {
        console.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'check_circle';
      case 'failed': return 'cancel';
      default: return 'schedule';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return { text: 'text-[#7C3AED]', bg: 'bg-[#EDE9FE]/30 text-[#7C3AED]' };
      case 'failed': return { text: 'text-[#bd0c3b]', bg: 'bg-[#bd0c3b]/10 text-[#bd0c3b]' };
      case 'pending': return { text: 'text-amber-600', bg: 'bg-amber-100 text-amber-700' };
      default: return { text: 'text-[#475569]', bg: 'bg-[#EFF6FF] text-[#475569]' };
    }
  };

  const stats = [
    { label: 'Total Prescriptions', value: prescriptions.length, icon: 'description', color: 'text-[#3B82F6]', bg: 'bg-[#DBEAFE]' },
    { label: 'Lab Reports', value: labReports.length, icon: 'science', color: 'text-[#7C3AED]', bg: 'bg-[#EDE9FE]/40' },
    { label: 'Completed', value: prescriptions.filter((p) => p.status === 'completed').length, icon: 'task_alt', color: 'text-[#3B82F6]', bg: 'bg-[#EFF6FF]' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9ff]">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#EFF6FF] py-12 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="font-headline text-4xl font-extrabold text-[#00345e] mb-1">
                Your Health Home
              </h1>
              <p className="text-[#475569] text-base">
                Overview of your prescriptions, lab reports, and analysis activity.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link
                href="/analyze"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3B82F6] text-white text-sm font-semibold hover:bg-[#2563EB] transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                New Analysis
              </Link>
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-6"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                    <span className={`material-symbols-outlined ${stat.color}`} style={{ fontSize: '24px' }}>{stat.icon}</span>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-[#00345e]">{stat.value}</p>
                    <p className="text-xs text-[#475569]/60 font-medium">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            <Link
              href="/analyze"
              className="bg-white rounded-xl p-5 flex items-center gap-4 hover:bg-[#EFF6FF] transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '20px' }}>upload_file</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#00345e]">Upload Prescription</p>
                <p className="text-xs text-[#475569]/60">Analyze a new prescription</p>
              </div>
              <span className="material-symbols-outlined text-[#475569]/30 group-hover:text-[#3B82F6] transition-colors" style={{ fontSize: '20px' }}>arrow_forward</span>
            </Link>
            <Link
              href="/lab-report"
              className="bg-white rounded-xl p-5 flex items-center gap-4 hover:bg-[#EFF6FF] transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EDE9FE]/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#7C3AED]" style={{ fontSize: '20px' }}>lab_panel</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#00345e]">Upload Lab Report</p>
                <p className="text-xs text-[#475569]/60">Get AI analysis of results</p>
              </div>
              <span className="material-symbols-outlined text-[#475569]/30 group-hover:text-[#3B82F6] transition-colors" style={{ fontSize: '20px' }}>arrow_forward</span>
            </Link>
            <Link
              href="/lab-tests"
              className="bg-white rounded-xl p-5 flex items-center gap-4 hover:bg-[#EFF6FF] transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '20px' }}>biotech</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#00345e]">Lab Test Hub</p>
                <p className="text-xs text-[#475569]/60">Learn about lab tests</p>
              </div>
              <span className="material-symbols-outlined text-[#475569]/30 group-hover:text-[#3B82F6] transition-colors" style={{ fontSize: '20px' }}>arrow_forward</span>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Prescriptions */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-headline text-base font-bold text-[#00345e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '22px' }}>description</span>
                  Recent Prescriptions
                </h2>
                <Link href="/analyze" className="text-xs text-[#3B82F6] font-semibold hover:underline">View all</Link>
              </div>
              {loading ? (
                <div className="py-8 text-center">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 w-48 mx-auto bg-[#EFF6FF] rounded" />
                    <div className="h-4 w-36 mx-auto bg-[#EFF6FF] rounded" />
                  </div>
                </div>
              ) : prescriptions.length === 0 ? (
                <div className="py-10 text-center">
                  <span className="material-symbols-outlined text-[#475569]/20 mb-3 block" style={{ fontSize: '40px' }}>description</span>
                  <p className="text-sm text-[#475569]/60">
                    No prescriptions yet.{' '}
                    <Link href="/analyze" className="text-[#3B82F6] font-semibold hover:underline">Upload one</Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {prescriptions.slice(0, 8).map((rx) => {
                    const colors = statusColor(rx.status);
                    return (
                      <div
                        key={rx.id}
                        className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-[#EFF6FF] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined ${colors.text}`} style={{ fontSize: '18px' }}>
                            {statusIcon(rx.status)}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-[#00345e]">{rx.fileName}</p>
                            <p className="text-xs text-[#475569]/50">
                              {new Date(rx.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${colors.bg}`}>
                          {rx.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Lab Reports */}
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-headline text-base font-bold text-[#00345e] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#3B82F6]" style={{ fontSize: '22px' }}>science</span>
                  Recent Lab Reports
                </h2>
                <Link href="/lab-report" className="text-xs text-[#3B82F6] font-semibold hover:underline">View all</Link>
              </div>
              {loading ? (
                <div className="py-8 text-center">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 w-48 mx-auto bg-[#EFF6FF] rounded" />
                    <div className="h-4 w-36 mx-auto bg-[#EFF6FF] rounded" />
                  </div>
                </div>
              ) : labReports.length === 0 ? (
                <div className="py-10 text-center">
                  <span className="material-symbols-outlined text-[#475569]/20 mb-3 block" style={{ fontSize: '40px' }}>science</span>
                  <p className="text-sm text-[#475569]/60">
                    No lab reports yet.{' '}
                    <Link href="/lab-report" className="text-[#3B82F6] font-semibold hover:underline">Upload one</Link>
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {labReports.slice(0, 8).map((report) => {
                    const colors = statusColor(report.status);
                    return (
                      <div
                        key={report.id}
                        className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-[#EFF6FF] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined ${colors.text}`} style={{ fontSize: '18px' }}>
                            {statusIcon(report.status)}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-[#00345e]">{report.fileName}</p>
                            <p className="text-xs text-[#475569]/50">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${colors.bg}`}>
                          {report.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 bg-[#EFF6FF] rounded-xl p-6 flex items-start gap-3">
            <span className="material-symbols-outlined text-[#475569]" style={{ fontSize: '22px' }}>gavel</span>
            <p className="text-xs text-[#475569] leading-relaxed">
              For informational purposes only. Consult your doctor or pharmacist for medical advice.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
