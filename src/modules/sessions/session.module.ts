import { Module } from '@nestjs/common';
import { SessionController } from 'src/modules/sessions/session.controller';
import { SessionGateway } from 'src/modules/sessions/session.gateway';
import { SessionService } from 'src/modules/sessions/session.service';

@Module({
  controllers: [SessionController],
  providers: [SessionService, SessionGateway],
})
export class SessionModule {}
