import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { TreeController } from './tree.controller';
import { TreeService } from './tree.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [TreeController],
  providers: [TreeService],
  exports: [TreeService],
})
export class TreeModule {}
