import { Module } from '@nestjs/common';
import { RoutineService } from './routines.service.js';
import { RoutineController } from './routines.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  providers: [RoutineService],
  controllers: [RoutineController]
})
export class RoutinesModule {}
