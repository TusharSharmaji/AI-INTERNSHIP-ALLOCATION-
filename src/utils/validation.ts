/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Validates that an email is a valid @gmail.com address
 */
export function validateGmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  // Must end with @gmail.com and have non-empty username before @
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  return gmailRegex.test(trimmed);
}

/**
 * Validates password requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 special character
 */
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 uppercase letter (A-Z)' };
  }

  // Check for at least 1 special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 special character (e.g. !@#$%^&*)' };
  }

  return { isValid: true };
}
