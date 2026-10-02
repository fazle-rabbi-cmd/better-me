import { Module } from '@nestjs/common';
import { GoalService } from './goals.service.js';
import { GoalController } from './goals.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  providers: [GoalService],
  controllers: [GoalController]
})
export class GoalsModule {}
