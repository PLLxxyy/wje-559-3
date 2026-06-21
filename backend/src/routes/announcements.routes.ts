import { Module } from '@nestjs/common';
import { AnnouncementsController } from '../controllers/announcements.controller';

@Module({ controllers: [AnnouncementsController] })
export class AnnouncementsRoutes {}
