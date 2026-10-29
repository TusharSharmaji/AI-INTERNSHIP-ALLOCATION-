/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Bell, 
  LogOut, 
  Layers, 
  Cpu, 
  FileText, 
  Menu, 
  X,
  CheckCircle2,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { AuthSession, Notification, UserRole } from '../types/schema';

interface NavbarProps {
  session: AuthSession | null;
  activeTab: 'dashboard' | 'engine' | 'architecture' | 'docs' | 'tests';
  setActiveTab: (tab: 'dashboard' | 'engine' | 'architecture' | 'docs' | 'tests') => void;
  notifications: Notification[];
  onOpenAuth: () => void;
  onLogout: () => void;
  onQuickSwitch: (role: UserRole, email?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  session,
  activeTab,
  setActiveTab,
  notifications,
  onOpenAuth,
  onLogout,
  onQuickSwitch,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const unreadCount = notifications.filter(n => n.status === 'Unread').length;

  const roleBadgeColor = {
    Candidate: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Organization: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Admin: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      {/* Top tricolor subtle accent line */}
      <div className="h-1 w-full bg-linear-to-r from-orange-500 via-white to-emerald-600" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left focus:outline-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-700 via-blue-800 to-indigo-950 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-900/10">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                    PM Internship
                  </span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded-sm bg-orange-100 text-orange-800">
                    AI Scheme
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                  Smart Allocation Engine
                </p>
              </div>
            </button>

            {/* Navigation Tabs (Desktop) */}
            <nav className="hidden md:flex items-center ml-6 space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {session?.user.role === 'Admin' ? (
                  <ShieldCheck className="w-4 h-4" />
                ) : session?.user.role === 'Organization' ? (
                  <Building2 className="w-4 h-4" />
                ) : (
                  <GraduationCap className="w-4 h-4" />
                )}
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab('engine')}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'engine'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Cpu className="w-4 h-4" />
                AI Allocation Engine
              </button>

              <button
                onClick={() => setActiveTab('architecture')}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'architecture'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                Architecture & DFDs
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700">8</span>
              </button>

              <button
                onClick={() => setActiveTab('docs')}
                className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'docs'
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                Guidelines
              </button>
            </nav>
          </div>

          {/* Right Controls: Role Switcher, Notifications, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
                title="Switch demo persona"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Role:</span>
                <span className="text-indigo-600 font-bold">{session?.user.role || 'Guest'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Role (JWT Authenticated)
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        onQuickSwitch('Admin', 'admin.rajiv@gmail.com');
                        setRoleSwitcherOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-semibold text-slate-900">Admin 1: Dr. Rajiv Menon</div>
                        <div className="text-[10px] text-slate-500 font-mono">admin.rajiv@gmail.com</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onQuickSwitch('Admin', 'admin.sharma@gmail.com');
                        setRoleSwitcherOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="font-semibold text-slate-900">Admin 2: Dr. Anita Sharma</div>
                        <div className="text-[10px] text-slate-500 font-mono">admin.sharma@gmail.com</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onQuickSwitch('Organization', 'tcs.recruitment@gmail.com');
                        setRoleSwitcherOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="font-semibold text-slate-900">Org 1: TCS Recruitment</div>
                        <div className="text-[10px] text-slate-500 font-mono">tcs.recruitment@gmail.com</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onQuickSwitch('Organization', 'infosys.careers@gmail.com');
                        setRoleSwitcherOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      <div>
                        <div className="font-semibold text-slate-900">Org 2: Infosys Innovation</div>
                        <div className="text-[10px] text-slate-500 font-mono">infosys.careers@gmail.com</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onQuickSwitch('Candidate', 'aarav.intern@gmail.com');
                        setRoleSwitcherOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <GraduationCap className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-semibold text-slate-900">Candidate: Aarav Kumar</div>
                        <div className="text-[10px] text-slate-500 font-mono">aarav.intern@gmail.com</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-sm">Notifications</span>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-medium">
                      {notifications.length} total
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.notificationId}
                          className={`p-3 text-xs hover:bg-slate-50 transition ${
                            n.status === 'Unread' ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5">
                              {n.type === 'Offer' ? (
                                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                              ) : n.type === 'Shortlist' ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <Bell className="w-4 h-4 text-indigo-500 shrink-0" />
                              )}
                            </span>
                            <div className="flex-1">
                              <p className="text-slate-800 leading-snug">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.notificationDate).toLocaleDateString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Session / Login Button */}
            {session ? (
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800">{session.user.name}</span>
                  <span className={`text-[10px] font-semibold border px-1.5 rounded-full self-end ${roleBadgeColor[session.user.role]}`}>
                    {session.user.role}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            Dashboard
          </button>
          <button
            onClick={() => {
              setActiveTab('engine');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            <Cpu className="w-4 h-4 text-indigo-600" />
            AI Allocation Engine
          </button>
          <button
            onClick={() => {
              setActiveTab('architecture');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            Architecture & 8 DFDs
          </button>
          <button
            onClick={() => {
              setActiveTab('docs');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            Scheme Guidelines
          </button>
        </div>
      )}
    </header>
  );
};
