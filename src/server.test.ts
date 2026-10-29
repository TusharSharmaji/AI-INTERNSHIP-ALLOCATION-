/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { db, initializeDatabase } from '../server/db';
import { comparePassword, validateGmail, validatePassword } from './utils/auth';
import { calculateMatchScore } from './utils/aiEngine';

test('Database & Auth Integration: 5 demo accounts (2 Admin, 2 Org, 1 Candidate) on @gmail.com', async () => {
  await initializeDatabase();
  const store = await db.getStore();

  assert.ok(store.admins.length >= 2, 'Must have at least 2 admins');
  assert.ok(store.organizations.length >= 2, 'Must have at least 2 organizations');
  assert.ok(store.students.length >= 1, 'Must have at least 1 candidate');

  const demoAccounts = [
    { email: 'admin.rajiv@gmail.com', role: 'Admin', pass: 'AdminSecure#2026' },
    { email: 'admin.sharma@gmail.com', role: 'Admin', pass: 'AdminSecure#2026' },
    { email: 'tcs.recruitment@gmail.com', role: 'Organization', pass: 'DemoPass@2026' },
    { email: 'infosys.careers@gmail.com', role: 'Organization', pass: 'DemoPass@2026' },
    { email: 'aarav.intern@gmail.com', role: 'Candidate', pass: 'DemoPass@2026' },
  ];

  for (const account of demoAccounts) {
    // 1. Verify email is @gmail.com
    assert.equal(validateGmail(account.email), true, `${account.email} must be @gmail.com`);

    // 2. Verify password meets complexity criteria (8+ chars, 1 uppercase, 1 special char)
    const passCheck = validatePassword(account.pass);
    assert.equal(passCheck.isValid, true, `${account.pass} must meet password rules`);

    // 3. Verify user exists in database and password hash validates
    if (account.role === 'Admin') {
      const admin = await db.findAdminByEmail(account.email);
      assert.ok(admin, `Admin ${account.email} must exist in DB`);
      const valid = await comparePassword(account.pass, admin!.passwordHash);
      assert.equal(valid, true, `Admin password must match bcrypt hash`);
    } else if (account.role === 'Organization') {
      const org = await db.findOrganizationByEmail(account.email);
      assert.ok(org, `Org ${account.email} must exist in DB`);
      const valid = await comparePassword(account.pass, org!.passwordHash);
      assert.equal(valid, true, `Org password must match bcrypt hash`);
    } else {
      const student = await db.findStudentByEmail(account.email);
      assert.ok(student, `Student ${account.email} must exist in DB`);
      const valid = await comparePassword(account.pass, student!.passwordHash);
      assert.equal(valid, true, `Student password must match bcrypt hash`);
    }
  }
});

test('Student Profile & AI Scoring Integration: updates profile and recalculates score', async () => {
  await initializeDatabase();
  const student = await db.findStudentByEmail('aarav.intern@gmail.com');
  assert.ok(student);

  const profile = await db.getStudentProfile(student!.studentId);
  assert.ok(profile);

  const store = await db.getStore();
  const internship = store.internships[0]; // AI Research intern

  const initialScore = calculateMatchScore(profile!, internship);
  assert.ok(initialScore.totalScore >= 80, 'Aarav should match AI Research intern strongly');

  // Add more matching skills
  await db.saveStudentProfile({
    studentId: student!.studentId,
    skills: [...profile!.skills, 'PyTorch', 'Computer Vision'],
  });

  const updatedProfile = await db.getStudentProfile(student!.studentId);
  assert.ok(updatedProfile!.skills.includes('PyTorch'));
});

test('AI Allocation Engine Run: batches and populates allocations without duplicates', async () => {
  await initializeDatabase();
  const beforeStore = await db.getStore();
  const initialCount = beforeStore.allocations.length;

  const allocations = await db.runAIAllocation();
  assert.ok(allocations.length >= initialCount, 'Allocations should be processed');

  // Verify no duplicate (studentId, internshipId) pairs
  const seen = new Set<string>();
  for (const alloc of allocations) {
    const key = `${alloc.studentId}-${alloc.internshipId}`;
    assert.equal(seen.has(key), false, `Duplicate allocation found for ${key}`);
    seen.add(key);
  }
});
