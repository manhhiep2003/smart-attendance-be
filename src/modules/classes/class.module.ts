import { Module } from '@nestjs/common';
import { ClassController } from 'src/modules/classes/class.controller';
import { ClassService } from 'src/modules/classes/class.service';

@Module({
  controllers: [ClassController],
  providers: [ClassService],
})
export class ClassModule {}
