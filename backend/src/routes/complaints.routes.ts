import { Module } from '@nestjs/common';
import { ComplaintsController } from '../controllers/complaints.controller';

@Module({ controllers: [ComplaintsController] })
export class ComplaintsRoutes {}
