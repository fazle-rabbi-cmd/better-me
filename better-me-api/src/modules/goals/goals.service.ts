import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateGoalDto, UpdateGoalDto } from './dto/goal.dto.js';

@Injectable()
export class GoalService {
  constructor(private prisma: PrismaService) {}

  async createGoal(userId: string, dto: CreateGoalDto) {
    const goal = await this.prisma.goal.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      },
    });
    return { success: true, message: 'Goal created successfully', data: goal };
  }

  async findAllUserGoals(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: goals };
  }

  async updateGoal(userId: string, goalId: string, dto: UpdateGoalDto) {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found or unauthorized');
    }

    const updated = await this.prisma.goal.update({
      where: { id: goalId },
      data: {
        ...dto,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      },
    });

    return { success: true, message: 'Goal updated successfully', data: updated };
  }

  async deleteGoal(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Goal not found or unauthorized');
    }

    await this.prisma.goal.delete({ where: { id: goalId } });
    return { success: true, message: 'Goal deleted successfully' };
  }
}