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
    const mockStudentId = '08d1097e-4560-481f-bc3b-7f3201b6776c';

    return this.attendanceService.checkIn(
      mockStudentId,
      body.sessionId,
      body.qrCodeToken,
      body.studentLat,
      body.studentLng,
    );
  }
}
