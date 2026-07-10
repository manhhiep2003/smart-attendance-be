import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class ClassService {
  constructor(private prisma: PrismaService) {}

  async getMyClasses() {
    // Tạm thời lấy giảng viên đầu tiên trong DB để test (Thay thế bằng req.user.id sau khi có Auth)
    const mockTeacher = await this.prisma.user.findFirst({
      where: { role: Role.TEACHER },
    });

    if (!mockTeacher) {
      throw new NotFoundException(
        'Không tìm thấy giảng viên nào trong hệ thống. Hãy chạy file seed.',
      );
    }

    // Lấy danh sách lớp do giảng viên này dạy, kèm theo thông tin môn học và lịch học
    const classes = await this.prisma.class.findMany({
      where: { teacherId: mockTeacher.id },
      include: {
        course: true,
        schedules: true,
        semester: true,
      },
    });

    return classes;
  }
}
