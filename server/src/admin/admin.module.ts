import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AuditLog } from './audit-log.entity';
import { AuditLogService } from './audit-log.service';
import { PortfoliosModule } from '../portfolios/portfolios.module';
import { PhotographersModule } from '../photographers/photographers.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    PortfoliosModule,
    PhotographersModule,
    UsersModule,
    NotificationsModule,
    ReviewsModule,
  ],
  providers: [AuditLogService],
  controllers: [AdminController],
})
export class AdminModule {}
