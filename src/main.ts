import { config } from 'dotenv';
config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Active tous les niveaux de logs
  });

  app.enableCors();

  // Servir les fichiers statiques depuis le dossier public
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
}
bootstrap().catch((err) => {
  Logger.error('Error during bootstrap', err);
  process.exit(1);
});
