import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { HabitModule } from './modules/habits/habit.module.js';
import { GoalsModule } from './modules/goals/goals.module.js';
import { RoutinesModule } from './modules/routines/routines.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    HabitModule,
    GoalsModule,
    RoutinesModule
  ],  

  controllers: [],
  providers: [],
})
export class AppModule {}