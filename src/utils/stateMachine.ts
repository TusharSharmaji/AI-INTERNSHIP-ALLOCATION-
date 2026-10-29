/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CandidateState, OrganizationPostState, AllocationProcessState } from '../types/schema';

// Candidate State Transition Graph (from State Diagram image)
export const CANDIDATE_TRANSITIONS: Record<CandidateState, CandidateState[]> = {
  'Registered': ['Email/OTP Verified'],
  'Email/OTP Verified': ['Profile Created'],
  'Profile Created': ['Browse & View Internships', 'Applied for Internship'],
  'Browse & View Internships': ['Applied for Internship'],
  'Applied for Internship': ['Application Submitted (Under Review)', 'Application Withdrawn'],
  'Application Submitted (Under Review)': [
    'Additional Information Requested',
    'Shortlisted',
    'Not Shortlisted',
    'Application Withdrawn'
  ],
  'Additional Information Requested': [
    'Application Submitted (Under Review)',
    'Application Withdrawn'
  ],
  'Shortlisted': ['Selected', 'Selection Rejected', 'Application Withdrawn'],
  'Not Shortlisted': ['Application Closed'],
  'Selected': ['Offer Issued', 'Selection Rejected', 'Application Withdrawn'],
  'Selection Rejected': ['Application Closed'],
  'Offer Issued': ['Offer Accepted', 'Offer Rejected'],
  'Offer Accepted': ['Internship In Progress'],
  'Offer Rejected': ['Application Closed'],
  'Internship In Progress': ['Internship Completed', 'Application Closed'],
  'Internship Completed': [],
  'Application Withdrawn': ['Application Closed'],
  'Application Closed': []
};

// Organization Post State Transition Graph (from State Diagram image)
export const POST_TRANSITIONS: Record<OrganizationPostState, OrganizationPostState[]> = {
  'Organization Registered': ['Email/OTP Verified'],
  'Email/OTP Verified': ['Profile Verified'],
  'Profile Verified': ['Internship Post Created'],
  'Internship Post Created': ['Eligibility Criteria Set'],
  'Eligibility Criteria Set': ['Post Submitted for Approval'],
  'Post Submitted for Approval': ['Post Approved', 'Post Rejected'],
  'Post Rejected': ['Eligibility Criteria Set', 'Post Submitted for Approval'],
  'Post Approved': ['Post Active'],
  'Post Active': ['Slots Filled / Expired', 'Post Suspended'],
  'Post Suspended': ['Post Reactivated', 'Post Closed'],
  'Post Reactivated': ['Post Active', 'Slots Filled / Expired'],
  'Slots Filled / Expired': ['Post Closed'],
  'Post Closed': []
};

// Administrator Allocation Process Transition Graph (from State Diagram image)
export const ALLOCATION_TRANSITIONS: Record<AllocationProcessState, AllocationProcessState[]> = {
  'Allocation Pending': ['Run AI Allocation Engine'],
  'Run AI Allocation Engine': ['AI Generates Ranked Matches'],
  'AI Generates Ranked Matches': ['Under Review'],
  'Under Review': ['Review & Modify Allocation', 'Reallocate', 'Allocation Finalized'],
  'Review & Modify Allocation': ['Allocation Finalized', 'Reallocate'],
  'Reallocate': ['Run AI Allocation Engine', 'Under Review'],
  'Allocation Finalized': ['Candidates Notified', 'Reallocate'],
  'Candidates Notified': ['Reports Generated'],
  'Reports Generated': ['Reported / Completed'],
  'Reported / Completed': []
};

/**
 * Validates if Candidate state transition is legal per State Diagram
 */
export function canTransitionCandidateState(from: CandidateState, to: CandidateState): boolean {
  if (from === to) return true;
  const allowed = CANDIDATE_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/**
 * Validates if Organization Post state transition is legal
 */
export function canTransitionPostState(from: OrganizationPostState, to: OrganizationPostState): boolean {
  if (from === to) return true;
  const allowed = POST_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/**
 * Validates if Allocation Process state transition is legal
 */
export function canTransitionAllocationProcess(from: AllocationProcessState, to: AllocationProcessState): boolean {
  if (from === to) return true;
  const allowed = ALLOCATION_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}
