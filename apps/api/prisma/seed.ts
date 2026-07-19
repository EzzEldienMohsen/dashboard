import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, $Enums } from '../generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SUBJECTS = ['Math', 'Science', 'English', 'Arabic', 'History'];
const ASSESSMENTS_PER_SUBJECT = 3;
const ATTENDANCE_DAYS = 60;
const STUDENTS_PER_CLASS_RANGE: [number, number] = [20, 25];
const ANNOUNCEMENT_DATE_SPREAD_DAYS = 240;

const ATTENDANCE_WEIGHTS: Array<[$Enums.AttendanceStatus, number]> = [
  ['PRESENT', 0.85],
  ['ABSENT', 0.08],
  ['LATE', 0.05],
  ['EXCUSED', 0.02],
];

function weightedAttendanceStatus(): $Enums.AttendanceStatus {
  const roll = Math.random();
  let cumulative = 0;
  for (const [status, weight] of ATTENDANCE_WEIGHTS) {
    cumulative += weight;
    if (roll <= cumulative) return status;
  }
  return 'PRESENT';
}

function pastWeekdays(count: number): Date[] {
  const dates: Date[] = [];
  const cursor = new Date();
  while (dates.length < count) {
    cursor.setDate(cursor.getDate() - 1);
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) dates.push(new Date(cursor));
  }
  return dates;
}

async function clearExistingData() {
  await prisma.attendanceRecord.deleteMany();
  await prisma.gradeRecord.deleteMany();
  await prisma.student.deleteMany();
  await prisma.class.deleteMany();
  await prisma.school.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.schoolProfile.deleteMany();
  await prisma.creator.deleteMany();
  await prisma.user.deleteMany();
}

async function seedSchoolProfile() {
  await prisma.schoolProfile.create({
    data: {
      name: 'Riverside International School',
      mission:
        'To nurture curious, confident learners through a balanced, inclusive education that prepares every student for lifelong success.',
      foundedYear: 1998,
      address: '42 Riverside Avenue, Springfield',
      contactEmail: 'info@riverside-school.example',
      contactPhone: '+1-555-0142',
    },
  });
}

async function seedCreator() {
  await prisma.creator.create({
    data: {
      name: 'Ezz Eldien Deghedy',
      role: 'Creator & Full-Stack Developer',
      bio: "Frontend-focused developer specializing in Next.js, React, and TypeScript, with full MERN and NestJS/Prisma full-stack range. Built this application's entire frontend and backend — from pixel-perfect, accessible UI to a NestJS/Prisma API layer — applying SOLID principles and modern rendering strategies throughout.",
      skills: [
        'React.js',
        'Next.js',
        'TypeScript',
        'Tailwind CSS',
        'NestJS',
        'Prisma',
        'PostgreSQL',
        'Redux Toolkit',
        'GraphQL',
        'Docker',
      ],
      email: 'ezzmohsend@gmail.com',
      githubUrl: 'https://github.com/EzzEldienMohsen',
      linkedinUrl: 'https://linkedin.com/in/ezz-eldeen-deghedy-a615321b6',
      portfolioUrl: 'https://ezz-portfolio.vercel.app',
    },
  });
}

async function seedAnnouncements() {
  const categories = Object.values($Enums.AnnouncementCategory);
  const titlesByCategory: Record<string, string[]> = {
    GENERAL: [
      'Library hours extended for exam season',
      'New cafeteria menu now available',
      "School newsletter — this month's highlights",
      'Uniform policy reminder for winter term',
      'New textbook list published for next term',
      'Parent-teacher portal gets a fresh update',
      'Bus route changes effective next Monday',
      'Library digitization project now complete',
      'Lost and found items to be donated next week',
      'New student ambassadors program launching',
      'Cafeteria introduces weekly vegetarian day',
      'School supply drive for local shelters',
    ],
    EVENT: [
      'Annual Science Fair — save the date',
      'Inter-school football tournament kicks off',
      'Spring concert rehearsals begin next week',
      'Career day guest speakers announced',
      'Annual book fair opens in the main hall',
      'Alumni reunion weekend details released',
      'Talent show auditions open to all grades',
      'Graduation ceremony rehearsal schedule posted',
      'Robotics club demo day open to parents',
      'International culture week kicks off Monday',
      'Art exhibition featuring student work this Friday',
      'Chess club regional tournament sign-ups open',
    ],
    EXAM: [
      'Mid-term exam schedule released',
      'Final exam seating arrangements posted',
      'Make-up exam registration now open',
      'Exam hall guidelines for students',
      'Updated resit policy for the spring term',
      'Online mock exams available this weekend',
      'Results publication date confirmed',
      'Exam stress workshop for graduating students',
      'Calculator policy reminder for math finals',
      'Extra revision sessions added before finals',
      'Exam accommodation requests due this Friday',
      'Practice papers now available in the portal',
    ],
    HOLIDAY: [
      'School closed for national holiday',
      'Winter break schedule confirmed',
      'Half-day dismissal ahead of long weekend',
      'Holiday homework packets available online',
      'Religious holiday observance — campus closed',
      'Teacher in-service day — no classes',
      'Spring break dates confirmed for all grades',
      'National Day closure notice',
      'Eid holiday schedule and makeup days',
      'Optional holiday enrichment camp registration open',
      'Long weekend transport schedule change',
      'End-of-term holiday assembly details',
    ],
    URGENT: [
      'Early dismissal today due to weather',
      'Temporary road closure affects pickup/drop-off',
      'Immediate action needed: contact info update',
      'Health advisory from the school nurse',
      'Scheduled power outage affecting afternoon classes',
      'Lockdown drill scheduled for this Thursday',
      'Allergy alert: please review the updated list',
      'Local transport strike may affect commute times',
      'Seasonal flu advisory from the school clinic',
      'Temporary Wi-Fi outage in the science building',
      'Reminder: update emergency contact details today',
      'Road works near the main gate this week',
    ],
  };

  const rows = categories.flatMap((category) =>
    titlesByCategory[category].map((title) => ({
      id: randomUUID(),
      title,
      body: faker.lorem.paragraphs({ min: 1, max: 2 }),
      category,
      publishedAt: faker.date.recent({ days: ANNOUNCEMENT_DATE_SPREAD_DAYS }),
    })),
  );

  await prisma.announcement.createMany({ data: rows });
}

