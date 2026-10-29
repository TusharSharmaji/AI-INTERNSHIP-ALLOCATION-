/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Candidate' | 'Organization' | 'Admin';

// Candidate Lifecycle States (from State Diagram)
export type CandidateState =
  | 'Registered'
  | 'Email/OTP Verified'
  | 'Profile Created'
  | 'Browse & View Internships'
  | 'Applied for Internship'
  | 'Application Submitted (Under Review)'
  | 'Additional Information Requested'
  | 'Shortlisted'
  | 'Not Shortlisted'
  | 'Selected'
  | 'Selection Rejected'
  | 'Offer Issued'
  | 'Offer Accepted'
  | 'Offer Rejected'
  | 'Internship In Progress'
  | 'Internship Completed'
  | 'Application Withdrawn'
  | 'Application Closed';

// Organization Post Lifecycle States (from State Diagram)
export type OrganizationPostState =
  | 'Organization Registered'
  | 'Email/OTP Verified'
  | 'Profile Verified'
  | 'Internship Post Created'
  | 'Eligibility Criteria Set'
  | 'Post Submitted for Approval'
  | 'Post Approved'
  | 'Post Rejected'
  | 'Post Active'
  | 'Slots Filled / Expired'
  | 'Post Closed'
  | 'Post Suspended'
  | 'Post Reactivated';

// Allocation Process Lifecycle States (from State Diagram)
export type AllocationProcessState =
  | 'Allocation Pending'
  | 'Run AI Allocation Engine'
  | 'AI Generates Ranked Matches'
  | 'Under Review'
  | 'Review & Modify Allocation'
  | 'Reallocate'
  | 'Allocation Finalized'
  | 'Candidates Notified'
  | 'Reports Generated'
  | 'Reported / Completed';

export interface EducationRecord {
  id: string;
  degree: string;
  institution: string;
  yearOfPassing: number;
  percentage: number;
}

export interface SkillRecord {
  id: string;
  name: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface ExperienceRecord {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface StudentProfile {
  profileId: number;
  studentId: number;
  education: string;
  educationRecords: EducationRecord[];
  skills: string[]; // List of skills
  skillRecords: SkillRecord[];
  experience: string;
  experienceRecords: ExperienceRecord[];
  interests: string[];
  locationPreference: string;
  resumePath: string;
  profileScore: number;
  status: string;
  degree?: string;
  institution?: string;
  percentage?: number;
}

export interface Student {
  studentId: number;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  isEmailVerified: boolean;
  profile?: StudentProfile;
}

export interface Organization {
  organizationId: number;
  name: string;
  industry: string;
  location: string;
  contactPerson: string;
  contactEmail: string;
  status: 'Pending_Approval' | 'Active' | 'Suspended';
  isEmailVerified: boolean;
}

export interface Requirement {
  requirementId: number;
  internshipId: number;
  skill: string;
  qualification: string;
  experience: string;
  location: string;
  minPercentage: number;
}

export interface Internship {
  internshipId: number;
  organizationId: number;
  organizationName?: string;
  title: string;
  description: string;
  requiredSkills: string[];
  eligibilityCriteria: string;
  location: string;
  duration: string;
  stipend: number;
  availableSeats: number;
  filledSeats: number;
  status: 'Draft' | 'Pending_Approval' | 'Active' | 'Suspended' | 'Closed';
  requirements?: Requirement[];
  createdAt: string;
}

export interface AIMatchingEngine {
  engineId: number;
  algorithm: string;
  modelVersion: string;
  status: string;
  weights: {
    skills: number;     // 40%
    location: number;   // 20%
    academics: number;  // 20%
    interests: number;  // 20%
  };
  lastUpdated: string;
}

export interface MatchScoreBreakdown {
  skillsScore: number;
  locationScore: number;
  academicsScore: number;
  interestsScore: number;
  totalScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  fitExplanation: string;
}

export interface Allocation {
  allocationId: number;
  studentId: number;
  studentName?: string;
  studentEmail?: string;
  internshipId: number;
  internshipTitle?: string;
  organizationId?: number;
  organizationName?: string;
  engineId: number;
  allocationDate: string;
  matchScore: number;
  scoreBreakdown?: MatchScoreBreakdown;
  status: CandidateState;
  remarks: string;
  feedback?: string;
}

export interface Notification {
  notificationId: number;
  recipientType: UserRole;
  studentId?: number;
  organizationId?: number;
  allocationId?: number;
  message: string;
  notificationDate: string;
  status: 'Unread' | 'Read';
  type: 'Offer' | 'Shortlist' | 'Review' | 'Status_Update' | 'System';
}

export interface AdminUser {
  adminId: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthSession {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    organizationId?: number;
    studentId?: number;
    adminId?: number;
  };
}
