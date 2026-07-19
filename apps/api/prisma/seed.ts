import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, $Enums } from '../generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SUBJECTS = ['Math', 'Science', 'English', 'Arabic', 'History'];
const MONTHS_OF_HISTORY = 9;
const STUDENTS_PER_CLASS_RANGE: [number, number] = [20, 28];
const ANNOUNCEMENT_DATE_SPREAD_DAYS = 240;

/**
 * Each class section is deliberately biased up or down so the school page's
 * color-coded class links and the classes tab view show a real spread of
 * high/low performers, instead of near-identical bars. Cycles if there are
 * ever more class sections than entries here.
 */
const CLASS_PERFORMANCE_BIAS = [16, -4, 6, -18, 10, 2];

type TrendDirection = 'improving' | 'declining' | 'stable';
const TREND_SWING = 18;

/** A student's hidden generation profile — deliberately not persisted anywhere; it only drives realistic, non-uniform seed data. */
interface StudentProfile {
  baseSkill: number;
  subjectAptitude: Record<string, number>;
  trend: TrendDirection;
  attendanceReliability: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Sum of three uniform randoms approximates a bell curve — good enough for seed variety, no real stats library needed. */
function approxNormal(mean: number, spread: number): number {
  const u = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
  return mean + u * spread;
}

function pickTrend(): TrendDirection {
  const roll = Math.random();
  if (roll < 0.3) return 'improving';
  if (roll < 0.6) return 'declining';
  return 'stable';
}

function buildStudentProfile(classBias: number): StudentProfile {
  const baseSkill = clamp(72 + classBias + approxNormal(0, 13), 40, 98);
  const subjectAptitude: Record<string, number> = {};
  for (const subject of SUBJECTS) {
    subjectAptitude[subject] = approxNormal(0, 12);
  }
  const attendanceReliability = clamp(
    0.82 + classBias / 200 + approxNormal(0, 0.1),
    0.55,
    0.99,
  );
  return {
    baseSkill,
    subjectAptitude,
    trend: pickTrend(),
    attendanceReliability,
  };
}

function trendSlope(trend: TrendDirection): number {
  if (trend === 'improving') return 1;
  if (trend === 'declining') return -1;
  return 0;
}

function weightedAttendanceStatus(
  presentProbability: number,
): $Enums.AttendanceStatus {
  const roll = Math.random();
  if (roll < presentProbability) return 'PRESENT';
  const remainder = (roll - presentProbability) / (1 - presentProbability);
  if (remainder < 0.6) return 'ABSENT';
  if (remainder < 0.9) return 'LATE';
  return 'EXCUSED';
}

/** Month-start dates for the trailing `months` window, oldest to newest — mirrors the analytics module's own month bucketing so seeded data lines up with every trend/monthly-dropdown feature. */
function monthsInTrailingWindow(months: number): Date[] {
  const now = new Date();
  const result: Date[] = [];
  for (let i = months - 1; i >= 0; i--) {
    result.push(
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1)),
    );
  }
  return result;
}

function randomDateWithinMonth(monthStart: Date): Date {
  const year = monthStart.getUTCFullYear();
  const month = monthStart.getUTCMonth();
  const day = 1 + Math.floor(Math.random() * 27);
  return new Date(Date.UTC(year, month, day, 12));
}

function weekdaysInTrailingMonths(months: number): Date[] {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1),
  );
  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= now) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) days.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
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
      nameAr: 'مدرسة ريفرسايد الدولية',
      mission:
        'To nurture curious, confident learners through a balanced, inclusive education that prepares every student for lifelong success.',
      missionAr:
        'نسعى إلى رعاية متعلمين واثقين وشغوفين بالمعرفة من خلال تعليم متوازن وشامل يُعِدّ كل طالب للنجاح مدى الحياة.',
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
      nameAr: 'عز الدين دغيدي',
      role: 'Creator & Full-Stack Developer',
      roleAr: 'المُنشئ ومطوّر البرمجيات المتكامل',
      bio: "Frontend-focused developer specializing in Next.js, React, and TypeScript, with full MERN and NestJS/Prisma full-stack range. Built this application's entire frontend and backend — from pixel-perfect, accessible UI to a NestJS/Prisma API layer — applying SOLID principles and modern rendering strategies throughout.",
      bioAr:
        'مطوّر واجهات أمامية متخصص في Next.js وReact وTypeScript، ولديه خبرة متكاملة في مكدّس MERN وNestJS/Prisma. قام ببناء الواجهة الأمامية والخلفية لهذا التطبيق بالكامل — من تصميم واجهة مستخدم دقيقة وسهلة الوصول إلى طبقة API مبنية على NestJS وPrisma — مع تطبيق مبادئ SOLID واستراتيجيات العرض الحديثة في جميع الأنحاء.',
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

