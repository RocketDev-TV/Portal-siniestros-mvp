import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SiniestrosModule } from './siniestros/siniestros.module';
import { DocumentosModule } from './documentos/documentos.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, SiniestrosModule, DocumentosModule, NotificacionesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
