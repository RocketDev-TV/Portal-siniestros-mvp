import { BadRequestException, Body, Controller, Param, Patch, Post, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Rol } from '@prisma/client';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UPLOADS_DIR, UPLOADS_PREFIX } from '../common/uploads.constant';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoEstatusDto } from './dto/update-documento-estatus.dto';
import { DocumentosService } from './documentos.service';

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

@UseGuards(JwtAuthGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIR,
        filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(new BadRequestException('Solo se permiten archivos PDF, JPG, PNG o WEBP'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  create(@UploadedFile() file: Express.Multer.File, @Body() dto: CreateDocumentoDto, @Request() req: any) {
    if (!file) throw new BadRequestException('Debes adjuntar un archivo');
    return this.documentosService.create(dto, `${UPLOADS_PREFIX}${file.filename}`, req.user);
  }

  @Patch(':id/estatus')
  @UseGuards(RolesGuard)
  @Roles(Rol.ADMIN, Rol.AJUSTADOR)
  updateEstatus(@Param('id') id: string, @Body() dto: UpdateDocumentoEstatusDto, @Request() req: any) {
    return this.documentosService.updateEstatus(id, dto, req.user);
  }
}
