/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Cpu, Sparkles, Sliders, CheckCircle2, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';
import { Student, StudentProfile, Internship } from '../types/schema';
import { calculateMatchScore } from '../utils/aiEngine';

interface EngineSimulatorProps {
  students: (Student & { profile?: StudentProfile })[];
  internships: Internship[];
}

export const EngineSimulator: React.FC<EngineSimulatorProps> = ({ students, internships }) => {
  const [selectedStudentId, setSelectedStudentId] = useState<number>(students[0]?.studentId || 1);
  const [selectedInternshipId, setSelectedInternshipId] = useState<number>(internships[0]?.internshipId || 1);

  const selectedStudent = students.find(s => s.studentId === selectedStudentId);
  const selectedProfile = selectedStudent?.profile;
  const selectedInternship = internships.find(i => i.internshipId === selectedInternshipId);

  const result = selectedProfile && selectedInternship
    ? calculateMatchScore(selectedProfile, selectedInternship)
    : null;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
              <Cpu className="w-3.5 h-3.5" />
              Machine Learning & Matching Algorithm
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              AI Smart Allocation Engine Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-1">
              Test and trace multi-vector candidate-to-internship matching with real-time explainability, weight breakdown, and skill gap identification.
            </p>
          </div>
          <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-slate-600">
            <div>Model: WMC-SVC v2.4</div>
            <div>Scoring: 0 - 100 normalized</div>
          </div>
        </div>
      </div>

      {/* Simulator Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Candidate Selector */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Candidate Profile (Input Vector A)
          </label>
          <select
            value={selectedStudentId}
            onChange={e => setSelectedStudentId(Number(e.target.value))}
            className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            {students.map(s => (
              <option key={s.studentId} value={s.studentId}>
                {s.name} ({s.profile?.education || 'Candidate'})
              </option>
            ))}
          </select>

          {selectedProfile && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div>
                <span className="font-semibold text-slate-800">Education: </span>
                {selectedProfile.education} ({selectedProfile.percentage}%)
              </div>
              <div>
                <span className="font-semibold text-slate-800">Location Preference: </span>
                {selectedProfile.locationPreference || 'National'}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Skills ({selectedProfile.skills.length}): </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedProfile.skills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-white border border-slate-200 rounded-sm text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-semibold text-slate-800">Domain Interests: </span>
                {selectedProfile.interests.join(', ')}
              </div>
            </div>
          )}
        </div>

        {/* Internship Selector */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Select Internship Post (Input Vector B)
          </label>
          <select
            value={selectedInternshipId}
            onChange={e => setSelectedInternshipId(Number(e.target.value))}
            className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            {internships.map(i => (
              <option key={i.internshipId} value={i.internshipId}>
                {i.title} • {i.organizationName}
              </option>
            ))}
          </select>

          {selectedInternship && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div>
                <span className="font-semibold text-slate-800">Organization: </span>
                {selectedInternship.organizationName}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Location: </span>
                {selectedInternship.location}
              </div>
              <div>
                <span className="font-semibold text-slate-800">Required Skills: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedInternship.requiredSkills.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-white border border-slate-200 rounded-sm text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-semibold text-slate-800">Eligibility Criteria: </span>
                {selectedInternship.eligibilityCriteria}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Matching Result & Weight Breakdown */}
      {result && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                Matching Computation Result
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-0.5">
                Composite Compatibility Score
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {result.fitExplanation}
              </p>
            </div>

            <div className="shrink-0 text-center bg-indigo-50 border border-indigo-200 p-4 rounded-2xl">
              <span className="text-3xl font-black text-indigo-900">
                {result.totalScore}%
              </span>
              <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mt-0.5">
                Aggregate Score
              </div>
            </div>
          </div>

          {/* 4 Factor Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700">1. Skills Overlap</span>
                <span className="text-indigo-600">{result.skillsScore} / 40 pts</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(result.skillsScore / 40) * 100}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500">
                Weight: 40% ({result.matchingSkills.length} matched)
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700">2. Location Affinity</span>
                <span className="text-indigo-600">{result.locationScore} / 20 pts</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(result.locationScore / 20) * 100}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500">
                Weight: 20% (City proximity)
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700">3. Academic Merit</span>
                <span className="text-indigo-600">{result.academicsScore} / 20 pts</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(result.academicsScore / 20) * 100}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500">
                Weight: 20% (Degree & Marks)
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-700">4. Domain Interest</span>
                <span className="text-indigo-600">{result.interestsScore} / 20 pts</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(result.interestsScore / 20) * 100}%` }}
                />
              </div>
              <div className="text-[11px] text-slate-500">
                Weight: 20% (Domain affinity)
              </div>
            </div>
          </div>

          {/* Detailed Skill Analysis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Matching Competencies ({result.matchingSkills.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.matchingSkills.length === 0 ? (
                  <span className="text-xs text-slate-500">No direct skill matches</span>
                ) : (
                  result.matchingSkills.map(sk => (
                    <span key={sk} className="text-xs px-2.5 py-1 bg-white text-emerald-800 rounded-md border border-emerald-200 font-semibold">
                      {sk}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Missing Competencies / Upskilling Opportunities ({result.missingSkills.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.missingSkills.length === 0 ? (
                  <span className="text-xs text-emerald-700 font-semibold">Candidate meets all skill requirements!</span>
                ) : (
                  result.missingSkills.map(sk => (
                    <span key={sk} className="text-xs px-2.5 py-1 bg-white text-amber-800 rounded-md border border-amber-200">
                      {sk}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
