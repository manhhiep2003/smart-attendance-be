import { Controller, Get } from '@nestjs/common';
import { ClassService } from 'src/modules/classes/class.service';

@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get('my-classes')
  async getMyClasses() {
    return this.classService.getMyClasses();
  }
}
