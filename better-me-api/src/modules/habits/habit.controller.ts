import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { HabitService } from './habit.service.js';
import { CreateHabitDto, UpdateHabitDto, RecordCompletionDto } from './dto/habit.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  @Post()
  async createHabit(@CurrentUser() user: any, @Body() dto: CreateHabitDto) {
    return this.habitService.createHabit(user.sub, dto);
  }

  @Get()
  async getUserHabits(@CurrentUser() user: any) {
    return this.habitService.findAllUserHabits(user.sub);
  }

  @Patch(':id')
  async updateHabit(
    @CurrentUser() user: any,
    @Param('id') habitId: string,
    @Body() dto: UpdateHabitDto,
  ) {
    return this.habitService.updateHabit(user.sub, habitId, dto);
  }

  @Delete(':id')
  async archiveHabit(@CurrentUser() user: any, @Param('id') habitId: string) {
    return this.habitService.archiveHabit(user.sub, habitId);
  }

  @Post(':id/completions')
  async recordCompletion(
    @CurrentUser() user: any,
    @Param('id') habitId: string,
    @Body() dto: RecordCompletionDto,
  ) {
    return this.habitService.recordCompletion(user.sub, habitId, dto);
  }
}