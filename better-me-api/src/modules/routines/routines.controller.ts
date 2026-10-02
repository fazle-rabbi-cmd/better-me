import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { RoutineService } from './routines.service.js';
import { CreateRoutineDto } from './dto/routine.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('routines')
export class RoutineController {
  constructor(private readonly routineService: RoutineService) {}

  @Post()
  async createRoutine(@CurrentUser() user: any, @Body() dto: CreateRoutineDto) {
    return this.routineService.createRoutine(user.sub, dto);
  }

  @Get()
  async getUserRoutines(@CurrentUser() user: any) {
    return this.routineService.findAllUserRoutines(user.sub);
  }

  @Delete(':id')
  async deleteRoutine(@CurrentUser() user: any, @Param('id') id: string) {
    return this.routineService.deleteRoutine(user.sub, id);
  }
}