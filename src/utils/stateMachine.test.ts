/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canTransitionCandidateState,
  canTransitionPostState,
  canTransitionAllocationProcess,
} from './stateMachine';

test('Candidate State Transitions: enforces legal lifecycle flow', () => {
  // Valid progression: Registered -> Email/OTP Verified -> Profile Created -> Applied for Internship
  assert.equal(canTransitionCandidateState('Registered', 'Email/OTP Verified'), true);
  assert.equal(canTransitionCandidateState('Email/OTP Verified', 'Profile Created'), true);
  assert.equal(canTransitionCandidateState('Profile Created', 'Applied for Internship'), true);
  assert.equal(canTransitionCandidateState('Applied for Internship', 'Application Submitted (Under Review)'), true);
  assert.equal(canTransitionCandidateState('Application Submitted (Under Review)', 'Shortlisted'), true);
  assert.equal(canTransitionCandidateState('Shortlisted', 'Selected'), true);
  assert.equal(canTransitionCandidateState('Selected', 'Offer Issued'), true);
  assert.equal(canTransitionCandidateState('Offer Issued', 'Offer Accepted'), true);
  assert.equal(canTransitionCandidateState('Offer Accepted', 'Internship In Progress'), true);
  assert.equal(canTransitionCandidateState('Internship In Progress', 'Internship Completed'), true);

  // Invalid shortcuts
  assert.equal(canTransitionCandidateState('Registered', 'Offer Issued'), false);
  assert.equal(canTransitionCandidateState('Profile Created', 'Internship Completed'), false);
  assert.equal(canTransitionCandidateState('Not Shortlisted', 'Offer Issued'), false);
});

test('Organization Post State Transitions: enforces approval and publishing flow', () => {
  assert.equal(canTransitionPostState('Organization Registered', 'Email/OTP Verified'), true);
  assert.equal(canTransitionPostState('Email/OTP Verified', 'Profile Verified'), true);
  assert.equal(canTransitionPostState('Profile Verified', 'Internship Post Created'), true);
  assert.equal(canTransitionPostState('Internship Post Created', 'Eligibility Criteria Set'), true);
  assert.equal(canTransitionPostState('Eligibility Criteria Set', 'Post Submitted for Approval'), true);
  assert.equal(canTransitionPostState('Post Submitted for Approval', 'Post Approved'), true);
  assert.equal(canTransitionPostState('Post Approved', 'Post Active'), true);

  // Rejection & Suspension paths
  assert.equal(canTransitionPostState('Post Submitted for Approval', 'Post Rejected'), true);
  assert.equal(canTransitionPostState('Post Active', 'Post Suspended'), true);
  assert.equal(canTransitionPostState('Post Suspended', 'Post Reactivated'), true);
  assert.equal(canTransitionPostState('Post Reactivated', 'Post Active'), true);

  // Illegal: cannot go from Created straight to Active without Admin Approval
  assert.equal(canTransitionPostState('Internship Post Created', 'Post Active'), false);
});

test('Allocation Process State Transitions: enforces admin control workflow', () => {
  assert.equal(canTransitionAllocationProcess('Allocation Pending', 'Run AI Allocation Engine'), true);
  assert.equal(canTransitionAllocationProcess('Run AI Allocation Engine', 'AI Generates Ranked Matches'), true);
  assert.equal(canTransitionAllocationProcess('AI Generates Ranked Matches', 'Under Review'), true);
  assert.equal(canTransitionAllocationProcess('Under Review', 'Allocation Finalized'), true);
  assert.equal(canTransitionAllocationProcess('Allocation Finalized', 'Candidates Notified'), true);
  assert.equal(canTransitionAllocationProcess('Candidates Notified', 'Reports Generated'), true);
  assert.equal(canTransitionAllocationProcess('Reports Generated', 'Reported / Completed'), true);

  // Illegal bypass
  assert.equal(canTransitionAllocationProcess('Allocation Pending', 'Candidates Notified'), false);
});
