/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import {
  Student,
  StudentProfile,
  Organization,
  Internship,
  Allocation,
  Notification,
  AdminUser,
  AIMatchingEngine,
  CandidateState,
  OrganizationPostState,
} from '../src/types/schema';
import { calculateMatchScore } from '../src/utils/aiEngine';

export interface DBStore {
  students: (Student & { passwordHash: string })[];
  profiles: StudentProfile[];
  organizations: (Organization & { passwordHash: string })[];
  internships: Internship[];
  allocations: Allocation[];
  notifications: Notification[];
  admins: (AdminUser & { passwordHash: string })[];
  engines: AIMatchingEngine[];
}

let pool: Pool | null = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
}

// In-Memory Master Store initialized with rich seed data matching PM Internship Scheme
const memoryStore: DBStore = {
  students: [],
  profiles: [],
  organizations: [],
  internships: [],
  allocations: [],
  notifications: [],
  admins: [],
  engines: [
    {
      engineId: 1,
      algorithm: 'Weighted Multi-Criteria Skill & Vector Compatibility (WMC-SVC v2.4)',
      modelVersion: 'v2.4.0-prod',
      status: 'Active',
      weights: {
        skills: 0.4,
        location: 0.2,
        academics: 0.2,
        interests: 0.2,
      },
      lastUpdated: new Date().toISOString(),
    },
  ],
};

let isInitialized = false;

