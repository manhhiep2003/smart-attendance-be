import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  // 1. Giảng viên bắt đầu phiên điểm danh
  async startSession(
    classId: string,
    scheduleId: string,
    lat: number,
    lng: number,
    radius: number,
  ) {
    const initialQr = uuidv4();

    // Tạm thời fix cứng expiresAt là 15 phút sau khi mở
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const session = await this.prisma.session.create({
      data: {
        classId,
        scheduleId,
        teacherLatitude: lat,
        teacherLongitude: lng,
        radius,
        currentQrCode: initialQr,
        isActive: true,
        expiresAt,
      },
    });

    return session;
  }

  // 2. Hàm này sẽ được Socket Gateway gọi mỗi 5s để cập nhật DB
  async rotateQrCode(sessionId: string) {
    const newQrCode = uuidv4();

    const session = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        currentQrCode: newQrCode,
        qrUpdatedAt: new Date(), // Cập nhật mốc thời gian để lát nữa check sinh viên quét có bị trễ không
      },
    });

    return session.currentQrCode;
  }

  // 3. Đóng phiên điểm danh
  async stopSession(sessionId: string) {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
  }

  async getSessionsByClass(classId: string) {
    return await this.prisma.session.findMany({
      where: { classId },
    });
  }
}
