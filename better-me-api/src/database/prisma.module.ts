import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global() // Makes PrismaService available application-wide without needing to re-import in every module
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}