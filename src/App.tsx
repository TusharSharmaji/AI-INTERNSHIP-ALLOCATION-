/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { CandidateDashboard } from './components/CandidateDashboard';
import { OrganizationDashboard } from './components/OrganizationDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ArchitectureViewer } from './components/ArchitectureViewer';
import { EngineSimulator } from './components/EngineSimulator';
import { SchemeGuidelines } from './components/SchemeGuidelines';
import { OfferLetterModal } from './components/OfferLetterModal';
import { AuthSession, Notification, UserRole, Allocation, Student, StudentProfile, Internship, Organization } from './types/schema';
import { Shield, Sparkles, Database, Layers, CheckCircle } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'engine' | 'architecture' | 'docs' | 'tests'>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Domain data
  const [student, setStudent] = useState<Student | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [recommendations, setRecommendations] = useState<(Internship & { matchScore?: number; applicationStatus?: string | null; allocationId?: number | null })[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [orgPosts, setOrgPosts] = useState<Internship[]>([]);
  const [orgApplicants, setOrgApplicants] = useState<(Allocation & { profile?: StudentProfile })[]>([]);
  const [adminMetrics, setAdminMetrics] = useState({
    totalStudents: 4,
    totalOrgs: 4,
    totalPosts: 4,
    totalAllocations: 4,
    offersIssued: 1,
    activeInterns: 1,
    avgScore: 84.5,
  });
  const [allStudents, setAllStudents] = useState<(Student & { profile?: StudentProfile })[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [allInternships, setAllInternships] = useState<Internship[]>([]);

  // Offer Letter Modal state
  const [activeOfferAllocation, setActiveOfferAllocation] = useState<Allocation | null>(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  // Initialize with Candidate Aarav Kumar by default for instant interactivity
  useEffect(() => {
    quickSwitchRole('Candidate', 'aarav.intern@gmail.com');
  }, []);

  const fetchAppData = async (currentSession: AuthSession) => {
    const headers = {
      Authorization: `Bearer ${currentSession.token}`,
      'Content-Type': 'application/json',
    };

    try {
      // 1. Fetch Notifications
      const notifRes = await fetch('/api/notifications', { headers });
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }

      // 2. Role specific fetches
      if (currentSession.user.role === 'Candidate') {
        const [profRes, recRes] = await Promise.all([
          fetch('/api/candidate/profile', { headers }),
          fetch('/api/candidate/recommendations', { headers }),
        ]);

        if (profRes.ok) {
          const profData = await profRes.json();
          setStudent(profData.student);
          setProfile(profData.profile);
        }

        if (recRes.ok) {
          const recData = await recRes.json();
          setRecommendations(recData.recommendations || []);
        }

        // Also fetch allocations for candidate
        const adminDataRes = await fetch('/api/admin/data', { headers });
        if (adminDataRes.ok) {
          const adminData = await adminDataRes.json();
          const studentAllocations = (adminData.allocations || []).filter(
            (a: Allocation) => a.studentId === currentSession.user.studentId || a.studentId === currentSession.user.id
          );
          setAllocations(studentAllocations);
          setAllStudents(adminData.students || []);
          setAllInternships(adminData.internships || []);
        }
      } else if (currentSession.user.role === 'Organization') {
        const [postsRes, appsRes] = await Promise.all([
          fetch('/api/organization/posts', { headers }),
          fetch('/api/organization/applicants', { headers }),
        ]);

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setOrgPosts(postsData.posts || []);
        }
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setOrgApplicants(appsData.applicants || []);
        }
      } else if (currentSession.user.role === 'Admin') {
        const [metricsRes, dataRes] = await Promise.all([
          fetch('/api/admin/metrics', { headers }),
          fetch('/api/admin/data', { headers }),
        ]);

        if (metricsRes.ok) {
          const mData = await metricsRes.json();
          setAdminMetrics(mData);
        }
        if (dataRes.ok) {
          const dData = await dataRes.json();
          setAllocations(dData.allocations || []);
          setAllStudents(dData.students || []);
          setAllOrganizations(dData.organizations || []);
          setAllInternships(dData.internships || []);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const quickSwitchRole = async (role: UserRole, email?: string) => {
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email }),
      });
      const data = await res.json();
      if (res.ok) {
        const newSession: AuthSession = {
          token: data.token,
          user: data.user,
        };
        setSession(newSession);
        await fetchAppData(newSession);
      }
    } catch (err) {
      console.error('Failed to switch demo persona:', err);
    }
  };

  const handleApply = async (internshipId: number) => {
    if (!session) return;
    try {
      const res = await fetch('/api/candidate/apply', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ internshipId }),
      });
      if (res.ok) {
        await fetchAppData(session);
      }
    } catch (err) {
      console.error('Apply error:', err);
    }
  };

  const handleUpdateProfile = async (updatedData: Partial<StudentProfile>) => {
    if (!session) return;
    try {
      const res = await fetch('/api/candidate/profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        await fetchAppData(session);
      }
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };

  const handleCreatePost = async (newPost: any) => {
    if (!session) return;
    try {
      const res = await fetch('/api/organization/posts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPost),
      });
      if (res.ok) {
        await fetchAppData(session);
      }
    } catch (err) {
      console.error('Create post error:', err);
    }
  };

  const handleShortlistCandidate = async (allocationId: number, decision: 'Shortlist' | 'Select' | 'Reject') => {
    if (!session) return;
    try {
      const res = await fetch('/api/organization/shortlist', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ allocationId, decision }),
      });
      if (res.ok) {
        await fetchAppData(session);
      }
    } catch (err) {
      console.error('Shortlist error:', err);
    }
  };

  const handleRunAllocation = async () => {
    if (!session) return;
    try {
      const res = await fetch('/api/admin/run-allocation', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        await fetchAppData(session);
      }
    } catch (err) {
      console.error('Run allocation error:', err);
    }
  };

  const handleIssueOffer = async (allocationId: number) => {
    if (!session) return;
    try {
      const res = await fetch('/api/admin/issue-offer', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ allocationId }),
      });
      if (res.ok) {
        await fetchAppData(session);
      }
    } catch (err) {
      console.error('Issue offer error:', err);
    }
  };

  const handleAcceptOffer = async (allocationId: number) => {
    if (!session) return;
    try {
      const res = await fetch('/api/candidate/respond-offer', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ allocationId, decision: 'Accept' }),
      });
      if (res.ok) {
        await fetchAppData(session);
        setIsOfferModalOpen(false);
      }
    } catch (err) {
      console.error('Accept offer error:', err);
    }
  };

  const handleRejectOffer = async (allocationId: number) => {
    if (!session) return;
    try {
      const res = await fetch('/api/candidate/respond-offer', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ allocationId, decision: 'Reject' }),
      });
      if (res.ok) {
        await fetchAppData(session);
        setIsOfferModalOpen(false);
      }
    } catch (err) {
      console.error('Reject offer error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans antialiased">
      {/* Top Navigation */}
      <Navbar
        session={session}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          setSession(null);
          setIsAuthOpen(true);
        }}
        onQuickSwitch={quickSwitchRole}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <>
            {session?.user.role === 'Admin' ? (
              <AdminDashboard
                metrics={adminMetrics}
                allocations={allocations}
                students={allStudents}
                organizations={allOrganizations}
                internships={allInternships}
                onRunAllocation={handleRunAllocation}
                onIssueOffer={handleIssueOffer}
                onViewOffer={(alloc) => {
                  setActiveOfferAllocation(alloc);
                  setIsOfferModalOpen(true);
                }}
              />
            ) : session?.user.role === 'Organization' ? (
              <OrganizationDashboard
                organizationName={session.user.name}
                posts={orgPosts}
                applicants={orgApplicants}
                onCreatePost={handleCreatePost}
                onShortlistCandidate={handleShortlistCandidate}
              />
            ) : (
              <CandidateDashboard
                student={student}
                profile={profile}
                recommendations={recommendations}
                allocations={allocations}
                onApply={handleApply}
                onViewOffer={(alloc) => {
                  setActiveOfferAllocation(alloc);
                  setIsOfferModalOpen(true);
                }}
                onUpdateProfile={handleUpdateProfile}
              />
            )}
          </>
        )}

        {activeTab === 'engine' && (
          <EngineSimulator
            students={allStudents}
            internships={allInternships.length > 0 ? allInternships : recommendations}
          />
        )}

        {activeTab === 'architecture' && <ArchitectureViewer />}

        {activeTab === 'docs' && <SchemeGuidelines />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-indigo-900 text-white flex items-center justify-center font-bold text-xs">
              PM
            </div>
            <span>
              PM Internship AI Smart Allocation Engine • Production Ready for GitHub
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <button onClick={() => setActiveTab('architecture')} className="hover:text-indigo-600">
              8 System Diagrams
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('engine')} className="hover:text-indigo-600">
              AI Matching Algorithm
            </button>
            <span>•</span>
            <button onClick={() => setActiveTab('docs')} className="hover:text-indigo-600">
              Test Suite (13 tests)
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(token, user) => {
          const newSession = { token, user };
          setSession(newSession);
          fetchAppData(newSession);
        }}
      />

      <OfferLetterModal
        isOpen={isOfferModalOpen}
        allocation={activeOfferAllocation}
        onClose={() => setIsOfferModalOpen(false)}
        onAccept={handleAcceptOffer}
        onReject={handleRejectOffer}
      />
    </div>
  );
}
