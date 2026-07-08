import { Controller, Post, Body } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  async checkIn(
    @Body()
    body: {
      sessionId: string;
      qrCodeToken: string;
      studentLat: number;
      studentLng: number;
    },
  ) {
    // Tạm thời hardcode studentId để test. Khi có JWT Auth thì lấy từ @Request() req -> req.user.id
    const mockStudentId = '64d9419e-e456-4979-8231-edc196e7dbbd';

    return this.attendanceService.checkIn(
      mockStudentId,
      body.sessionId,
      body.qrCodeToken,
      body.studentLat,
      body.studentLng,
    );
  }
}
