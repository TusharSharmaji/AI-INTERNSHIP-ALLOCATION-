/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Award, CheckCircle2, XCircle, Printer, Download, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Allocation } from '../types/schema';

interface OfferLetterModalProps {
  isOpen: boolean;
  allocation: Allocation | null;
  onClose: () => void;
  onAccept: (allocationId: number) => void;
  onReject: (allocationId: number) => void;
}

export const OfferLetterModal: React.FC<OfferLetterModalProps> = ({
  isOpen,
  allocation,
  onClose,
  onAccept,
  onReject,
}) => {
  if (!isOpen || !allocation) return null;

  const handleAcceptClick = () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
    onAccept(allocation.allocationId);
  };

  const isAccepted = allocation.status === 'Offer Accepted' || allocation.status === 'Internship In Progress' || allocation.status === 'Internship Completed';
  const isRejected = allocation.status === 'Offer Rejected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Accent */}
        <div className="h-1.5 w-full bg-linear-to-r from-orange-500 via-white to-emerald-600" />

        {/* Modal Controls */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Official Allocation Letter • PM Internship Scheme
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 text-xs flex items-center gap-1"
              title="Print Offer Letter"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Document Body */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-800 font-serif">
          {/* Letterhead */}
          <div className="text-center border-b border-slate-200 pb-6 space-y-1">
            <div className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-sans font-bold rounded-sm mb-2">
              GOVERNMENT OF INDIA • PM INTERNSHIP SCHEME
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
              OFFICIAL INTERNSHIP ALLOCATION LETTER
            </h2>
            <p className="text-xs font-sans text-slate-500">
              National AI-Based Allocation Portal • Ministry of Corporate Affairs
            </p>
            <div className="text-[11px] font-mono text-slate-400 mt-2">
              Ref No: PM-INT-2026-{allocation.allocationId.toString().padStart(6, '0')} | Date: {allocation.allocationDate}
            </div>
          </div>

          {/* Salutation & Subject */}
          <div className="space-y-3 font-sans text-xs">
            <div className="flex justify-between items-start text-xs text-slate-600">
              <div>
                <strong>To:</strong><br />
                {allocation.studentName || 'Candidate'}<br />
                {allocation.studentEmail || 'Registered Candidate'}<br />
                Application ID: #{allocation.allocationId}
              </div>
              <div className="text-right">
                <span className="px-2 py-1 rounded-sm text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI Fit Score: {allocation.matchScore}%
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-semibold text-slate-900">
              Subject: Provisional Selection & Allocation under the Prime Minister's Internship Scheme 2026
            </div>
          </div>

          {/* Letter Body Text */}
          <div className="text-xs leading-relaxed text-slate-700 space-y-3">
            <p>
              Dear <strong>{allocation.studentName}</strong>,
            </p>
            <p>
              We are pleased to inform you that based on the evaluated criteria, academic merit, and the AI Smart Matching Algorithm, you have been selected for the internship position of:
            </p>
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 font-sans space-y-1">
              <div className="text-sm font-bold text-indigo-950">
                {allocation.internshipTitle}
              </div>
              <div className="text-xs font-medium text-indigo-800">
                Organization: <strong>{allocation.organizationName}</strong>
              </div>
              <div className="text-xs text-slate-600">
                Monthly Stipend: ₹25,000/- (Direct Benefit Transfer Supported) | Duration: 6 Months
              </div>
            </div>
            <p>
              This allocation is governed by the official guidelines of the PM Internship Scheme. As outlined in the scheme’s statutory framework, you will gain hands-on industrial immersion, direct mentorship under recognized industry leads, and a recognized National Certificate upon completion.
            </p>
            <div className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/50">
              Remarks from Allocation Engine: "{allocation.remarks}"
            </div>
          </div>

          {/* Signature and Verification */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between font-sans">
            <div>
              <div className="font-bold text-xs text-slate-900">Dr. Rajiv Menon</div>
              <div className="text-[10px] text-slate-500">Director General, PM Internship Authority</div>
              <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Cryptographically Signed via Digital Authority Seal
              </div>
            </div>
            <div className="text-right">
              <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-[9px] text-slate-400 text-center leading-tight">
                OFFICIAL SEAL<br />PM-INT-IN
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs">
            <span className="text-slate-500">Current Status: </span>
            <span className={`font-bold ${
              isAccepted ? 'text-emerald-600' : isRejected ? 'text-rose-600' : 'text-indigo-600'
            }`}>
              {allocation.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isAccepted && !isRejected && (
              <>
                <button
                  onClick={() => onReject(allocation.allocationId)}
                  className="px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  Decline Offer
                </button>
                <button
                  onClick={handleAcceptClick}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Accept & Confirm Internship
                </button>
              </>
            )}

            {isAccepted && (
              <div className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Offer Accepted • In Progress
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
