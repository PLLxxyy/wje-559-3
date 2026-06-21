import { Module } from '@nestjs/common';
import { GridsController } from '../controllers/grids.controller';

@Module({ controllers: [GridsController] })
export class GridsRoutes {}
