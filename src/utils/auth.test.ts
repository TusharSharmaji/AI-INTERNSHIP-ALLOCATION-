/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  hashPassword, 
  comparePassword, 
  signToken, 
  verifyToken, 
  validateGmail, 
  validatePassword, 
  generateCaptcha, 
  verifyCaptcha 
} from './auth';

test('Auth: validates @gmail.com email requirement', () => {
  // Valid @gmail.com addresses
  assert.equal(validateGmail('admin.rajiv@gmail.com'), true);
  assert.equal(validateGmail('tcs.recruitment@gmail.com'), true);
  assert.equal(validateGmail('aarav.intern@gmail.com'), true);
  assert.equal(validateGmail('USER.NAME+tag@GMAIL.COM'), true);

  // Invalid non-gmail domains
  assert.equal(validateGmail('admin@pm-internship.gov.in'), false);
  assert.equal(validateGmail('recruitment@tcs.com'), false);
  assert.equal(validateGmail('student@yahoo.com'), false);
  assert.equal(validateGmail('invalid@outlook.com'), false);
  assert.equal(validateGmail('not-an-email'), false);
  assert.equal(validateGmail(''), false);
});

test('Auth: enforces password rules (min 8 chars, 1 uppercase, 1 special char)', () => {
  // Valid compliant passwords
  assert.equal(validatePassword('AdminSecure#2026').isValid, true);
  assert.equal(validatePassword('DemoPass@2026').isValid, true);
  assert.equal(validatePassword('Complex!99').isValid, true);

  // Failure: less than 8 chars
  const shortCheck = validatePassword('Pass#1');
  assert.equal(shortCheck.isValid, false);
  assert.ok(shortCheck.message?.includes('at least 8 characters'));

  // Failure: no uppercase letter
  const noUpperCheck = validatePassword('demopass@2026');
  assert.equal(noUpperCheck.isValid, false);
  assert.ok(noUpperCheck.message?.includes('uppercase'));

  // Failure: no special character
  const noSpecialCheck = validatePassword('DemoPassword2026');
  assert.equal(noSpecialCheck.isValid, false);
  assert.ok(noSpecialCheck.message?.includes('special character'));
});

test('Auth: generates and verifies CAPTCHA token and text', () => {
  const captcha = generateCaptcha();
  assert.ok(captcha.text);
  assert.equal(captcha.text.length, 5);
  assert.ok(captcha.token);

  // Valid verification (case-insensitive)
  assert.equal(verifyCaptcha(captcha.token, captcha.text), true);
  assert.equal(verifyCaptcha(captcha.token, captcha.text.toLowerCase()), true);

  // Invalid verification
  assert.equal(verifyCaptcha(captcha.token, 'WRONG'), false);
  assert.equal(verifyCaptcha('invalid.token.signature', captcha.text), false);
});

test('Auth: bcrypt hashes and verifies password correctly', async () => {
  const plain = 'DemoPass@2026';
  const hash = await hashPassword(plain);

  assert.notEqual(plain, hash);
  assert.ok(hash.startsWith('$2'));

  const isValid = await comparePassword(plain, hash);
  assert.equal(isValid, true);

  const isInvalid = await comparePassword('WrongPassword#123', hash);
  assert.equal(isInvalid, false);
});

test('Auth: JWT tokens sign and verify with correct payload', () => {
  const payload = {
    id: 1,
    email: 'admin.rajiv@gmail.com',
    role: 'Admin' as const,
    name: 'Dr. Rajiv Menon',
    adminId: 1,
  };

  const token = signToken(payload);
  assert.ok(typeof token === 'string');
  assert.ok(token.split('.').length === 3);

  const decoded = verifyToken(token);
  assert.ok(decoded);
  assert.equal(decoded.id, 1);
  assert.equal(decoded.email, 'admin.rajiv@gmail.com');
  assert.equal(decoded.role, 'Admin');
});

test('Auth: Invalid or tampered JWT returns null', () => {
  const badToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tampered.signature';
  const decoded = verifyToken(badToken);
  assert.equal(decoded, null);
});
