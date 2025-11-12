import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Activer CORS pour permettre les requêtes depuis le front-end
  app.enableCors({
    origin: true, // Accepte toutes les origines en développement
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
