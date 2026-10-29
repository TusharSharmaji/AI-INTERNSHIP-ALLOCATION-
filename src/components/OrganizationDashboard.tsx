/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Users,
  CheckCircle,
  XCircle,
  Sparkles,
  MapPin,
  Clock,
  Briefcase,
  AlertCircle,
  Award
} from 'lucide-react';
import { Internship, Allocation, StudentProfile } from '../types/schema';

interface OrganizationDashboardProps {
  organizationName: string;
  posts: Internship[];
  applicants: (Allocation & { profile?: StudentProfile })[];
  onCreatePost: (newPost: any) => Promise<void>;
  onShortlistCandidate: (allocationId: number, decision: 'Shortlist' | 'Select' | 'Reject') => Promise<void>;
}

export const OrganizationDashboard: React.FC<OrganizationDashboardProps> = ({
  organizationName,
  posts,
  applicants,
  onCreatePost,
  onShortlistCandidate,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'applicants'>('applicants');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New post form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState('');
  const [location, setLocation] = useState('New Delhi');
  const [stipend, setStipend] = useState('25000');
  const [availableSeats, setAvailableSeats] = useState('3');
  const [submitting, setSubmitting] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onCreatePost({
        title,
        description,
        requiredSkills: requiredSkills.split(',').map(s => s.trim()),
        eligibilityCriteria,
        location,
        duration: '6 Months',
        stipend: parseFloat(stipend) || 20000,
        availableSeats: parseInt(availableSeats, 10) || 2,
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setRequiredSkills('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              Corporate Partner Portal • PM Internship Scheme
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {organizationName}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Post high-impact internship opportunities, review AI-ranked candidate dossiers, and confirm selections under the PM Scheme.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition self-start md:self-center"
          >
            <Plus className="w-4 h-4" />
            Create Internship Post
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('applicants')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'applicants'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Matched Candidates & Applicants ({applicants.length})
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'posts'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Active Internship Posts ({posts.length})
        </button>
      </div>

      {/* Tab: Matched Applicants */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              AI Evaluated Candidates (Ranked by Match Score)
            </h2>
            <span className="text-xs text-slate-500">
              State transitions conform to Organization Use Cases 6-9
            </span>
          </div>

          {applicants.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No applicants yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Run the AI Allocation Engine from the Admin dashboard to match candidates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applicants.map(app => {
                const score = app.matchScore || 85;
                const p = app.profile;

                return (
                  <div
                    key={app.allocationId}
                    className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">
                            {app.studentName}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Applied for: <strong>{app.internshipTitle}</strong>
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                          score >= 90
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : score >= 75
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {score}% Fit
                        </span>
                      </div>

                      {p && (
                        <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 border border-slate-100">
                          <div>
                            <span className="font-semibold text-slate-700">Education: </span>
                            {p.education} ({p.percentage}%)
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Location Pref: </span>
                            {p.locationPreference || 'National'}
                          </div>
                          <div className="flex flex-wrap gap-1 pt-1">
                            {p.skills.slice(0, 6).map(s => (
                              <span key={s} className="px-1.5 py-0.5 bg-white border border-slate-200 text-slate-700 text-[10px] rounded-sm">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-slate-600 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/50">
                        <span className="font-semibold text-indigo-900">Current State: </span>
                        <span className="font-bold text-indigo-700">{app.status}</span>
                      </div>
                    </div>

                    {/* Decision Buttons */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onShortlistCandidate(app.allocationId, 'Reject')}
                        className="px-3 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg font-medium transition"
                      >
                        Decline
                      </button>

                      <div className="flex items-center gap-2">
                        {app.status !== 'Shortlisted' && app.status !== 'Selected' && !app.status.includes('Offer') && (
                          <button
                            onClick={() => onShortlistCandidate(app.allocationId, 'Shortlist')}
                            className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition"
                          >
                            Shortlist
                          </button>
                        )}
                        <button
                          onClick={() => onShortlistCandidate(app.allocationId, 'Select')}
                          className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Confirm Selection
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Active Posts */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map(p => (
            <div key={p.internshipId} className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-slate-900 text-base">{p.title}</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {p.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2">{p.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{p.location}</span>
                <span className="font-semibold text-slate-800">₹{p.stipend?.toLocaleString()}/mo</span>
                <span>{p.filledSeats} / {p.availableSeats} filled</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Internship Post */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              Create New Internship Post (Organization Use Case 3)
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Position Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Cloud Security Analyst Intern"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Key responsibilities and project domains..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  required
                  value={requiredSkills}
                  onChange={e => setRequiredSkills(e.target.value)}
                  placeholder="Python, AWS, Docker, Kubernetes"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Stipend</label>
                  <input
                    type="number"
                    value={stipend}
                    onChange={e => setStipend(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Seats</label>
                  <input
                    type="number"
                    value={availableSeats}
                    onChange={e => setAvailableSeats(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                >
                  {submitting ? 'Submitting...' : 'Submit Post for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
