import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateHabitDto, UpdateHabitDto, RecordCompletionDto } from './dto/habit.dto.js';

@Injectable()
export class HabitService {
  constructor(private prisma: PrismaService) {}

  async createHabit(userId: string, dto: CreateHabitDto) {
    const { daysOfWeek, ...habitData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const habit = await tx.habit.create({
        data: {
          ...habitData,
          userId,
        },
      });

      if (daysOfWeek && daysOfWeek.length > 0) {
        await tx.habitSchedule.create({
          data: {
            habitId: habit.id,
            daysOfWeek,
          },
        });
      }

      return {
        success: true,
        message: 'Habit created successfully',
        data: habit,
      };
    });
  }

  async findAllUserHabits(userId: string) {
    const habits = await this.prisma.habit.findMany({
      where: { userId, isArchived: false },
      include: { schedule: true },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: habits };
  }

  async updateHabit(userId: string, habitId: string, dto: UpdateHabitDto) {
    const habit = await this.prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit || habit.userId !== userId) {
      throw new NotFoundException('Habit not found or unauthorized');
    }

    const { daysOfWeek, ...habitData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const updatedHabit = await tx.habit.update({
        where: { id: habitId },
        data: habitData,
      });

      if (daysOfWeek !== undefined) {
        await tx.habitSchedule.upsert({
          where: { habitId },
          update: { daysOfWeek },
          create: { habitId, daysOfWeek },
        });
      }

      return { success: true, message: 'Habit updated successfully', data: updatedHabit };
    });
  }

  async archiveHabit(userId: string, habitId: string) {
    const habit = await this.prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit || habit.userId !== userId) {
      throw new NotFoundException('Habit not found or unauthorized');
    }

    await this.prisma.habit.update({
      where: { id: habitId },
      data: { isArchived: true },
    });

    return { success: true, message: 'Habit archived successfully' };
  }

  async recordCompletion(userId: string, habitId: string, dto: RecordCompletionDto) {
    const habit = await this.prisma.habit.findUnique({ where: { id: habitId } });
    if (!habit || habit.userId !== userId) {
      throw new NotFoundException('Habit not found or unauthorized');
    }

    // Normalize date to UTC midnight to avoid timezone shifting issues
    const normalizedDate = new Date(dto.date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    // Upsert ensures idempotency: if a completion for this habit + date already exists, it updates it instead of duplicating
    const completion = await this.prisma.habitCompletion.upsert({
      where: {
        habitId_date: {
          habitId,
          date: normalizedDate,
        },
      },
      update: {
        status: dto.status,
        actualValue: dto.actualValue,
        notes: dto.notes,
      },
      create: {
        habitId,
        date: normalizedDate,
        status: dto.status,
        actualValue: dto.actualValue,
        notes: dto.notes,
      },
    });

    return {
      success: true,
      message: 'Habit completion recorded successfully',
      data: completion,
    };
  }
}