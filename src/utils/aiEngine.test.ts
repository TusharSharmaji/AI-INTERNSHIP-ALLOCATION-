/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMatchScore, normalizeSkill, rankCandidatesForInternship } from './aiEngine';
import { StudentProfile, Internship } from '../types/schema';

test('AI Matching Engine: normalizeSkill handles casing and whitespace', () => {
  assert.equal(normalizeSkill('  React.js  '), 'react.js');
  assert.equal(normalizeSkill('Machine-Learning'), 'machine learning');
  assert.equal(normalizeSkill('CLOUD_COMPUTING'), 'cloud computing');
});

test('AI Matching Engine: calculates 100% score for perfect skill, location, and interest match', () => {
  const profile: StudentProfile = {
    profileId: 1,
    studentId: 101,
    education: 'B.Tech in Computer Science',
    educationRecords: [],
    skills: ['Python', 'SQL', 'Data Analysis', 'Machine Learning'],
    skillRecords: [],
    experience: 'Academic projects in ML',
    experienceRecords: [],
    interests: ['Artificial Intelligence', 'Data Science'],
    locationPreference: 'New Delhi',
    resumePath: '/resumes/candidate1.pdf',
    profileScore: 95,
    status: 'Profile Created',
    percentage: 90,
  };

  const internship: Internship = {
    internshipId: 1,
    organizationId: 201,
    title: 'Data Science & AI Intern',
    description: 'Work with the National AI Center on Artificial Intelligence models',
    requiredSkills: ['Python', 'SQL', 'Data Analysis', 'Machine Learning'],
    eligibilityCriteria: 'Minimum 60% in engineering',
    location: 'New Delhi',
    duration: '6 Months',
    stipend: 25000,
    availableSeats: 5,
    filledSeats: 0,
    status: 'Active',
    createdAt: '2026-01-01',
  };

  const result = calculateMatchScore(profile, internship);

  // All 4 skills match -> 40 points
  assert.equal(result.skillsScore, 40);
  // Location match -> 20 points
  assert.equal(result.locationScore, 20);
  // Academic match (90% >= 60%) -> 15 + ~3.75 -> 18.75 points
  assert.ok(result.academicsScore >= 18);
  // Interest 'Artificial Intelligence' in title/desc -> 20 points
  assert.equal(result.interestsScore, 20);
  // Total >= 95
  assert.ok(result.totalScore >= 95, `Expected score >= 95, got ${result.totalScore}`);
  assert.equal(result.missingSkills.length, 0);
  assert.equal(result.matchingSkills.length, 4);
});

test('AI Matching Engine: handles partial matches with missing skills and location mismatch', () => {
  const profile: StudentProfile = {
    profileId: 2,
    studentId: 102,
    education: 'B.Com',
    educationRecords: [],
    skills: ['Communication', 'Excel'],
    skillRecords: [],
    experience: 'None',
    experienceRecords: [],
    interests: ['Finance'],
    locationPreference: 'Chennai',
    resumePath: '/resumes/candidate2.pdf',
    profileScore: 60,
    status: 'Profile Created',
    percentage: 65,
  };

  const internship: Internship = {
    internshipId: 2,
    organizationId: 202,
    title: 'Full Stack Web Developer',
    description: 'React and Node.js development',
    requiredSkills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    eligibilityCriteria: 'Degree in CS/IT',
    location: 'Bengaluru',
    duration: '3 Months',
    stipend: 20000,
    availableSeats: 2,
    filledSeats: 0,
    status: 'Active',
    createdAt: '2026-01-01',
  };

  const result = calculateMatchScore(profile, internship);

  // 0 of 4 skills match -> 0
  assert.equal(result.skillsScore, 0);
  // Different city -> 8
  assert.equal(result.locationScore, 8);
  // Total score should be low
  assert.ok(result.totalScore < 50);
  assert.equal(result.missingSkills.length, 4);
});

test('AI Matching Engine: ranks multiple candidates correctly', () => {
  const internship: Internship = {
    internshipId: 3,
    organizationId: 203,
    title: 'Backend Engineer Intern',
    description: 'Building REST APIs with Node.js and PostgreSQL',
    requiredSkills: ['Node.js', 'PostgreSQL', 'API'],
    eligibilityCriteria: 'B.Tech / MCA',
    location: 'Hyderabad',
    duration: '6 Months',
    stipend: 22000,
    availableSeats: 1,
    filledSeats: 0,
    status: 'Active',
    createdAt: '2026-01-01',
  };

  const profiles = [
    {
      studentId: 1,
      name: 'Priya Sharma',
      profile: {
        profileId: 1,
        studentId: 1,
        education: 'B.Tech CS',
        educationRecords: [],
        skills: ['Node.js', 'PostgreSQL', 'API', 'Docker'],
        skillRecords: [],
        experience: 'Intern at tech lab',
        experienceRecords: [],
        interests: ['Backend', 'Cloud'],
        locationPreference: 'Hyderabad',
        resumePath: '',
        profileScore: 90,
        status: 'Profile Created',
        percentage: 85,
      },
    },
    {
      studentId: 2,
      name: 'Rahul Verma',
      profile: {
        profileId: 2,
        studentId: 2,
        education: 'B.Sc Physics',
        educationRecords: [],
        skills: ['Python', 'Excel'],
        skillRecords: [],
        experience: 'None',
        experienceRecords: [],
        interests: ['Research'],
        locationPreference: 'Delhi',
        resumePath: '',
        profileScore: 70,
        status: 'Profile Created',
        percentage: 70,
      },
    },
  ];

  const ranked = rankCandidatesForInternship(profiles, internship);
  assert.equal(ranked[0].studentName, 'Priya Sharma');
  assert.ok(ranked[0].matchScore > ranked[1].matchScore);
});
