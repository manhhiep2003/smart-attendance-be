import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log('🌱 Seeding...');

  await prisma.attendanceRecord.deleteMany();
  await prisma.session.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.class.deleteMany();
  await prisma.course.deleteMany();
  await prisma.semester.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('123456', 10);

  // ==========================
  // Users
  // ==========================

  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: password,
      fullName: 'System Admin',
      role: Role.ADMIN,
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@example.com',
      passwordHash: password,
      fullName: 'Nguyen Van Teacher',
      role: Role.TEACHER,
    },
  });

  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'student1@example.com',
        passwordHash: password,
        fullName: 'Student One',
        role: Role.STUDENT,
      },
    }),

    prisma.user.create({
      data: {
        email: 'student2@example.com',
        passwordHash: password,
        fullName: 'Student Two',
        role: Role.STUDENT,
      },
    }),

    prisma.user.create({
      data: {
        email: 'student3@example.com',
        passwordHash: password,
        fullName: 'Student Three',
        role: Role.STUDENT,
      },
    }),
  ]);

  // ==========================
  // Semester
  // ==========================

  const semester = await prisma.semester.create({
    data: {
      name: 'Fall 2026',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-12-31'),
    },
  });

  // ==========================
  // Course
  // ==========================

  const webCourse = await prisma.course.create({
    data: {
      code: 'WEB301',
      name: 'Web Development',
      description: 'React + NestJS',
      credits: 3,
    },
  });

  // ==========================
  // Class
  // ==========================

  const classSeed = await prisma.class.create({
    data: {
      name: 'WEB301-01',
      courseId: webCourse.id,
      semesterId: semester.id,
      teacherId: teacher.id,
    },
  });

  // ==========================
  // Schedule
  // ==========================

  const schedule = await prisma.schedule.create({
    data: {
      classId: classSeed.id,
      dayOfWeek: 'Monday',
      startTime: '07:30',
      endTime: '09:30',
      roomName: 'A301',
    },
  });

  // ==========================
  // Enrollment
  // ==========================

  await prisma.enrollment.createMany({
    data: students.map((student) => ({
      studentId: student.id,
      classId: classSeed.id,
    })),
  });

  // ==========================
  // Session
  // ==========================

  await prisma.session.create({
    data: {
      classId: classSeed.id,
      scheduleId: schedule.id,
      currentQrCode: 'demo-qr-token',
      teacherLatitude: 10.776889,
      teacherLongitude: 106.700806,
      radius: 50,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  console.log('✅ Seed completed!');

  console.table([
    {
      Role: 'Admin',
      Email: 'admin@example.com',
      Password: '123456',
    },
    {
      Role: 'Teacher',
      Email: 'teacher@example.com',
      Password: '123456',
    },
    {
      Role: 'Student',
      Email: 'student1@example.com',
      Password: '123456',
    },
    {
      Role: 'Student',
      Email: 'student2@example.com',
      Password: '123456',
    },
    {
      Role: 'Student',
      Email: 'student3@example.com',
      Password: '123456',
    },
  ]);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
