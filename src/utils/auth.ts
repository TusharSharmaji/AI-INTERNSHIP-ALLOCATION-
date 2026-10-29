/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types/schema';

export const JWT_SECRET = process.env.JWT_SECRET || 'pm-internship-scheme-super-secure-jwt-key-2026';
export const TOKEN_EXPIRY = '7d';

export interface TokenPayload {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  studentId?: number;
  organizationId?: number;
  adminId?: number;
}

export { validateGmail, validatePassword } from './validation';

/**
 * Generates an alphanumeric captcha text and signature token
 */
export function generateCaptcha(): { text: string; token: string } {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let text = '';
  for (let i = 0; i < 5; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const token = jwt.sign({ captchaText: text }, JWT_SECRET, { expiresIn: '15m' });
  return { text, token };
}

/**
 * Verifies captcha token against user input (case-insensitive)
 */
export function verifyCaptcha(token: string, userInput: string): boolean {
  if (!token || !userInput) return false;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { captchaText: string };
    return decoded.captchaText.toUpperCase() === userInput.trim().toUpperCase();
  } catch {
    return false;
  }
}

/**
 * Hash plain password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain password against hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign JWT token for authenticated session
 */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
