import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { EnergyModule } from './modules/energy/energy.module';
import { GoalsModule } from './modules/goals/goals.module';
import { PlansModule } from './modules/plans/plans.module';
import { TodosModule } from './modules/todos/todos.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    GoalsModule,
    PlansModule,
    TodosModule,
    EnergyModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