/** Small hand-written Arabic filler bank — the Arabic counterpart to faker.lorem for bodyAr. */
const ARABIC_FILLER_SENTENCES = [
  'تحرص إدارة المدرسة على إبقاء جميع الأسر على اطلاع دائم بآخر المستجدات.',
  'يُرجى من أولياء الأمور والطلاب مراجعة التفاصيل الكاملة عبر بوابة المدرسة الإلكترونية.',
  'ستكون فرق العمل المعنية متاحة للإجابة عن أي استفسارات خلال ساعات الدوام الرسمي.',
  'نشكر جميع أفراد المجتمع المدرسي على تعاونهم المستمر ودعمهم لهذه المبادرة.',
  'سيتم إرسال تحديثات إضافية فور توفر أي معلومات جديدة بهذا الخصوص.',
  'تلتزم المدرسة بأعلى معايير السلامة والجودة في تنظيم جميع أنشطتها وفعالياتها.',
  'يمكن التواصل مع مكتب الشؤون الطلابية لمزيد من التفاصيل أو للمساعدة في أي خطوة.',
  'نأمل أن يحظى هذا الإجراء برضا جميع الأطراف المعنية من الطلاب وأولياء الأمور والمعلمين.',
  'كالعادة، تضع المدرسة مصلحة الطلاب وسلامتهم في مقدمة أولوياتها عند اتخاذ أي قرار.',
  'سيتم تحديث هذا الإعلان في حال طرأ أي تغيير على التفاصيل المذكورة أعلاه.',
];

function arabicFillerParagraph(): string {
  const sentenceCount = 3 + Math.floor(Math.random() * 3);
  const sentences: string[] = [];
  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(
      ARABIC_FILLER_SENTENCES[
        Math.floor(Math.random() * ARABIC_FILLER_SENTENCES.length)
      ],
    );
  }
  return sentences.join(' ');
}