async function seedUsers(schoolId: string) {
  const passwordHash = await bcrypt.hash('Password123!', 10);
  await prisma.user.createMany({
    data: [
      {
        id: randomUUID(),
        email: 'manager@schooldashboard.dev',
        passwordHash,
        role: 'MANAGER',
        name: 'Ava Manager',
        phone: '+1-555-0100',
        country: 'United States',
        schoolId,
      },
      {
        id: randomUUID(),
        email: 'teacher@schooldashboard.dev',
        passwordHash,
        role: 'TEACHER',
        name: 'Sam Teacher',
        phone: '+1-555-0101',
        country: 'United States',
        schoolId,
      },
    ],
  });
}

async function seedSchoolHierarchy() {
  const schoolId = randomUUID();
  await prisma.school.create({
    data: {
      id: schoolId,
      name: 'Riverside International School',
      address: '42 Riverside Avenue, Springfield',
    },
  });

  const gradeLevels = [4, 5, 6];
  const sections = ['A', 'B'];

  const classes = gradeLevels.flatMap((grade) =>
    sections.map((section) => ({
      id: randomUUID(),
      name: `Grade ${grade}-${section}`,
      schoolId,
    })),
  );
  await prisma.class.createMany({ data: classes });

  const students: { id: string; classId: string }[] = [];
  for (const klass of classes) {
    const count = faker.number.int({
      min: STUDENTS_PER_CLASS_RANGE[0],
      max: STUDENTS_PER_CLASS_RANGE[1],
    });
    for (let i = 0; i < count; i++) {
      students.push({ id: randomUUID(), classId: klass.id });
    }
  }

  await prisma.student.createMany({
    data: students.map((s) => ({
      id: s.id,
      classId: s.classId,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    })),
  });

  const weekdays = pastWeekdays(ATTENDANCE_DAYS);

  const gradeRecords: {
    studentId: string;
    subject: string;
    score: number;
    maxScore: number;
    recordedAt: Date;
  }[] = [];
  const attendanceRecords: {
    studentId: string;
    date: Date;
    status: $Enums.AttendanceStatus;
  }[] = [];

  for (const student of students) {
    for (const subject of SUBJECTS) {
      for (let a = 0; a < ASSESSMENTS_PER_SUBJECT; a++) {
        gradeRecords.push({
          studentId: student.id,
          subject,
          score: faker.number.int({ min: 55, max: 100 }),
          maxScore: 100,
          recordedAt: faker.date.recent({ days: 90 }),
        });
      }
    }
    for (const date of weekdays) {
      attendanceRecords.push({
        studentId: student.id,
        date,
        status: weightedAttendanceStatus(),
      });
    }
  }

  await prisma.gradeRecord.createMany({ data: gradeRecords });
  await prisma.attendanceRecord.createMany({ data: attendanceRecords });

  return {
    schoolId,
    classCount: classes.length,
    studentCount: students.length,
  };
}

async function main() {
  await clearExistingData();
  await seedSchoolProfile();
  await seedCreator();
  await seedAnnouncements();
  const { schoolId, classCount, studentCount } = await seedSchoolHierarchy();
  await seedUsers(schoolId);

  console.log(
    `Seeded 1 school, ${classCount} classes, ${studentCount} students.`,
  );
  console.log(
    'Demo logins: manager@schooldashboard.dev / teacher@schooldashboard.dev (password: Password123!)',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
