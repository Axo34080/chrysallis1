import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'], // Active tous les niveaux de logs
  });

  app.enableCors();

  const port = 3000;
  await app.listen(port);

  Logger.log(
    `Application is running on: http://localhost:${3000}`,
    'Bootstrap',
  );
}
bootstrap().catch((err) => {
  Logger.error('Error during bootstrap', err);
  process.exit(1);
});
