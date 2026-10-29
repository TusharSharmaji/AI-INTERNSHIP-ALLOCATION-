/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GraduationCap,
  MapPin,
  Briefcase,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Award,
  FileCheck,
  ChevronRight,
  TrendingUp,
  Tag,
  Building2,
  Send,
  AlertCircle
} from 'lucide-react';
import { Student, StudentProfile, Internship, Allocation, CandidateState } from '../types/schema';

interface CandidateDashboardProps {
  student: Student | null;
  profile: StudentProfile | null;
  recommendations: (Internship & { matchScore?: number; applicationStatus?: string | null; allocationId?: number | null })[];
  allocations: Allocation[];
  onApply: (internshipId: number) => Promise<void>;
  onViewOffer: (allocation: Allocation) => void;
  onUpdateProfile: (updatedData: Partial<StudentProfile>) => Promise<void>;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  student,
  profile,
  recommendations,
  allocations,
  onApply,
  onViewOffer,
  onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'applications' | 'profile'>('recommendations');
  const [applyingId, setApplyingId] = useState<number | null>(null);

  // Profile editing state
  const [skillsInput, setSkillsInput] = useState(profile?.skills?.join(', ') || '');
  const [locationPref, setLocationPref] = useState(profile?.locationPreference || 'New Delhi');
  const [interestsInput, setInterestsInput] = useState(profile?.interests?.join(', ') || '');
  const [education, setEducation] = useState(profile?.education || 'B.Tech in Computer Science & Engineering');
  const [percentage, setPercentage] = useState(profile?.percentage?.toString() || '88.5');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleApplyClick = async (internshipId: number) => {
    setApplyingId(internshipId);
    try {
      await onApply(internshipId);
    } finally {
      setApplyingId(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setSaveMessage(null);
    try {
      const skillsArray = skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const interestsArray = interestsInput
        .split(',')
        .map(i => i.trim())
        .filter(Boolean);

      await onUpdateProfile({
        education,
        percentage: parseFloat(percentage) || 75,
        skills: skillsArray,
        interests: interestsArray,
        locationPreference: locationPref,
      });
      setSaveMessage('Profile saved and synchronized with AI Matching Engine!');
    } catch {
      setSaveMessage('Error updating profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getStatusBadge = (status: CandidateState) => {
    switch (status) {
      case 'Offer Issued':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'Offer Accepted':
      case 'Internship In Progress':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'Shortlisted':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Application Submitted (Under Review)':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Offer Rejected':
      case 'Application Closed':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Candidate Identity */}
      <div className="bg-linear-to-r from-indigo-900 via-blue-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              PM Internship Scheme • National Allocation Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {student?.name || 'Candidate'}!
            </h1>
            <p className="text-sm text-indigo-200 max-w-2xl">
              Your profile is verified and active in the AI Matching Pipeline. Review personalized allocations, track state milestones, and respond to incoming offers.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15">
            <div className="text-center">
              <span className="text-2xl font-black text-amber-300">
                {profile?.profileScore || 92}%
              </span>
              <p className="text-[10px] text-indigo-200 font-medium uppercase tracking-wider">
                Profile Score
              </p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <span className="text-2xl font-black text-emerald-300">
                {allocations.length}
              </span>
              <p className="text-[10px] text-indigo-200 font-medium uppercase tracking-wider">
                Active Tracks
              </p>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'recommendations'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          AI Recommendations ({recommendations.length})
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'applications'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          My Applications & Offers ({allocations.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Candidate Profile & Skills
        </button>
      </div>

      {/* Tab 1: AI Recommended Internships */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Ranked Matches from AI Allocation Engine
            </h2>
            <span className="text-xs text-slate-500">
              Scored via Skills (40%), Location (20%), Academics (20%), Interests (20%)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map(internship => {
              const score = internship.matchScore || 85;
              const hasApplied = internship.applicationStatus !== null && internship.applicationStatus !== undefined;
              const hasOffer = internship.applicationStatus === 'Offer Issued';

              return (
                <div
                  key={internship.internshipId}
                  className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-indigo-200 transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
                          {internship.organizationName}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base leading-snug mt-0.5">
                          {internship.title}
                        </h3>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                          score >= 90
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : score >= 75
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          {score}% Match
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {internship.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {internship.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {internship.duration}
                      </span>
                      <span className="font-semibold text-slate-800">
                        ₹{internship.stipend?.toLocaleString()}/mo
                      </span>
                      <span className="text-slate-400">
                        • {internship.availableSeats - internship.filledSeats} seats left
                      </span>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {internship.requiredSkills.map(sk => {
                        const candidateHas = profile?.skills?.some(
                          cs => cs.toLowerCase() === sk.toLowerCase()
                        );
                        return (
                          <span
                            key={sk}
                            className={`text-[11px] px-2 py-0.5 rounded-sm border ${
                              candidateHas
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-medium'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {sk} {candidateHas && '✓'}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    {hasOffer ? (
                      <button
                        onClick={() => {
                          const alloc = allocations.find(a => a.allocationId === internship.allocationId);
                          if (alloc) onViewOffer(alloc);
                        }}
                        className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition animate-pulse"
                      >
                        <Award className="w-4 h-4" />
                        Official Offer Issued! Review & Accept
                      </button>
                    ) : hasApplied ? (
                      <div className="flex items-center justify-between w-full">
                        <span className={`text-xs px-2.5 py-1 rounded-md border ${getStatusBadge(internship.applicationStatus as CandidateState)}`}>
                          Status: {internship.applicationStatus}
                        </span>
                        <span className="text-[11px] text-slate-400">In evaluation</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApplyClick(internship.internshipId)}
                        disabled={applyingId === internship.internshipId}
                        className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        {applyingId === internship.internshipId ? 'Submitting Application...' : 'Apply for Internship'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: My Applications & Official State Timeline */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Internship Application Lifecycle (State Machine Progress)
            </h2>
            <span className="text-xs text-slate-500">
              State transitions conform strictly to PM Scheme State Diagram
            </span>
          </div>

          {allocations.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No active applications found</p>
              <p className="text-xs text-slate-500 mt-1">
                Explore recommended opportunities and click 'Apply for Internship'
              </p>
            </div>
          ) : (
            allocations.map(alloc => (
              <div
                key={alloc.allocationId}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                      {alloc.organizationName}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                      {alloc.internshipTitle}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Application Reference: #PM-INT-{alloc.allocationId} • Evaluated on {alloc.allocationDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1.5 rounded-lg border font-bold ${getStatusBadge(alloc.status)}`}>
                      State: {alloc.status}
                    </span>

                    {(alloc.status === 'Offer Issued' || alloc.status === 'Offer Accepted' || alloc.status === 'Internship In Progress') && (
                      <button
                        onClick={() => onViewOffer(alloc)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition"
                      >
                        <Award className="w-4 h-4" />
                        View Official Letter
                      </button>
                    )}
                  </div>
                </div>

                {/* State Timeline Flow Visualization */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                    State Machine Progression
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                      1. Profile Created
                      <CheckCircle2 className="w-3.5 h-3.5 mx-auto mt-1 text-emerald-600" />
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                      2. Applied
                      <CheckCircle2 className="w-3.5 h-3.5 mx-auto mt-1 text-emerald-600" />
                    </div>
                    <div className={`p-2 rounded-lg border ${
                      alloc.status !== 'Registered' && alloc.status !== 'Profile Created'
                        ? 'bg-emerald-100 text-emerald-800 font-semibold border-emerald-200'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}>
                      3. Under Review
                      <CheckCircle2 className="w-3.5 h-3.5 mx-auto mt-1" />
                    </div>
                    <div className={`p-2 rounded-lg border ${
                      ['Shortlisted', 'Selected', 'Offer Issued', 'Offer Accepted', 'Internship In Progress'].includes(alloc.status)
                        ? 'bg-emerald-100 text-emerald-800 font-semibold border-emerald-200'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}>
                      4. Shortlisted / Offer
                      <Award className="w-3.5 h-3.5 mx-auto mt-1" />
                    </div>
                    <div className={`p-2 rounded-lg border ${
                      ['Offer Accepted', 'Internship In Progress', 'Internship Completed'].includes(alloc.status)
                        ? 'bg-emerald-100 text-emerald-800 font-semibold border-emerald-200'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}>
                      5. In Progress
                      <Sparkles className="w-3.5 h-3.5 mx-auto mt-1 text-amber-500" />
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                  <strong className="text-slate-800">Status Remarks:</strong> {alloc.remarks}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Candidate Profile & Skills Manager */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-3xl">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Candidate Profile & Eligibility Criteria (Use Case 4)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Updating these fields re-indexes your profile in the AI Matching Engine.
            </p>
          </div>

          {saveMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {saveMessage}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Highest Education / Degree
              </label>
              <input
                type="text"
                value={education}
                onChange={e => setEducation(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Aggregate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={percentage}
                  onChange={e => setPercentage(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location Preference
                </label>
                <input
                  type="text"
                  value={locationPref}
                  onChange={e => setLocationPref(e.target.value)}
                  placeholder="e.g. New Delhi, Bengaluru, Remote"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Skills (Comma Separated - 40% weight in AI matching)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={e => setSkillsInput(e.target.value)}
                placeholder="Python, React, Machine Learning, SQL, TypeScript"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Domain Interests (Comma Separated - 20% weight in AI matching)
              </label>
              <input
                type="text"
                value={interestsInput}
                onChange={e => setInterestsInput(e.target.value)}
                placeholder="Artificial Intelligence, Data Science, Cloud, Web Development"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSavingProfile}
              className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
            >
              {isSavingProfile ? 'Saving & Re-ranking...' : 'Save Profile & Update Matching'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