async function seedAnnouncements() {
  const categories = Object.values($Enums.AnnouncementCategory);
  const titlesByCategory: Record<string, { title: string; titleAr: string }[]> =
    {
      GENERAL: [
        {
          title: 'Library hours extended for exam season',
          titleAr: 'تمديد ساعات عمل المكتبة خلال موسم الاختبارات',
        },
        {
          title: 'New cafeteria menu now available',
          titleAr: 'قائمة طعام جديدة متاحة الآن في الكافتيريا',
        },
        {
          title: "School newsletter — this month's highlights",
          titleAr: 'نشرة المدرسة — أبرز أحداث هذا الشهر',
        },
        {
          title: 'Uniform policy reminder for winter term',
          titleAr: 'تذكير بسياسة الزي المدرسي لفصل الشتاء',
        },
        {
          title: 'New textbook list published for next term',
          titleAr: 'نشر قائمة الكتب الدراسية الجديدة للفصل القادم',
        },
        {
          title: 'Parent-teacher portal gets a fresh update',
          titleAr: 'تحديث جديد لبوابة أولياء الأمور والمعلمين',
        },
        {
          title: 'Bus route changes effective next Monday',
          titleAr: 'تغييرات في خطوط الحافلات اعتبارًا من الاثنين القادم',
        },
        {
          title: 'Library digitization project now complete',
          titleAr: 'اكتمال مشروع رقمنة المكتبة',
        },
        {
          title: 'Lost and found items to be donated next week',
          titleAr: 'التبرع بالمفقودات غير المُطالَب بها الأسبوع القادم',
        },
        {
          title: 'New student ambassadors program launching',
          titleAr: 'إطلاق برنامج جديد لسفراء الطلاب',
        },
        {
          title: 'Cafeteria introduces weekly vegetarian day',
          titleAr: 'الكافتيريا تُطلق يومًا نباتيًا أسبوعيًا',
        },
        {
          title: 'School supply drive for local shelters',
          titleAr: 'حملة لجمع المستلزمات المدرسية لدعم الملاجئ المحلية',
        },
      ],
      EVENT: [
        {
          title: 'Annual Science Fair — save the date',
          titleAr: 'معرض العلوم السنوي — احجز الموعد',
        },
        {
          title: 'Inter-school football tournament kicks off',
          titleAr: 'انطلاق بطولة كرة القدم بين المدارس',
        },
        {
          title: 'Spring concert rehearsals begin next week',
          titleAr: 'بدء بروفات حفل الربيع الموسيقي الأسبوع القادم',
        },
        {
          title: 'Career day guest speakers announced',
          titleAr: 'الإعلان عن ضيوف يوم المهن',
        },
        {
          title: 'Annual book fair opens in the main hall',
          titleAr: 'افتتاح معرض الكتاب السنوي في القاعة الرئيسية',
        },
        {
          title: 'Alumni reunion weekend details released',
          titleAr: 'الإعلان عن تفاصيل عطلة لقاء الخريجين',
        },
        {
          title: 'Talent show auditions open to all grades',
          titleAr: 'فتح باب التجارب لعرض المواهب أمام جميع الصفوف',
        },
        {
          title: 'Graduation ceremony rehearsal schedule posted',
          titleAr: 'نشر جدول بروفات حفل التخرج',
        },
        {
          title: 'Robotics club demo day open to parents',
          titleAr: 'يوم عرض نادي الروبوتات مفتوح لأولياء الأمور',
        },
        {
          title: 'International culture week kicks off Monday',
          titleAr: 'انطلاق أسبوع الثقافات الدولية يوم الاثنين',
        },
        {
          title: 'Art exhibition featuring student work this Friday',
          titleAr: 'معرض فني لأعمال الطلاب هذا الجمعة',
        },
        {
          title: 'Chess club regional tournament sign-ups open',
          titleAr: 'فتح التسجيل في بطولة الشطرنج الإقليمية لنادي الشطرنج',
        },
      ],
      EXAM: [
        {
          title: 'Mid-term exam schedule released',
          titleAr: 'الإعلان عن جدول اختبارات منتصف الفصل الدراسي',
        },
        {
          title: 'Final exam seating arrangements posted',
          titleAr: 'نشر ترتيبات الجلوس للاختبارات النهائية',
        },
        {
          title: 'Make-up exam registration now open',
          titleAr: 'فتح باب التسجيل لاختبارات الإعادة',
        },
        {
          title: 'Exam hall guidelines for students',
          titleAr: 'إرشادات قاعة الاختبار للطلاب',
        },
        {
          title: 'Updated resit policy for the spring term',
          titleAr: 'تحديث سياسة إعادة الاختبار لفصل الربيع',
        },
        {
          title: 'Online mock exams available this weekend',
          titleAr: 'اختبارات تجريبية إلكترونية متاحة نهاية هذا الأسبوع',
        },
        {
          title: 'Results publication date confirmed',
          titleAr: 'تأكيد موعد إعلان النتائج',
        },
        {
          title: 'Exam stress workshop for graduating students',
          titleAr: 'ورشة عمل للتعامل مع ضغط الاختبارات لطلاب التخرج',
        },
        {
          title: 'Calculator policy reminder for math finals',
          titleAr:
            'تذكير بسياسة استخدام الآلة الحاسبة في اختبارات الرياضيات النهائية',
        },
        {
          title: 'Extra revision sessions added before finals',
          titleAr: 'إضافة حصص مراجعة إضافية قبل الاختبارات النهائية',
        },
        {
          title: 'Exam accommodation requests due this Friday',
          titleAr: 'آخر موعد لطلبات التيسيرات الخاصة بالاختبارات هذا الجمعة',
        },
        {
          title: 'Practice papers now available in the portal',
          titleAr: 'أوراق تدريبية متاحة الآن على البوابة الإلكترونية',
        },
      ],
      HOLIDAY: [
        {
          title: 'School closed for national holiday',
          titleAr: 'إغلاق المدرسة بمناسبة العطلة الوطنية',
        },
        {
          title: 'Winter break schedule confirmed',
          titleAr: 'تأكيد جدول عطلة الشتاء',
        },
        {
          title: 'Half-day dismissal ahead of long weekend',
          titleAr: 'انصراف نصف يوم قبل عطلة نهاية الأسبوع الطويلة',
        },
        {
          title: 'Holiday homework packets available online',
          titleAr: 'حزم الواجبات المنزلية للعطلة متاحة إلكترونيًا',
        },
        {
          title: 'Religious holiday observance — campus closed',
          titleAr: 'مراعاة العطلة الدينية — إغلاق الحرم المدرسي',
        },
        {
          title: 'Teacher in-service day — no classes',
          titleAr: 'يوم تدريب للمعلمين — لا دراسة',
        },
        {
          title: 'Spring break dates confirmed for all grades',
          titleAr: 'تأكيد مواعيد عطلة الربيع لجميع الصفوف',
        },
        {
          title: 'National Day closure notice',
          titleAr: 'إشعار بالإغلاق بمناسبة اليوم الوطني',
        },
        {
          title: 'Eid holiday schedule and makeup days',
          titleAr: 'جدول عطلة العيد وأيام التعويض',
        },
        {
          title: 'Optional holiday enrichment camp registration open',
          titleAr: 'فتح التسجيل في المعسكر الإثرائي الاختياري خلال العطلة',
        },
        {
          title: 'Long weekend transport schedule change',
          titleAr: 'تغيير جدول النقل خلال عطلة نهاية الأسبوع الطويلة',
        },
        {
          title: 'End-of-term holiday assembly details',
          titleAr: 'تفاصيل طابور نهاية الفصل الدراسي قبل العطلة',
        },
      ],
      URGENT: [
        {
          title: 'Early dismissal today due to weather',
          titleAr: 'انصراف مبكر اليوم بسبب سوء الأحوال الجوية',
        },
        {
          title: 'Temporary road closure affects pickup/drop-off',
          titleAr: 'إغلاق مؤقت للطريق يؤثر على أوقات الاصطحاب والتوصيل',
        },
        {
          title: 'Immediate action needed: contact info update',
          titleAr: 'إجراء عاجل مطلوب: تحديث بيانات التواصل',
        },
        {
          title: 'Health advisory from the school nurse',
          titleAr: 'تنبيه صحي من ممرضة المدرسة',
        },
        {
          title: 'Scheduled power outage affecting afternoon classes',
          titleAr: 'انقطاع مجدول للكهرباء يؤثر على حصص فترة الظهيرة',
        },
        {
          title: 'Lockdown drill scheduled for this Thursday',
          titleAr: 'تدريب إغلاق أمني مقرر هذا الخميس',
        },
        {
          title: 'Allergy alert: please review the updated list',
          titleAr: 'تنبيه حساسية: يُرجى مراجعة القائمة المُحدَّثة',
        },
        {
          title: 'Local transport strike may affect commute times',
          titleAr: 'إضراب في المواصلات المحلية قد يؤثر على مواعيد التنقل',
        },
        {
          title: 'Seasonal flu advisory from the school clinic',
          titleAr: 'تنبيه من عيادة المدرسة بشأن إنفلونزا الموسم',
        },
        {
          title: 'Temporary Wi-Fi outage in the science building',
          titleAr: 'انقطاع مؤقت للإنترنت اللاسلكي في مبنى العلوم',
        },
        {
          title: 'Reminder: update emergency contact details today',
          titleAr: 'تذكير: يُرجى تحديث بيانات التواصل في حالات الطوارئ اليوم',
        },
        {
          title: 'Road works near the main gate this week',
          titleAr: 'أعمال طرق بالقرب من البوابة الرئيسية هذا الأسبوع',
        },
      ],
    };

  const rows = categories.flatMap((category) =>
    titlesByCategory[category].map(({ title, titleAr }) => ({
      id: randomUUID(),
      title,
      titleAr,
      body: faker.lorem.paragraphs({ min: 1, max: 2 }),
      bodyAr: arabicFillerParagraph(),
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

  const classes = gradeLevels.flatMap((grade, gradeIndex) =>
    sections.map((section, sectionIndex) => {
      const classIndex = gradeIndex * sections.length + sectionIndex;
      return {
        id: randomUUID(),
        name: `Grade ${grade}-${section}`,
        schoolId,
        performanceBias:
          CLASS_PERFORMANCE_BIAS[classIndex % CLASS_PERFORMANCE_BIAS.length],
      };
    }),
  );
  await prisma.class.createMany({
    data: classes.map(({ id, name, schoolId: classSchoolId }) => ({
      id,
      name,
      schoolId: classSchoolId,
    })),
  });

  const students: { id: string; classId: string; profile: StudentProfile }[] =
    [];
  for (const klass of classes) {
    const count = faker.number.int({
      min: STUDENTS_PER_CLASS_RANGE[0],
      max: STUDENTS_PER_CLASS_RANGE[1],
    });
    for (let i = 0; i < count; i++) {
      students.push({
        id: randomUUID(),
        classId: klass.id,
        profile: buildStudentProfile(klass.performanceBias),
      });
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

  const months = monthsInTrailingWindow(MONTHS_OF_HISTORY);
  const weekdays = weekdaysInTrailingMonths(MONTHS_OF_HISTORY);

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
    const { profile } = student;
    const slope = trendSlope(profile.trend);

    months.forEach((monthStart, monthIndex) => {
      const progress =
        MONTHS_OF_HISTORY > 1 ? monthIndex / (MONTHS_OF_HISTORY - 1) : 0;
      const trendDelta = slope * progress * TREND_SWING;

      for (const subject of SUBJECTS) {
        const score = clamp(
          Math.round(
            profile.baseSkill +
              profile.subjectAptitude[subject] +
              trendDelta +
              approxNormal(0, 6),
          ),
          40,
          100,
        );
        gradeRecords.push({
          studentId: student.id,
          subject,
          score,
          maxScore: 100,
          recordedAt: randomDateWithinMonth(monthStart),
        });
      }
    });

    for (const date of weekdays) {
      attendanceRecords.push({
        studentId: student.id,
        date,
        status: weightedAttendanceStatus(profile.attendanceReliability),
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
