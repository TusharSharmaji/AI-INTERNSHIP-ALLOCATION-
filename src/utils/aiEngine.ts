/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudentProfile, Internship, MatchScoreBreakdown } from '../types/schema';

/**
 * Normalizes string for fuzzy/case-insensitive comparison
 */
export function normalizeSkill(skill: string): string {
  return skill.trim().toLowerCase().replace(/[\-_]/g, ' ');
}

/**
 * Calculates AI Compatibility Match Score between a Student Profile and an Internship Post
 * Weights:
 * - Skills Match: 40%
 * - Location Preference: 20%
 * - Academic / Eligibility Criteria: 20%
 * - Domain Interest Alignment: 20%
 */
export function calculateMatchScore(
  profile: StudentProfile,
  internship: Internship
): MatchScoreBreakdown {
  const candidateSkills = (profile.skills || []).map(normalizeSkill);
  const requiredSkills = (internship.requiredSkills || []).map(normalizeSkill);

  // 1. Skills Match (40 pts max)
  let matchingSkills: string[] = [];
  let missingSkills: string[] = [];

  if (requiredSkills.length === 0) {
    matchingSkills = [...candidateSkills];
  } else {
    for (const req of requiredSkills) {
      const isMatch = candidateSkills.some(
        cSkill => cSkill === req || cSkill.includes(req) || req.includes(cSkill)
      );
      if (isMatch) {
        matchingSkills.push(req);
      } else {
        missingSkills.push(req);
      }
    }
  }

  const skillsRatio = requiredSkills.length > 0 ? matchingSkills.length / requiredSkills.length : 1;
  const skillsScore = Math.round(skillsRatio * 40 * 100) / 100;

  // 2. Location Match (20 pts max)
  let locationScore = 0;
  const prefLoc = (profile.locationPreference || '').trim().toLowerCase();
  const jobLoc = (internship.location || '').trim().toLowerCase();

  if (
    prefLoc === 'remote' ||
    jobLoc === 'remote' ||
    prefLoc === 'any' ||
    prefLoc === '' ||
    prefLoc === jobLoc ||
    jobLoc.includes(prefLoc) ||
    prefLoc.includes(jobLoc)
  ) {
    locationScore = 20;
  } else {
    locationScore = 8; // Partial points for flexible national scheme
  }

  // 3. Academic Match (20 pts max)
  let academicsScore = 15; // default benchmark
  const candidatePct = profile.percentage || 75;
  const minRequiredPct = 60; // Standard PM Internship benchmark

  if (candidatePct >= minRequiredPct) {
    const boost = Math.min(5, ((candidatePct - minRequiredPct) / 40) * 5);
    academicsScore = Math.round((15 + boost) * 100) / 100;
  } else {
    academicsScore = Math.max(5, Math.round((candidatePct / minRequiredPct) * 15 * 100) / 100);
  }

  // 4. Domain / Interests Match (20 pts max)
  let interestsScore = 10;
  const candidateInterests = (profile.interests || []).map(i => i.toLowerCase());
  const title = internship.title.toLowerCase();
  const desc = (internship.description || '').toLowerCase();

  const hasInterestMatch = candidateInterests.some(interest =>
    title.includes(interest) || desc.includes(interest)
  );

  if (hasInterestMatch) {
    interestsScore = 20;
  } else if (candidateInterests.length > 0) {
    interestsScore = 14;
  }

  const totalScore = Math.min(100, Math.round((skillsScore + locationScore + academicsScore + interestsScore) * 10) / 10);

  let fitExplanation = '';
  if (totalScore >= 85) {
    fitExplanation = `Exceptional fit! Matches ${matchingSkills.length}/${requiredSkills.length} core skills with strong location and academic affinity.`;
  } else if (totalScore >= 70) {
    fitExplanation = `Strong match. Meets foundational requirements with ${matchingSkills.length} key competencies aligned.`;
  } else if (totalScore >= 50) {
    fitExplanation = `Moderate match. Could benefit from upskilling in ${missingSkills.slice(0, 2).join(', ')}.`;
  } else {
    fitExplanation = `Low alignment with current requirements. Recommended for alternative foundational tracks.`;
  }

  return {
    skillsScore,
    locationScore,
    academicsScore,
    interestsScore,
    totalScore,
    matchingSkills,
    missingSkills,
    fitExplanation,
  };
}

/**
 * Ranks candidate profiles for a given internship post
 */
export function rankCandidatesForInternship(
  profiles: { profile: StudentProfile; studentId: number; name: string }[],
  internship: Internship
) {
  return profiles
    .map(item => {
      const breakdown = calculateMatchScore(item.profile, internship);
      return {
        studentId: item.studentId,
        studentName: item.name,
        profileId: item.profile.profileId,
        internshipId: internship.internshipId,
        matchScore: breakdown.totalScore,
        breakdown,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
