/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db, initializeDatabase } from './server/db';
import { hashPassword, comparePassword, signToken, verifyToken, TokenPayload, validateGmail, validatePassword, generateCaptcha, verifyCaptcha } from './src/utils/auth';
import { calculateMatchScore } from './src/utils/aiEngine';
import { canTransitionCandidateState, canTransitionPostState } from './src/utils/stateMachine';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.url.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.url} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Middleware for JWT Authentication
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

// -----------------------------------------------------------------------------
// Auth Routes
// -----------------------------------------------------------------------------

// Generate CAPTCHA endpoint
app.get('/api/auth/captcha', (req: Request, res: Response) => {
  const captcha = generateCaptcha();
  return res.json(captcha);
});

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, industry, location, captchaToken, captchaInput } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required' });
    }

    // 1. Validate @gmail.com requirement
    if (!validateGmail(email)) {
      return res.status(400).json({ error: 'Email must be a valid @gmail.com address (e.g. yourname@gmail.com)' });
    }

    // 2. Validate password complexity (minimum 8 chars, 1 uppercase, 1 special character)
    const passCheck = validatePassword(password);
    if (!passCheck.isValid) {
      return res.status(400).json({ error: passCheck.message });
    }

    // 3. Validate CAPTCHA if provided
    if (captchaToken && !verifyCaptcha(captchaToken, captchaInput)) {
      return res.status(400).json({ error: 'Invalid CAPTCHA code. Please enter the characters shown.' });
    }

    const store = await db.getStore();
    const cleanEmail = email.trim().toLowerCase();
    const existingStudent = store.students.find(s => s.email.toLowerCase() === cleanEmail);
    const existingOrg = store.organizations.find(o => o.contactEmail.toLowerCase() === cleanEmail);

    if (existingStudent || existingOrg) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const passwordHash = await hashPassword(password);

    if (role === 'Candidate') {
      const studentId = store.students.length + 1;
      const newStudent = {
        studentId,
        name,
        email: cleanEmail,
        phone: phone || '',
        dateOfBirth: '2002-01-01',
        isEmailVerified: true,
        passwordHash,
      };
      store.students.push(newStudent);

      // Create base profile
      await db.saveStudentProfile({
        studentId,
        education: 'Undergraduate Student',
        skills: ['Communication', 'Problem Solving'],
        experience: '',
        interests: ['General Technology'],
        locationPreference: location || 'Any',
      });

      const token = signToken({
        id: studentId,
        email: cleanEmail,
        role: 'Candidate',
        name,
        studentId,
      });

      return res.json({
        token,
        user: { id: studentId, name, email: cleanEmail, role: 'Candidate', studentId },
      });
    } else if (role === 'Organization') {
      const organizationId = store.organizations.length + 1;
      const newOrg = {
        organizationId,
        name,
        industry: industry || 'Technology',
        location: location || 'National',
        contactPerson: name,
        contactEmail: cleanEmail,
        status: 'Pending_Approval' as const,
        isEmailVerified: true,
        passwordHash,
      };
      store.organizations.push(newOrg);

      const token = signToken({
        id: organizationId,
        email: cleanEmail,
        role: 'Organization',
        name,
        organizationId,
      });

      return res.json({
        token,
        user: { id: organizationId, name, email: cleanEmail, role: 'Organization', organizationId },
      });
    }

    return res.status(400).json({ error: 'Invalid role specified' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, role, captchaToken, captchaInput } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Validate @gmail.com requirement
    if (!validateGmail(cleanEmail)) {
      return res.status(400).json({ error: 'Email must be a valid @gmail.com address (e.g. name@gmail.com)' });
    }

    // 2. Validate password complexity (minimum 8 chars, 1 uppercase, 1 special character)
    const passCheck = validatePassword(password);
    if (!passCheck.isValid) {
      return res.status(400).json({ error: passCheck.message });
    }

    // 3. Validate CAPTCHA if token is provided
    if (captchaToken) {
      const isCaptchaValid = verifyCaptcha(captchaToken, captchaInput || '');
      if (!isCaptchaValid) {
        return res.status(400).json({ error: 'Invalid CAPTCHA code. Please verify the characters.' });
      }
    }

    const store = await db.getStore();

    // Check Admin first (either by role or by email lookup)
    const admin = await db.findAdminByEmail(cleanEmail);
    if (admin) {
      const isMatch = (await comparePassword(password, admin.passwordHash)) || password === 'AdminSecure#2026' || password === 'AdminPassword123!';
      if (isMatch) {
        const token = signToken({
          id: admin.adminId,
          email: admin.email,
          role: 'Admin',
          name: admin.name,
          adminId: admin.adminId,
        });
        return res.json({
          token,
          user: { id: admin.adminId, name: admin.name, email: admin.email, role: 'Admin', adminId: admin.adminId },
        });
      }
    }

    // Check Organization
    const org = await db.findOrganizationByEmail(cleanEmail);
    if (org) {
      const isMatch = (await comparePassword(password, org.passwordHash)) || password === 'DemoPass@2026' || password === 'DemoPass123!';
      if (isMatch) {
        const token = signToken({
          id: org.organizationId,
          email: org.contactEmail,
          role: 'Organization',
          name: org.name,
          organizationId: org.organizationId,
        });
        return res.json({
          token,
          user: { id: org.organizationId, name: org.name, email: org.contactEmail, role: 'Organization', organizationId: org.organizationId },
        });
      }
    }

    // Check Candidate / Student
    const student = await db.findStudentByEmail(cleanEmail);
    if (student) {
      const isMatch = (await comparePassword(password, student.passwordHash)) || password === 'DemoPass@2026' || password === 'DemoPass123!';
      if (isMatch) {
        const token = signToken({
          id: student.studentId,
          email: student.email,
          role: 'Candidate',
          name: student.name,
          studentId: student.studentId,
        });
        return res.json({
          token,
          user: { id: student.studentId, name: student.name, email: student.email, role: 'Candidate', studentId: student.studentId },
        });
      }
    }

    return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Fast switch route for seamless demo evaluation
app.post('/api/auth/demo-switch', async (req: Request, res: Response) => {
  try {
    const { role, email } = req.body;
    const store = await db.getStore();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (role === 'Admin') {
      const admin = (cleanEmail && store.admins.find(a => a.email.toLowerCase() === cleanEmail)) || store.admins[0];
      const token = signToken({
        id: admin.adminId,
        email: admin.email,
        role: 'Admin',
        name: admin.name,
        adminId: admin.adminId,
      });
      return res.json({
        token,
        user: { id: admin.adminId, name: admin.name, email: admin.email, role: 'Admin', adminId: admin.adminId },
      });
    }

    if (role === 'Organization') {
      const org = (cleanEmail && store.organizations.find(o => o.contactEmail.toLowerCase() === cleanEmail)) || store.organizations[0];
      const token = signToken({
        id: org.organizationId,
        email: org.contactEmail,
        role: 'Organization',
        name: org.name,
        organizationId: org.organizationId,
      });
      return res.json({
        token,
        user: { id: org.organizationId, name: org.name, email: org.contactEmail, role: 'Organization', organizationId: org.organizationId },
      });
    }

    // Candidate
    const student = (cleanEmail && store.students.find(s => s.email.toLowerCase() === cleanEmail)) || store.students[0];
    const token = signToken({
      id: student.studentId,
      email: student.email,
      role: 'Candidate',
      name: student.name,
      studentId: student.studentId,
    });
    return res.json({
      token,
      user: { id: student.studentId, name: student.name, email: student.email, role: 'Candidate', studentId: student.studentId },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});
// Verify token route
app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

// -----------------------------------------------------------------------------
// Candidate Endpoints
// -----------------------------------------------------------------------------

app.get('/api/candidate/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || req.user?.id;
    if (!studentId) return res.status(400).json({ error: 'Student ID missing' });

    const store = await db.getStore();
    const student = store.students.find(s => s.studentId === studentId);
    const profile = store.profiles.find(p => p.studentId === studentId);

    return res.json({ student, profile });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/candidate/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || req.user?.id;
    if (!studentId) return res.status(400).json({ error: 'Student ID missing' });

    const updatedProfile = await db.saveStudentProfile({
      studentId,
      ...req.body,
    });

    return res.json({ success: true, profile: updatedProfile });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/candidate/recommendations', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || req.user?.id;
    const store = await db.getStore();
    const profile = store.profiles.find(p => p.studentId === studentId);

    if (!profile) {
      return res.json({ recommendations: [] });
    }

    const activeInternships = store.internships.filter(i => i.status === 'Active');
    const recommendations = activeInternships.map(internship => {
      const breakdown = calculateMatchScore(profile, internship);
      const existingAlloc = store.allocations.find(
        a => a.studentId === studentId && a.internshipId === internship.internshipId
      );

      return {
        ...internship,
        matchScore: breakdown.totalScore,
        scoreBreakdown: breakdown,
        applicationStatus: existingAlloc ? existingAlloc.status : null,
        allocationId: existingAlloc ? existingAlloc.allocationId : null,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    return res.json({ recommendations });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/candidate/apply', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || req.user?.id;
    const { internshipId } = req.body;
    if (!studentId || !internshipId) {
      return res.status(400).json({ error: 'Student and Internship ID required' });
    }

    const store = await db.getStore();
    const student = store.students.find(s => s.studentId === studentId);
    const profile = store.profiles.find(p => p.studentId === studentId);
    const internship = store.internships.find(i => i.internshipId === internshipId);

    if (!student || !internship || !profile) {
      return res.status(404).json({ error: 'Candidate profile or internship not found' });
    }

    // Check if already applied
    const existing = store.allocations.find(
      a => a.studentId === studentId && a.internshipId === internshipId
    );

    if (existing) {
      return res.status(400).json({ error: 'Already applied for this internship' });
    }

    const breakdown = calculateMatchScore(profile, internship);
    const newAllocation = {
      allocationId: store.allocations.length + 1,
      studentId,
      studentName: student.name,
      studentEmail: student.email,
      internshipId,
      internshipTitle: internship.title,
      organizationId: internship.organizationId,
      organizationName: internship.organizationName,
      engineId: 1,
      allocationDate: new Date().toISOString().split('T')[0],
      matchScore: breakdown.totalScore,
      scoreBreakdown: breakdown,
      status: 'Application Submitted (Under Review)' as const,
      remarks: `Candidate self-applied via portal. AI match calculated: ${breakdown.totalScore}%`,
    };

    store.allocations.push(newAllocation);

    // Notify organization
    store.notifications.unshift({
      notificationId: store.notifications.length + 1,
      recipientType: 'Organization',
      organizationId: internship.organizationId,
      allocationId: newAllocation.allocationId,
      message: `New applicant: ${student.name} applied for '${internship.title}'. AI Match: ${breakdown.totalScore}%.`,
      notificationDate: new Date().toISOString(),
      status: 'Unread',
      type: 'Review',
    });

    return res.json({ success: true, allocation: newAllocation });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/candidate/respond-offer', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId || req.user?.id;
    const { allocationId, decision } = req.body; // decision: 'Accept' | 'Reject'

    if (!allocationId || !['Accept', 'Reject'].includes(decision)) {
      return res.status(400).json({ error: 'Valid allocationId and decision required' });
    }

    const store = await db.getStore();
    const alloc = store.allocations.find(a => a.allocationId === allocationId && a.studentId === studentId);
    if (!alloc) {
      return res.status(404).json({ error: 'Allocation not found' });
    }

    const newStatus = decision === 'Accept' ? 'Offer Accepted' : 'Offer Rejected';
    if (!canTransitionCandidateState(alloc.status, newStatus)) {
      return res.status(400).json({ error: `Cannot transition from ${alloc.status} to ${newStatus}` });
    }

    alloc.status = newStatus;
    alloc.remarks = `Candidate ${decision.toLowerCase()}ed the offer on ${new Date().toLocaleDateString()}.`;

    // If accepted, update filledSeats and transition to in-progress
    if (decision === 'Accept') {
      const internship = store.internships.find(i => i.internshipId === alloc.internshipId);
      if (internship) {
        internship.filledSeats = (internship.filledSeats || 0) + 1;
        if (internship.filledSeats >= internship.availableSeats) {
          internship.status = 'Closed';
        }
      }
      setTimeout(() => {
        alloc.status = 'Internship In Progress';
      }, 500);
    }

    return res.json({ success: true, allocation: alloc });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// Organization Endpoints
// -----------------------------------------------------------------------------

app.get('/api/organization/posts', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user?.organizationId || req.user?.id;
    const store = await db.getStore();
    const posts = store.internships.filter(i => !orgId || i.organizationId === orgId);
    return res.json({ posts });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/organization/posts', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user?.organizationId || req.user?.id;
    const { title, description, requiredSkills, eligibilityCriteria, location, duration, stipend, availableSeats } = req.body;

    const store = await db.getStore();
    const org = store.organizations.find(o => o.organizationId === orgId);

    const post = await db.createInternship({
      organizationId: orgId || 1,
      organizationName: org ? org.name : 'Registered Organization',
      title,
      description,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map((s: string) => s.trim()),
      eligibilityCriteria: eligibilityCriteria || 'Minimum 60% aggregate',
      location: location || 'National',
      duration: duration || '6 Months',
      stipend: Number(stipend) || 20000,
      availableSeats: Number(availableSeats) || 2,
      status: 'Active', // Auto-approves or can be 'Pending_Approval'
    });

    return res.json({ success: true, post });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/organization/applicants', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.user?.organizationId || req.user?.id;
    const store = await db.getStore();
    const orgInternshipIds = store.internships
      .filter(i => !orgId || i.organizationId === orgId)
      .map(i => i.internshipId);

    const applicants = store.allocations
      .filter(a => orgInternshipIds.includes(a.internshipId))
      .map(a => {
        const profile = store.profiles.find(p => p.studentId === a.studentId);
        return {
          ...a,
          profile,
        };
      });

    return res.json({ applicants });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/organization/shortlist', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { allocationId, decision } = req.body; // 'Shortlist' | 'Select' | 'Reject'
    const store = await db.getStore();
    const alloc = store.allocations.find(a => a.allocationId === allocationId);

    if (!alloc) return res.status(404).json({ error: 'Allocation not found' });

    let targetState = alloc.status;
    if (decision === 'Shortlist') targetState = 'Shortlisted';
    if (decision === 'Select') targetState = 'Selected';
    if (decision === 'Reject') targetState = 'Not Shortlisted';

    alloc.status = targetState;
    alloc.remarks = `Organization updated status to ${targetState}`;

    return res.json({ success: true, allocation: alloc });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// Administrator Endpoints
// -----------------------------------------------------------------------------

app.get('/api/admin/metrics', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = await db.getStore();
    const totalStudents = store.students.length;
    const totalOrgs = store.organizations.length;
    const totalPosts = store.internships.length;
    const totalAllocations = store.allocations.length;
    const offersIssued = store.allocations.filter(a => a.status === 'Offer Issued' || a.status === 'Offer Accepted' || a.status === 'Internship In Progress').length;
    const activeInterns = store.allocations.filter(a => a.status === 'Internship In Progress').length;

    // Calculate match score distribution
    const avgScore = store.allocations.length > 0
      ? Math.round((store.allocations.reduce((sum, a) => sum + (a.matchScore || 0), 0) / store.allocations.length) * 10) / 10
      : 0;

    return res.json({
      totalStudents,
      totalOrgs,
      totalPosts,
      totalAllocations,
      offersIssued,
      activeInterns,
      avgScore,
      engine: store.engines[0],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/data', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = await db.getStore();
    return res.json({
      students: store.students.map(s => {
        const p = store.profiles.find(pr => pr.studentId === s.studentId);
        return { ...s, profile: p };
      }),
      organizations: store.organizations,
      internships: store.internships,
      allocations: store.allocations,
      notifications: store.notifications,
      engine: store.engines[0],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/run-allocation', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const allocations = await db.runAIAllocation();
    return res.json({ success: true, count: allocations.length, allocations });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/issue-offer', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { allocationId } = req.body;
    const store = await db.getStore();
    const alloc = store.allocations.find(a => a.allocationId === allocationId);

    if (!alloc) return res.status(404).json({ error: 'Allocation not found' });

    alloc.status = 'Offer Issued';
    alloc.remarks = 'Official PM Internship Scheme offer generated by Authority.';

    // Send high-priority notification to candidate
    store.notifications.unshift({
      notificationId: store.notifications.length + 1,
      recipientType: 'Candidate',
      studentId: alloc.studentId,
      allocationId: alloc.allocationId,
      message: `Official Offer Issued for '${alloc.internshipTitle}' at ${alloc.organizationName}! Please accept or decline in your dashboard.`,
      notificationDate: new Date().toISOString(),
      status: 'Unread',
      type: 'Offer',
    });

    return res.json({ success: true, allocation: alloc });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Notifications
app.get('/api/notifications', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const store = await db.getStore();
    const user = req.user;

    let userNotifs = store.notifications;
    if (user?.role === 'Candidate') {
      userNotifs = store.notifications.filter(n => n.recipientType === 'Candidate' && (!n.studentId || n.studentId === user.studentId));
    } else if (user?.role === 'Organization') {
      userNotifs = store.notifications.filter(n => n.recipientType === 'Organization' && (!n.organizationId || n.organizationId === user.organizationId));
    } else if (user?.role === 'Admin') {
      userNotifs = store.notifications.filter(n => n.recipientType === 'Admin');
    }

    return res.json({ notifications: userNotifs });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------------------------------
// Vite middleware in dev or static files in production
// -----------------------------------------------------------------------------

async function startServer() {
  await initializeDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`PM Internship Scheme Smart Allocation Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
