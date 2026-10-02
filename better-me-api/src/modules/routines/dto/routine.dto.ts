import { IsString, IsOptional, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class RoutineItemDto {
  @IsString()
  habitId: string;

  @IsInt()
  orderIndex: number;
}

export class CreateRoutineDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  timeOfDay?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineItemDto)
  items: RoutineItemDto[];
}