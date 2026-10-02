import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { GoalService } from './goals.service.js';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalController {
  constructor(private readonly goalService: GoalService) {}

  @Post()
  async createGoal(@CurrentUser() user: any, @Body() dto: CreateGoalDto) {
    return this.goalService.createGoal(user.sub, dto);
  }

  @Get()
  async getUserGoals(@CurrentUser() user: any) {
    return this.goalService.findAllUserGoals(user.sub);
  }

  @Patch(':id')
  async updateGoal(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateGoalDto) {
    return this.goalService.updateGoal(user.sub, id, dto);
  }

  @Delete(':id')
  async deleteGoal(@CurrentUser() user: any, @Param('id') id: string) {
    return this.goalService.deleteGoal(user.sub, id);
  }
}