import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './controllers/health.controller';
import { databaseConfig, ENTITIES } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { AnnouncementsController } from './controllers/announcements.controller';
import { AuthController } from './controllers/auth.controller';
import { ComplaintsController } from './controllers/complaints.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { GridsController } from './controllers/grids.controller';
import { ServicesController } from './controllers/services.controller';
import { AnnouncementsService } from './services/announcements.service';
import { AuditService } from './services/audit.service';
import { AuthService } from './services/auth.service';
import { ComplaintsService } from './services/complaints.service';
import { DashboardService } from './services/dashboard.service';
import { GridsService } from './services/grids.service';
import { NotificationService } from './services/notification.service';
import { SeedService } from './services/seed.service';
import { ServicesService } from './services/services.service';
import { AuditMiddleware } from './middlewares/audit.middleware';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { ErrorHandlerMiddleware } from './middlewares/error-handler.middleware';
import { RateLimitMiddleware } from './middlewares/rate-limit.middleware';
import { RoleMiddleware } from './middlewares/role.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig()),
    TypeOrmModule.forFeature(ENTITIES),
    JwtModule.register({ secret: jwtConfig().secret }),
  ],
  providers: [
    AuthService,
    ComplaintsService,
    ServicesService,
    AnnouncementsService,
    GridsService,
    DashboardService,
    AuditService,
    NotificationService,
    SeedService,
    { provide: APP_GUARD, useClass: RateLimitMiddleware },
    { provide: APP_GUARD, useClass: AuthMiddleware },
    { provide: APP_GUARD, useClass: RoleMiddleware },
    { provide: APP_INTERCEPTOR, useClass: AuditMiddleware },
    { provide: APP_FILTER, useClass: ErrorHandlerMiddleware },
  ],
  controllers: [
    HealthController,
    AuthController,
    ComplaintsController,
    ServicesController,
    AnnouncementsController,
    GridsController,
    DashboardController,
  ],
})
export class AppModule {}
