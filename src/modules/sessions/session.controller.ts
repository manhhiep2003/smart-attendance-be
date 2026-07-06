import { Controller, Post, Body, Param, Put, Get, Query } from '@nestjs/common';
import { SessionService } from 'src/modules/sessions/session.service';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  // POST /sessions/start
  // Dành cho giảng viên mở phiên
  @Post('start')
  async startSession(
    @Body() body: { classId: string; scheduleId: string; lat: number; lng: number; radius: number },
  ) {
    return this.sessionService.startSession(
      body.classId,
      body.scheduleId,
      body.lat,
      body.lng,
      body.radius || 50,
    );
  }

  // PUT /sessions/:id/stop
  // Dành cho giảng viên đóng phiên bằng tay
  @Put(':id/stop')
  async stopSession(@Param('id') id: string) {
    return this.sessionService.stopSession(id);
  }

  @Get()
  async getSessionsByClass(@Query('classId') classId: string) {
    return this.sessionService.getSessionsByClass(classId);
  }
}
