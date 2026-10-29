/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Building, 
  Shield, 
  CheckCircle, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { UserRole } from '../types/schema';
import { validateGmail, validatePassword } from '../utils/validation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, user: any) => void;
}

export const DEMO_ACCOUNTS = [
  {
    role: 'Admin' as UserRole,
    title: 'Admin 1 (Dr. Rajiv Menon)',
    email: 'admin.rajiv@gmail.com',
    password: 'AdminSecure#2026',
    description: 'PM Scheme Authority Director',
    color: 'border-purple-200 bg-purple-50 text-purple-700',
  },
  {
    role: 'Admin' as UserRole,
    title: 'Admin 2 (Dr. Anita Sharma)',
    email: 'admin.sharma@gmail.com',
    password: 'AdminSecure#2026',
    description: 'Joint Director, Technical Oversight',
    color: 'border-purple-200 bg-purple-50 text-purple-700',
  },
  {
    role: 'Organization' as UserRole,
    title: 'Org 1 (TCS Recruitment)',
    email: 'tcs.recruitment@gmail.com',
    password: 'DemoPass@2026',
    description: 'Tata Consultancy Services',
    color: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  },
  {
    role: 'Organization' as UserRole,
    title: 'Org 2 (Infosys Careers)',
    email: 'infosys.careers@gmail.com',
    password: 'DemoPass@2026',
    description: 'Infosys Innovation Labs',
    color: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  },
  {
    role: 'Candidate' as UserRole,
    title: 'Candidate 1 (Aarav Kumar)',
    email: 'aarav.intern@gmail.com',
    password: 'DemoPass@2026',
    description: 'B.Tech CSE • AI Specialist',
    color: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('Candidate');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('482910');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Captcha state
  const [captchaText, setCaptchaText] = useState('7K8M9');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);

  // Password rules validation
  const passLength = password.length >= 8;
  const passUpper = /[A-Z]/.test(password);
  const passSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);
  const isEmailValidGmail = validateGmail(email);

  const fetchCaptcha = async () => {
    setLoadingCaptcha(true);
    try {
      const res = await fetch('/api/auth/captcha');
      if (res.ok) {
        const data = await res.json();
        setCaptchaText(data.text);
        setCaptchaToken(data.token);
        setCaptchaInput('');
      }
    } catch (err) {
      console.error('Error fetching captcha:', err);
    } finally {
      setLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCaptcha();
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFillDemo = (demo: typeof DEMO_ACCOUNTS[0]) => {
    setRole(demo.role);
    setEmail(demo.email);
    setPassword(demo.password);
    setCaptchaInput(captchaText);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validations
    if (!validateGmail(email)) {
      setError('Email must be a valid @gmail.com address (e.g. name@gmail.com)');
      return;
    }

    const passCheck = validatePassword(password);
    if (!passCheck.isValid) {
      setError(passCheck.message || 'Password does not meet required criteria');
      return;
    }

    if (!captchaInput.trim()) {
      setError('Please enter the CAPTCHA code shown in the box');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: email.trim(), 
            password, 
            role, 
            captchaToken, 
            captchaInput: captchaInput.trim() 
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');

        onLoginSuccess(data.token, data.user);
        onClose();
      } else {
        // Register flow with simulated OTP verification
        if (!otpStep) {
          setOtpStep(true);
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email: email.trim(),
            password,
            role,
            phone,
            captchaToken,
            captchaInput: captchaInput.trim(),
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        onLoginSuccess(data.token, data.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
      // Refresh captcha on failure
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 pt-5 pb-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {mode === 'login' ? 'Secure Portal Login' : 'Register New Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              PM Internship Scheme • AI Allocation Engine
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Demo Accounts Quick Select Header */}
        <div className="p-4 bg-indigo-50/50 border-b border-indigo-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              5 Demo Login Accounts (1-Click Fill)
            </span>
            <span className="text-[10px] text-indigo-700 font-medium">All verified on @gmail.com</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {DEMO_ACCOUNTS.map((demo, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleFillDemo(demo)}
                className={`text-left p-2 rounded-lg border text-xs transition flex flex-col justify-between hover:shadow-xs hover:border-indigo-400 ${demo.color} ${idx === 4 ? 'sm:col-span-2' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-[11px]">{demo.title}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-white border border-slate-200 text-slate-700">
                    {demo.role}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-600 truncate mt-0.5">{demo.email}</div>
                <div className="text-[9px] text-slate-400 font-mono">Pass: {demo.password}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 bg-slate-100/40">
          <button
            onClick={() => {
              setMode('login');
              setOtpStep(false);
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold transition ${
              mode === 'login'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In with JWT
          </button>
          <button
            onClick={() => {
              setMode('register');
              setOtpStep(false);
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold transition ${
              mode === 'register'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Radio Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('Candidate')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border flex flex-col items-center gap-1 transition ${
                    role === 'Candidate'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Candidate
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Organization')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border flex flex-col items-center gap-1 transition ${
                    role === 'Organization'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  Organization
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Admin')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border flex flex-col items-center gap-1 transition ${
                    role === 'Admin'
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Administrator
                </button>
              </div>
            </div>

            {mode === 'register' && !otpStep && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Aarav Kumar or Organization Name"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </>
            )}

            {!otpStep && (
              <>
                {/* Email Address with @gmail.com requirement */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">
                      Email Address <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <span className={`text-[10px] font-semibold ${isEmailValidGmail ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {isEmailValidGmail ? '✓ @gmail.com verified' : 'Requires @gmail.com'}
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="username@gmail.com"
                      className={`w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden ${
                        email && !isEmailValidGmail ? 'border-amber-400 bg-amber-50/20' : 'border-slate-300'
                      }`}
                    />
                  </div>
                  {email && !isEmailValidGmail && (
                    <p className="text-[10px] text-amber-700 mt-1">
                      Please enter a valid Google email ending in <strong>@gmail.com</strong>
                    </p>
                  )}
                </div>

                {/* Password with 8 char, 1 uppercase, 1 special character rules */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 8 chars, 1 uppercase, 1 special char"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Password Requirements Checklist */}
                  <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] space-y-1">
                    <span className="font-semibold text-slate-700 block text-[10px]">
                      Security Requirements:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                      <span className={`flex items-center gap-1 ${passLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                        {passLength ? <Check className="w-3 h-3 text-emerald-600" /> : '○'} Min 8 chars
                      </span>
                      <span className={`flex items-center gap-1 ${passUpper ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                        {passUpper ? <Check className="w-3 h-3 text-emerald-600" /> : '○'} 1 Uppercase (A-Z)
                      </span>
                      <span className={`flex items-center gap-1 ${passSpecial ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                        {passSpecial ? <Check className="w-3 h-3 text-emerald-600" /> : '○'} 1 Special (!@#$%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Interactive Visual CAPTCHA */}
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">
                      Security Verification (CAPTCHA) <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={fetchCaptcha}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${loadingCaptcha ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Stylized Captcha Canvas Box */}
                    <div className="relative w-36 h-10 bg-linear-to-r from-slate-900 to-indigo-950 rounded-lg border border-slate-800 flex items-center justify-center select-none overflow-hidden shrink-0 shadow-inner">
                      {/* Grid noise lines */}
                      <div className="absolute inset-0 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:8px_8px] opacity-40" />
                      <div className="relative font-mono font-black text-lg tracking-widest text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] skew-x-[-8deg]">
                        {captchaText}
                      </div>
                    </div>

                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={captchaInput}
                      onChange={e => setCaptchaInput(e.target.value)}
                      placeholder="Type code"
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono tracking-wider uppercase text-center"
                    />
                  </div>
                </div>
              </>
            )}

            {otpStep && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  State Diagram Step C2/O2: Email / OTP Verification
                </div>
                <p className="text-[11px] text-slate-600">
                  Verification OTP dispatched to <strong>{email}</strong>. Enter code below:
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={e => setEnteredOtp(e.target.value)}
                  className="w-full text-center tracking-widest text-lg font-mono py-2 border border-emerald-300 rounded-lg bg-white"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                'Authenticating...'
              ) : mode === 'login' ? (
                'Sign In with Validated Credentials'
              ) : otpStep ? (
                'Complete Registration'
              ) : (
                'Proceed to OTP Verification'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
