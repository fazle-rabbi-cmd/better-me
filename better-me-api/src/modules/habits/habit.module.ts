import { Module } from '@nestjs/common';
import { HabitService } from './habit.service.js';
import { HabitController } from './habit.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [HabitController],
  providers: [HabitService],
})
export class HabitModule {}