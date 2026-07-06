import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { calculateDistance } from '../../common/utils/haversine';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async checkIn(
    studentId: string,
    sessionId: string,
    qrCodeToken: string,
    studentLat: number,
    studentLng: number,
  ) {
    // 1. Lấy thông tin phiên điểm danh
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Không tìm thấy phiên điểm danh');
    if (!session.isActive) throw new BadRequestException('Phiên điểm danh đã đóng');

    // 2. Chống gian lận 1: Đối chiếu mã QR và thời gian sống
    if (session.currentQrCode !== qrCodeToken) {
      throw new BadRequestException('Mã QR không hợp lệ hoặc đã cũ');
    }

    const timeDiffSeconds = (new Date().getTime() - session.qrUpdatedAt.getTime()) / 1000;
    if (timeDiffSeconds > 10) {
      // Nếu quét trễ quá 10 giây (chụp ảnh gửi cho bạn) -> Từ chối
      throw new BadRequestException(
        'Mã QR đã hết hạn. Vui lòng quét lại trên màn hình của giảng viên',
      );
    }

    // 3. Chống gian lận 2: Tính khoảng cách GPS
    const distance = calculateDistance(
      session.teacherLatitude,
      session.teacherLongitude,
      studentLat,
      studentLng,
    );

    if (distance > session.radius) {
      throw new BadRequestException(
        `Nghi vấn gian lận! Bạn đang cách phòng học ${distance}m (Giới hạn: ${session.radius}m)`,
      );
    }

    // 4. Tránh điểm danh trùng
    const existingRecord = await this.prisma.attendanceRecord.findUnique({
      where: {
        sessionId_studentId: { sessionId, studentId },
      },
    });

    if (existingRecord) {
      throw new BadRequestException('Bạn đã điểm danh thành công cho phiên này rồi');
    }

    // 5. Lưu kết quả thành công
    const record = await this.prisma.attendanceRecord.create({
      data: {
        sessionId,
        studentId,
        studentLatitude: studentLat,
        studentLongitude: studentLng,
        distance,
        status: 'PRESENT',
      },
    });

    return {
      success: true,
      message: 'Điểm danh thành công',
      distance: `${distance}m`,
      record,
    };
  }
}
