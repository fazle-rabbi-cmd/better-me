import { IsString, IsEnum, IsOptional, IsNumber, IsArray, IsInt, Min } from 'class-validator';
import { HabitType, FrequencyType, CompletionStatus } from '@prisma/client';

export class CreateHabitDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(HabitType)
  type: HabitType;

  @IsEnum(FrequencyType)
  frequency: FrequencyType;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  targetValue?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  daysOfWeek?: number[]; // [0, 1, 2, 3, 4, 5, 6] for Sunday to Saturday
}

export class UpdateHabitDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(HabitType)
  type?: HabitType;

  @IsOptional()
  @IsEnum(FrequencyType)
  frequency?: FrequencyType;

  @IsOptional()
  @IsNumber()
  targetValue?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  daysOfWeek?: number[];
}

export class RecordCompletionDto {
  @IsString()
  date: string; // ISO date string (YYYY-MM-DD)

  @IsEnum(CompletionStatus)
  status: CompletionStatus;

  @IsOptional()
  @IsNumber()
  actualValue?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}