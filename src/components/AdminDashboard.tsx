/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  Cpu,
  Play,
  TrendingUp,
  Award,
  Users,
  Building2,
  FileCheck,
  RotateCcw,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  BarChart3
} from 'lucide-react';
import { Allocation, Student, Organization, Internship, AIMatchingEngine } from '../types/schema';

interface AdminDashboardProps {
  metrics: {
    totalStudents: number;
    totalOrgs: number;
    totalPosts: number;
    totalAllocations: number;
    offersIssued: number;
    activeInterns: number;
    avgScore: number;
    engine?: AIMatchingEngine;
  };
  allocations: Allocation[];
  students: Student[];
  organizations: Organization[];
  internships: Internship[];
  onRunAllocation: () => Promise<void>;
  onIssueOffer: (allocationId: number) => Promise<void>;
  onViewOffer: (allocation: Allocation) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  metrics,
  allocations,
  students,
  organizations,
  internships,
  onRunAllocation,
  onIssueOffer,
  onViewOffer,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'allocations' | 'organizations' | 'internships' | 'analytics'>('allocations');
  const [runMessage, setRunMessage] = useState<string | null>(null);

  const handleRunClick = async () => {
    setIsRunning(true);
    setRunMessage(null);
    try {
      await onRunAllocation();
      setRunMessage('AI Allocation Engine executed successfully! All candidate-internship vectors evaluated.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Allocation_ID', 'Student_Name', 'Student_Email', 'Internship_Title', 'Organization', 'Match_Score', 'Status', 'Date'];
    const rows = allocations.map(a => [
      a.allocationId,
      `"${a.studentName}"`,
      `"${a.studentEmail}"`,
      `"${a.internshipTitle}"`,
      `"${a.organizationName}"`,
      a.matchScore,
      `"${a.status}"`,
      a.allocationDate,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PM_Internship_Allocation_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Scheme Authority Badging */}
      <div className="bg-linear-to-r from-purple-950 via-indigo-950 to-slate-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              PM Internship Authority • Apex Administration Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Allocation Engine & Verification Command Center
            </h1>
            <p className="text-sm text-purple-200 max-w-2xl">
              Execute AI matching algorithms, review candidate suitability rankings, inspect audit logs, and issue statutory internship allocation offers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 border border-white/20 transition"
            >
              <Download className="w-4 h-4" />
              Export Audit CSV
            </button>
            <button
              onClick={handleRunClick}
              disabled={isRunning}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg transition disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-current" />
              {isRunning ? 'Running AI Engine...' : 'Run AI Allocation Engine'}
            </button>
          </div>
        </div>
      </div>

      {runMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {runMessage}
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-600">Engine v2.4 Active</span>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Candidates</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{metrics.totalStudents}</div>
          <span className="text-[10px] text-emerald-600 font-medium">100% Verified</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Enterprises</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{metrics.totalOrgs}</div>
          <span className="text-[10px] text-indigo-600 font-medium">Approved Orgs</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Active Posts</span>
            <FileCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{metrics.totalPosts}</div>
          <span className="text-[10px] text-blue-600 font-medium">Open Seats</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Allocations</span>
            <Cpu className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{allocations.length}</div>
          <span className="text-[10px] text-purple-600 font-medium">AI Evaluated</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Offers Issued</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600">{metrics.offersIssued}</div>
          <span className="text-[10px] text-amber-600 font-medium">Candidates Notified</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Avg Match Fit</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">{metrics.avgScore}%</div>
          <span className="text-[10px] text-emerald-600 font-medium">Multi-criteria</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('allocations')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'allocations'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Ranked Allocations ({allocations.length})
        </button>

        <button
          onClick={() => setActiveTab('organizations')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'organizations'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Organizations ({organizations.length})
        </button>

        <button
          onClick={() => setActiveTab('internships')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'internships'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Internship Posts ({internships.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Scheme Analytics
        </button>
      </div>

      {/* Tab: Allocations Management Table */}
      {activeTab === 'allocations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Batch Allocation Dossier (Administrator Use Cases 5, 6, 7)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Review automated ranked matches. Finalize allocations to issue official offers.
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Engine Algorithm: WMC-SVC v2.4 (Skills 40%, Loc 20%, Academics 20%, Interests 20%)
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Internship & Org</th>
                  <th className="px-4 py-3">Match Score</th>
                  <th className="px-4 py-3">Current State</th>
                  <th className="px-4 py-3">Remarks</th>
                  <th className="px-4 py-3 text-right">Authority Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocations.map(a => {
                  const score = a.matchScore;
                  const canIssue = a.status === 'Shortlisted' || a.status === 'Selected' || a.status === 'Application Submitted (Under Review)';

                  return (
                    <tr key={a.allocationId} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                        <div>{a.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{a.studentEmail}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{a.internshipTitle}</div>
                        <div className="text-[10px] text-indigo-600 font-semibold">{a.organizationName}</div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black ${
                          score >= 85
                            ? 'bg-emerald-100 text-emerald-800'
                            : score >= 70
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {score}%
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          a.status === 'Offer Issued'
                            ? 'bg-amber-100 text-amber-800 font-bold'
                            : a.status === 'Offer Accepted' || a.status === 'Internship In Progress'
                            ? 'bg-emerald-100 text-emerald-800 font-bold'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {a.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate" title={a.remarks}>
                        {a.remarks}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {canIssue && (
                            <button
                              onClick={() => onIssueOffer(a.allocationId)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] transition shadow-xs flex items-center gap-1"
                            >
                              <Award className="w-3.5 h-3.5" />
                              Issue Offer
                            </button>
                          )}

                          <button
                            onClick={() => onViewOffer(a)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                            title="View Offer Document"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Organizations */}
      {activeTab === 'organizations' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Registered Corporate Employers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizations.map(o => (
              <div key={o.organizationId} className="p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-slate-900">{o.name}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {o.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Industry: {o.industry} • Location: {o.location}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Contact: {o.contactPerson} ({o.contactEmail})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Internships */}
      {activeTab === 'internships' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Approved Internship Positions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {internships.map(i => (
              <div key={i.internshipId} className="p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">{i.organizationName}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{i.title}</h4>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{i.filledSeats}/{i.availableSeats} filled</span>
                </div>
                <p className="text-xs text-slate-600">{i.description}</p>
                <div className="text-xs text-slate-500">
                  Stipend: ₹{i.stipend?.toLocaleString()}/mo • Location: {i.location}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Analytics & Transparency */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
          <h3 className="font-bold text-slate-900">National Scheme Allocation Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800">Scoring Weight Distribution</span>
              <ul className="space-y-1 text-slate-600">
                <li className="flex justify-between"><span>Skills Compatibility:</span> <strong>40%</strong></li>
                <li className="flex justify-between"><span>Location Match:</span> <strong>20%</strong></li>
                <li className="flex justify-between"><span>Academic Merit:</span> <strong>20%</strong></li>
                <li className="flex justify-between"><span>Domain Interests:</span> <strong>20%</strong></li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800">State Transition Verification</span>
              <ul className="space-y-1 text-slate-600">
                <li className="flex justify-between"><span>Pending Allocations:</span> <strong>{allocations.filter(a => a.status.includes('Review') || a.status.includes('Submitted')).length}</strong></li>
                <li className="flex justify-between"><span>Shortlisted / Selected:</span> <strong>{allocations.filter(a => a.status === 'Shortlisted' || a.status === 'Selected').length}</strong></li>
                <li className="flex justify-between"><span>Offers Active:</span> <strong>{allocations.filter(a => a.status === 'Offer Issued').length}</strong></li>
                <li className="flex justify-between"><span>In Progress / Placed:</span> <strong>{allocations.filter(a => a.status === 'Internship In Progress').length}</strong></li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800">Direct Benefit Transfer (DBT)</span>
              <ul className="space-y-1 text-slate-600">
                <li className="flex justify-between"><span>Stipend Base:</span> <strong>₹20,000 - ₹25,000/mo</strong></li>
                <li className="flex justify-between"><span>Disbursement Mode:</span> <strong>Direct Bank Transfer</strong></li>
                <li className="flex justify-between"><span>Authority Audit:</span> <strong>Verified Compliant</strong></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