export async function initializeDatabase() {
  if (isInitialized) return;

  // Compliant passwords: >= 8 characters, 1 uppercase, 1 special character
  const defaultPassword = await bcrypt.hash('DemoPass@2026', 10);
  const adminPassword = await bcrypt.hash('AdminSecure#2026', 10);

  // 1. Seed 2 Admins (both @gmail.com)
  memoryStore.admins = [
    {
      adminId: 1,
      name: 'Dr. Rajiv Menon',
      email: 'admin.rajiv@gmail.com',
      role: 'PM Internship Authority',
      passwordHash: adminPassword,
    },
    {
      adminId: 2,
      name: 'Dr. Anita Sharma',
      email: 'admin.sharma@gmail.com',
      role: 'PM Internship Authority',
      passwordHash: adminPassword,
    },
  ];

  // 2. Seed 2 Organizations (both @gmail.com)
  memoryStore.organizations = [
    {
      organizationId: 1,
      name: 'Tata Consultancy Services',
      industry: 'IT & Consulting',
      location: 'New Delhi',
      contactPerson: 'Sanjay Deshmukh',
      contactEmail: 'tcs.recruitment@gmail.com',
      status: 'Active',
      isEmailVerified: true,
      passwordHash: defaultPassword,
    },
    {
      organizationId: 2,
      name: 'Infosys Innovation Labs',
      industry: 'Software & Cloud',
      location: 'Hyderabad',
      contactPerson: 'Kunal Kapoor',
      contactEmail: 'infosys.careers@gmail.com',
      status: 'Active',
      isEmailVerified: true,
      passwordHash: defaultPassword,
    },
    {
      organizationId: 3,
      name: 'Bharat Electronics Limited',
      industry: 'Defense & Hardware',
      location: 'Bengaluru',
      contactPerson: 'Meera Nair',
      contactEmail: 'bel.internships@gmail.com',
      status: 'Active',
      isEmailVerified: true,
      passwordHash: defaultPassword,
    },
    {
      organizationId: 4,
      name: 'Mahindra & Mahindra Ltd.',
      industry: 'Automotive & IoT',
      location: 'Pune',
      contactPerson: 'Aditi Joshi',
      contactEmail: 'mahindra.careers@gmail.com',
      status: 'Active',
      isEmailVerified: true,
      passwordHash: defaultPassword,
    },
  ];

  // 3. Seed Students & Profiles (all @gmail.com)
  memoryStore.students = [
    {
      studentId: 1,
      name: 'Aarav Kumar',
      email: 'aarav.intern@gmail.com',
      phone: '+91 98765 43210',
      dateOfBirth: '2003-05-14',
      isEmailVerified: true,
      passwordHash: defaultPassword,
    },
    {
      studentId: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@gmail.com',
      phone: '+91 98111 22334',
      dateOfBirth: '2002-11-20',
      isEmailVerified: true,
      passwordHash: defaultPassword,
    },
    {
      studentId: 3,
      name: 'Rohan Patel',
      email: 'rohan.patel@gmail.com',
      phone: '+91 97234 56789',
      dateOfBirth: '2003-02-18',
      isEmailVerified: true,
      passwordHash: defaultPassword,
    },
    {
      studentId: 4,
      name: 'Ananya Gupta',
      email: 'ananya.gupta@gmail.com',
      phone: '+91 99887 66554',
      dateOfBirth: '2002-08-30',
      isEmailVerified: true,
      passwordHash: defaultPassword,
    },
  ];

  memoryStore.profiles = [
    {
      profileId: 1,
      studentId: 1,
      education: 'B.Tech in Computer Science & Engineering',
      degree: 'B.Tech CSE',
      institution: 'Delhi Technological University (DTU)',
      percentage: 88.5,
      educationRecords: [
        {
          id: 'edu-1',
          degree: 'B.Tech CSE',
          institution: 'Delhi Technological University',
          yearOfPassing: 2025,
          percentage: 88.5,
        },
      ],
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Data Analysis', 'Docker'],
      skillRecords: [
        { id: 's1', name: 'Python', category: 'Programming', level: 'Advanced' },
        { id: 's2', name: 'Machine Learning', category: 'AI/Data', level: 'Advanced' },
        { id: 's3', name: 'TensorFlow', category: 'AI/Data', level: 'Intermediate' },
        { id: 's4', name: 'SQL', category: 'Database', level: 'Intermediate' },
      ],
      experience: 'Research project in NLP and Computer Vision with DRDO.',
      experienceRecords: [
        {
          id: 'exp-1',
          company: 'AI Research Lab',
          role: 'Student Researcher',
          startDate: '2024-05',
          endDate: '2024-08',
          description: 'Optimized transformer architectures for edge devices.',
        },
      ],
      interests: ['Artificial Intelligence', 'Data Science', 'Deep Learning'],
      locationPreference: 'New Delhi',
      resumePath: '/uploads/resumes/aarav_kumar_resume.pdf',
      profileScore: 92.5,
      status: 'Verified',
    },
    {
      profileId: 2,
      studentId: 2,
      education: 'B.Tech in Information Technology',
      degree: 'B.Tech IT',
      institution: 'NIT Karnataka, Surathkal',
      percentage: 91.2,
      educationRecords: [
        {
          id: 'edu-2',
          degree: 'B.Tech IT',
          institution: 'NIT Karnataka',
          yearOfPassing: 2025,
          percentage: 91.2,
        },
      ],
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'REST API'],
      skillRecords: [
        { id: 's5', name: 'React', category: 'Frontend', level: 'Advanced' },
        { id: 's6', name: 'TypeScript', category: 'Programming', level: 'Advanced' },
        { id: 's7', name: 'Node.js', category: 'Backend', level: 'Intermediate' },
        { id: 's8', name: 'PostgreSQL', category: 'Database', level: 'Intermediate' },
      ],
      experience: 'Full-stack development intern building scalable microservices.',
      experienceRecords: [
        {
          id: 'exp-2',
          company: 'OpenTech Solutions',
          role: 'Frontend Developer Intern',
          startDate: '2024-06',
          endDate: '2024-09',
        },
      ],
      interests: ['Full Stack Web Development', 'Cloud Computing'],
      locationPreference: 'Bengaluru',
      resumePath: '/uploads/resumes/priya_sharma_resume.pdf',
      profileScore: 95.0,
      status: 'Verified',
    },
    {
      profileId: 3,
      studentId: 3,
      education: 'B.E. in Mechanical & Mechatronics',
      degree: 'B.E. Mechatronics',
      institution: 'COEP Technological University, Pune',
      percentage: 84.0,
      educationRecords: [
        {
          id: 'edu-3',
          degree: 'B.E. Mechatronics',
          institution: 'COEP Pune',
          yearOfPassing: 2025,
          percentage: 84.0,
        },
      ],
      skills: ['IoT', 'Embedded Systems', 'Robotics', 'Python', 'CAD', 'Arduino'],
      skillRecords: [
        { id: 's9', name: 'IoT', category: 'Hardware/IoT', level: 'Advanced' },
        { id: 's10', name: 'Embedded Systems', category: 'Hardware/IoT', level: 'Intermediate' },
        { id: 's11', name: 'Python', category: 'Programming', level: 'Intermediate' },
      ],
      experience: 'Designed automated robotic arm for factory packaging line.',
      experienceRecords: [],
      interests: ['Smart Manufacturing', 'Robotics', 'Automotive'],
      locationPreference: 'Pune',
      resumePath: '/uploads/resumes/rohan_patel_resume.pdf',
      profileScore: 86.0,
      status: 'Verified',
    },
    {
      profileId: 4,
      studentId: 4,
      education: 'B.Sc in Statistics & Economics',
      degree: 'B.Sc Statistics',
      institution: 'St. Xavier\'s College, Mumbai',
      percentage: 87.0,
      educationRecords: [
        {
          id: 'edu-4',
          degree: 'B.Sc Statistics',
          institution: 'St. Xavier\'s College',
          yearOfPassing: 2025,
          percentage: 87.0,
        },
      ],
      skills: ['Data Analysis', 'Excel', 'Python', 'Tableau', 'SQL', 'Financial Modeling'],
      skillRecords: [
        { id: 's12', name: 'Data Analysis', category: 'Data', level: 'Advanced' },
        { id: 's13', name: 'Excel', category: 'Tools', level: 'Advanced' },
        { id: 's14', name: 'Tableau', category: 'Visualization', level: 'Intermediate' },
      ],
      experience: 'Financial analytics student associate.',
      experienceRecords: [],
      interests: ['Public Policy', 'Data Science', 'Analytics'],
      locationPreference: 'New Delhi',
      resumePath: '/uploads/resumes/ananya_gupta_resume.pdf',
      profileScore: 88.0,
      status: 'Verified',
    },
  ];

  // 4. Seed Internships
  memoryStore.internships = [
    {
      internshipId: 1,
      organizationId: 1,
      organizationName: 'Tata Consultancy Services',
      title: 'AI & Machine Learning Research Intern',
      description: 'Join the national innovation initiative focusing on generative AI, NLP, and decision support algorithms.',
      requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
      eligibilityCriteria: 'B.Tech/BE in CS/IT/AI with minimum 60% aggregate. Passion for foundational models.',
      location: 'New Delhi',
      duration: '6 Months',
      stipend: 25000,
      availableSeats: 5,
      filledSeats: 1,
      status: 'Active',
      createdAt: '2026-01-10',
    },
    {
      internshipId: 2,
      organizationId: 3,
      organizationName: 'Infosys Innovation Labs',
      title: 'Cloud Native Full Stack Developer',
      description: 'Develop responsive, cloud-first citizen portals and microservices architectures using modern web tech.',
      requiredSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      eligibilityCriteria: 'B.Tech / MCA / B.Sc Computer Science with minimum 65% aggregate.',
      location: 'Bengaluru',
      duration: '6 Months',
      stipend: 24000,
      availableSeats: 4,
      filledSeats: 1,
      status: 'Active',
      createdAt: '2026-01-12',
    },
    {
      internshipId: 3,
      organizationId: 4,
      organizationName: 'Mahindra & Mahindra Ltd.',
      title: 'Smart Manufacturing & IoT Systems Trainee',
      description: 'Work with automated shop floors, edge IoT sensors, predictive maintenance telematics, and robotics.',
      requiredSkills: ['IoT', 'Embedded Systems', 'Robotics', 'Python'],
      eligibilityCriteria: 'Degree in Mechanical, Mechatronics, or Electrical Engineering.',
      location: 'Pune',
      duration: '6 Months',
      stipend: 22000,
      availableSeats: 3,
      filledSeats: 0,
      status: 'Active',
      createdAt: '2026-01-15',
    },
    {
      internshipId: 4,
      organizationId: 2,
      organizationName: 'Bharat Electronics Limited',
      title: 'Defense Electronics & Sensor Firmware Intern',
      description: 'Develop low-power embedded software, radar sensor processing modules, and RTOS device drivers.',
      requiredSkills: ['Embedded Systems', 'C/C++', 'Microcontrollers', 'IoT'],
      eligibilityCriteria: 'B.Tech/B.E in Electronics & Communication or Instrumentation.',
      location: 'Bengaluru',
      duration: '6 Months',
      stipend: 23000,
      availableSeats: 3,
      filledSeats: 0,
      status: 'Active',
      createdAt: '2026-01-18',
    },
  ];

  // 5. Seed Allocations & Applications
  const aaravBreakdown = calculateMatchScore(memoryStore.profiles[0], memoryStore.internships[0]);
  const priyaBreakdown = calculateMatchScore(memoryStore.profiles[1], memoryStore.internships[1]);

  memoryStore.allocations = [
    {
      allocationId: 1,
      studentId: 1,
      studentName: 'Aarav Kumar',
      studentEmail: 'aarav.kumar@gmail.com',
      internshipId: 1,
      internshipTitle: 'AI & Machine Learning Research Intern',
      organizationId: 1,
      organizationName: 'Tata Consultancy Services',
      engineId: 1,
      allocationDate: '2026-02-01',
      matchScore: aaravBreakdown.totalScore,
      scoreBreakdown: aaravBreakdown,
      status: 'Offer Issued',
      remarks: 'Top ranked candidate by WMC-SVC AI Allocation Engine. Academic and skill match verified.',
      feedback: 'Excellent foundational knowledge in neural networks.',
    },
    {
      allocationId: 2,
      studentId: 2,
      studentName: 'Priya Sharma',
      studentEmail: 'priya.sharma@gmail.com',
      internshipId: 2,
      internshipTitle: 'Cloud Native Full Stack Developer',
      organizationId: 3,
      organizationName: 'Infosys Innovation Labs',
      engineId: 1,
      allocationDate: '2026-02-02',
      matchScore: priyaBreakdown.totalScore,
      scoreBreakdown: priyaBreakdown,
      status: 'Internship In Progress',
      remarks: 'Candidate accepted offer. Onboarded to Phase 1 Sprint.',
      feedback: 'Strong performance on full-stack code pairing.',
    },
    {
      allocationId: 3,
      studentId: 3,
      studentName: 'Rohan Patel',
      studentEmail: 'rohan.patel@gmail.com',
      internshipId: 3,
      internshipTitle: 'Smart Manufacturing & IoT Systems Trainee',
      organizationId: 4,
      organizationName: 'Mahindra & Mahindra Ltd.',
      engineId: 1,
      allocationDate: '2026-02-03',
      matchScore: 88.0,
      status: 'Shortlisted',
      remarks: 'Shortlisted following AI ranking run. Technical review in progress.',
    },
    {
      allocationId: 4,
      studentId: 4,
      studentName: 'Ananya Gupta',
      studentEmail: 'ananya.gupta@gmail.com',
      internshipId: 1,
      internshipTitle: 'AI & Machine Learning Research Intern',
      organizationId: 1,
      organizationName: 'Tata Consultancy Services',
      engineId: 1,
      allocationDate: '2026-02-04',
      matchScore: 72.5,
      status: 'Application Submitted (Under Review)',
      remarks: 'Profile submitted, awaiting batch AI reallocation run.',
    },
  ];

  // 6. Seed Notifications
  memoryStore.notifications = [
    {
      notificationId: 1,
      recipientType: 'Candidate',
      studentId: 1,
      allocationId: 1,
      message: 'Congratulations! Official Offer Issued for AI & Machine Learning Research Intern at Tata Consultancy Services under PM Internship Scheme.',
      notificationDate: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: 'Unread',
      type: 'Offer',
    },
    {
      notificationId: 2,
      recipientType: 'Candidate',
      studentId: 2,
      allocationId: 2,
      message: 'Your internship at Infosys Innovation Labs has commenced. Status: Internship In Progress.',
      notificationDate: new Date(Date.now() - 3600000 * 24).toISOString(),
      status: 'Read',
      type: 'Status_Update',
    },
    {
      notificationId: 3,
      recipientType: 'Organization',
      organizationId: 1,
      message: 'New batch allocation completed by PM Internship Authority: 1 candidate matched with AI Research position.',
      notificationDate: new Date(Date.now() - 3600000 * 5).toISOString(),
      status: 'Unread',
      type: 'Review',
    },
    {
      notificationId: 4,
      recipientType: 'Admin',
      message: 'AI Matching Engine v2.4 executed successfully across 4 candidates and 4 internship listings.',
      notificationDate: new Date(Date.now() - 3600000 * 12).toISOString(),
      status: 'Read',
      type: 'System',
    },
  ];

  isInitialized = true;
}

