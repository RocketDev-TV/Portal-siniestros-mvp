/**
 * Portal de Siniestros MVP — Punto de entrada del servidor (API)
 * ---------------------------------------------------------------
 * Autor:      Ignacio Ivan Herrera Gomez
 * Copyright:  © 2026 Ignacio Ivan Herrera Gomez. Todos los derechos reservados.
 * Licencia:   Software propietario. Queda prohibida la reproducción,
 *             distribución, comunicación pública o modificación total o
 *             parcial de este código sin autorización previa y por
 *             escrito del autor.
 * ---------------------------------------------------------------
 */
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { UPLOADS_DIR, UPLOADS_PREFIX } from './common/uploads.constant';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: 'http://localhost:5173' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useStaticAssets(UPLOADS_DIR, { prefix: UPLOADS_PREFIX });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
