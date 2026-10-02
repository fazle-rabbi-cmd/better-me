import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateRoutineDto } from './dto/routine.dto.js';

@Injectable()
export class RoutineService {
  constructor(private prisma: PrismaService) {}

  async createRoutine(userId: string, dto: CreateRoutineDto) {
    return this.prisma.$transaction(async (tx) => {
      const routine = await tx.routine.create({
        data: {
          userId,
          title: dto.title,
          description: dto.description,
          timeOfDay: dto.timeOfDay,
        },
      });

      if (dto.items && dto.items.length > 0) {
        await tx.routineItem.createMany({
          data: dto.items.map((item) => ({
            routineId: routine.id,
            habitId: item.habitId,
            orderIndex: item.orderIndex,
          })),
        });
      }

      const fullRoutine = await tx.routine.findUnique({
        where: { id: routine.id },
        include: { items: { include: { habit: true } } },
      });

      return { success: true, message: 'Routine created successfully', data: fullRoutine };
    });
  }

  async findAllUserRoutines(userId: string) {
    const routines = await this.prisma.routine.findMany({
      where: { userId },
      include: {
        items: {
          include: { habit: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: routines };
  }

  async deleteRoutine(userId: string, routineId: string) {
    const routine = await this.prisma.routine.findUnique({ where: { id: routineId } });
    if (!routine || routine.userId !== userId) {
      throw new NotFoundException('Routine not found or unauthorized');
    }

    await this.prisma.routine.delete({ where: { id: routineId } });
    return { success: true, message: 'Routine deleted successfully' };
  }
}