// Database helper functions exposed to server routes
export const db = {
  async getStore(): Promise<DBStore> {
    await initializeDatabase();
    return memoryStore;
  },

  async findStudentByEmail(email: string) {
    await initializeDatabase();
    const clean = (email || '').trim().toLowerCase();
    if (clean === 'aarav.kumar@gmail.com') {
      return memoryStore.students.find(s => s.studentId === 1);
    }
    return memoryStore.students.find(s => s.email.toLowerCase() === clean);
  },

  async findOrganizationByEmail(email: string) {
    await initializeDatabase();
    const clean = (email || '').trim().toLowerCase();
    if (clean === 'hr@tcs.com') {
      return memoryStore.organizations.find(o => o.organizationId === 1);
    }
    if (clean === 'talent@infosys.com') {
      return memoryStore.organizations.find(o => o.organizationId === 2);
    }
    return memoryStore.organizations.find(o => o.contactEmail.toLowerCase() === clean);
  },

  async findAdminByEmail(email: string) {
    await initializeDatabase();
    const clean = (email || '').trim().toLowerCase();
    if (clean === 'admin@pm-internship.gov.in') {
      return memoryStore.admins[0];
    }
    return memoryStore.admins.find(a => a.email.toLowerCase() === clean);
  },

  async getStudentProfile(studentId: number) {
    await initializeDatabase();
    return memoryStore.profiles.find(p => p.studentId === studentId);
  },

  async saveStudentProfile(profileData: Partial<StudentProfile> & { studentId: number }) {
    await initializeDatabase();
    const idx = memoryStore.profiles.findIndex(p => p.studentId === profileData.studentId);
    if (idx >= 0) {
      memoryStore.profiles[idx] = { ...memoryStore.profiles[idx], ...profileData };
      return memoryStore.profiles[idx];
    } else {
      const newProfile: StudentProfile = {
        profileId: memoryStore.profiles.length + 1,
        studentId: profileData.studentId,
        education: profileData.education || '',
        educationRecords: profileData.educationRecords || [],
        skills: profileData.skills || [],
        skillRecords: profileData.skillRecords || [],
        experience: profileData.experience || '',
        experienceRecords: profileData.experienceRecords || [],
        interests: profileData.interests || [],
        locationPreference: profileData.locationPreference || '',
        resumePath: profileData.resumePath || '',
        profileScore: profileData.profileScore || 70,
        status: 'Profile Created',
        degree: profileData.degree,
        institution: profileData.institution,
        percentage: profileData.percentage || 75,
      };
      memoryStore.profiles.push(newProfile);
      return newProfile;
    }
  },

  async createInternship(post: Omit<Internship, 'internshipId' | 'createdAt' | 'filledSeats'>) {
    await initializeDatabase();
    const newInternship: Internship = {
      ...post,
      internshipId: memoryStore.internships.length + 1,
      filledSeats: 0,
      createdAt: new Date().toISOString(),
    };
    memoryStore.internships.push(newInternship);
    return newInternship;
  },

  async updateInternship(id: number, updates: Partial<Internship>) {
    await initializeDatabase();
    const idx = memoryStore.internships.findIndex(i => i.internshipId === id);
    if (idx >= 0) {
      memoryStore.internships[idx] = { ...memoryStore.internships[idx], ...updates };
      return memoryStore.internships[idx];
    }
    return null;
  },

  async updateAllocationStatus(allocationId: number, status: CandidateState, remarks?: string) {
    await initializeDatabase();
    const alloc = memoryStore.allocations.find(a => a.allocationId === allocationId);
    if (alloc) {
      alloc.status = status;
      if (remarks) alloc.remarks = remarks;

      // Add corresponding notification to student
      memoryStore.notifications.unshift({
        notificationId: memoryStore.notifications.length + 1,
        recipientType: 'Candidate',
        studentId: alloc.studentId,
        allocationId: alloc.allocationId,
        message: `Your application status for '${alloc.internshipTitle}' updated to: ${status}.`,
        notificationDate: new Date().toISOString(),
        status: 'Unread',
        type: status.includes('Offer') ? 'Offer' : 'Status_Update',
      });

      return alloc;
    }
    return null;
  },

  async runAIAllocation() {
    await initializeDatabase();
    const newAllocations: Allocation[] = [];

    // For every active internship and candidate profile that doesn't already have an allocation
    for (const internship of memoryStore.internships.filter(i => i.status === 'Active')) {
      for (const profile of memoryStore.profiles) {
        const student = memoryStore.students.find(s => s.studentId === profile.studentId);
        if (!student) continue;

        // Check if allocation already exists
        const exists = memoryStore.allocations.find(
          a => a.studentId === profile.studentId && a.internshipId === internship.internshipId
        );

        const breakdown = calculateMatchScore(profile, internship);

        if (!exists) {
          const allocation: Allocation = {
            allocationId: memoryStore.allocations.length + newAllocations.length + 1,
            studentId: profile.studentId,
            studentName: student.name,
            studentEmail: student.email,
            internshipId: internship.internshipId,
            internshipTitle: internship.title,
            organizationId: internship.organizationId,
            organizationName: internship.organizationName,
            engineId: 1,
            allocationDate: new Date().toISOString().split('T')[0],
            matchScore: breakdown.totalScore,
            scoreBreakdown: breakdown,
            status: breakdown.totalScore >= 80 ? 'Shortlisted' : 'Application Submitted (Under Review)',
            remarks: `Ranked with score ${breakdown.totalScore}% by AI Allocation Engine. ${breakdown.fitExplanation}`,
          };
          newAllocations.push(allocation);
        } else {
          // Update score and breakdown
          exists.matchScore = breakdown.totalScore;
          exists.scoreBreakdown = breakdown;
        }
      }
    }

    memoryStore.allocations.push(...newAllocations);

    // Notify Administrator and Organizations
    memoryStore.notifications.unshift({
      notificationId: memoryStore.notifications.length + 1,
      recipientType: 'Admin',
      message: `AI Smart Allocation Engine run executed: Generated/updated ${newAllocations.length} candidate allocations across active postings.`,
      notificationDate: new Date().toISOString(),
      status: 'Unread',
      type: 'System',
    });

    return memoryStore.allocations;
  },
};
