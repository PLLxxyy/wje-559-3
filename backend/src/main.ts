import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { appConfig } from './config/app.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: appConfig().corsOrigin });
  const config = new DocumentBuilder().setTitle('CommunityGov API').setDescription('社区治理与便民服务平台后端 API').setVersion('1.0').addBearerAuth().build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  await app.listen(appConfig().port);
}

void bootstrap();
