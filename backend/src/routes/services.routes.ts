import { Module } from '@nestjs/common';
import { ServicesController } from '../controllers/services.controller';

@Module({ controllers: [ServicesController] })
export class ServicesRoutes {}
