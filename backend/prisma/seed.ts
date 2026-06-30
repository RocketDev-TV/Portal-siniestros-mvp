import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Admin123!', 10);

  // --- Usuarios ---
  const admin = await prisma.user.upsert({
    where: { email: 'admin@inter.mx' },
    update: {},
    create: { email: 'admin@inter.mx', password: hash, nombre: 'Administrador Maestro', rol: 'ADMIN' },
  });

  const ajustador = await prisma.user.upsert({
    where: { email: 'ajustador@inter.mx' },
    update: {},
    create: { email: 'ajustador@inter.mx', password: hash, nombre: 'Carlos Méndez', rol: 'AJUSTADOR' },
  });

  const cliente = await prisma.user.upsert({
    where: { email: 'cliente@inter.mx' },
    update: {},
    create: { email: 'cliente@inter.mx', password: hash, nombre: 'María García', rol: 'CLIENTE' },
  });

  console.log('Usuarios creados:', { admin: admin.email, ajustador: ajustador.email, cliente: cliente.email });

  // --- Siniestro 1: en revisión con historial ---
  const sin1 = await prisma.siniestro.upsert({
    where: { folio: 'SIN-2026-0001' },
    update: {},
    create: {
      folio: 'SIN-2026-0001',
      descripcion: 'Choque frontal en Av. Insurgentes Sur, daños en cofre y parabrisas.',
      estatus: 'EN_REVISION',
      clienteId: cliente.id,
      ajustadorId: ajustador.id,
      fechaFalla: new Date('2026-06-20'),
      historial: {
        create: [
          {
            estatusNuevo: 'REPORTADO',
            comentario: 'Siniestro registrado en el sistema',
            cambiadoPorId: admin.id,
            fechaCambio: new Date('2026-06-20T10:00:00Z'),
          },
          {
            estatusAnterior: 'REPORTADO',
            estatusNuevo: 'EN_REVISION',
            comentario: 'Ajustador asignado. Se agenda visita para el 23 de junio.',
            cambiadoPorId: ajustador.id,
            fechaCambio: new Date('2026-06-21T14:30:00Z'),
          },
        ],
      },
    },
  });

  // --- Siniestro 2: documentos pendientes ---
  const sin2 = await prisma.siniestro.upsert({
    where: { folio: 'SIN-2026-0002' },
    update: {},
    create: {
      folio: 'SIN-2026-0002',
      descripcion: 'Robo parcial de vehículo. Sustrajeron llantas y rines en estacionamiento.',
      estatus: 'DOCUMENTOS_PENDIENTES',
      clienteId: cliente.id,
      ajustadorId: ajustador.id,
      fechaFalla: new Date('2026-06-25'),
      historial: {
        create: [
          {
            estatusNuevo: 'REPORTADO',
            comentario: 'Siniestro registrado en el sistema',
            cambiadoPorId: admin.id,
            fechaCambio: new Date('2026-06-25T09:00:00Z'),
          },
          {
            estatusAnterior: 'REPORTADO',
            estatusNuevo: 'EN_REVISION',
            comentario: 'Iniciando revisión del caso.',
            cambiadoPorId: ajustador.id,
            fechaCambio: new Date('2026-06-25T16:00:00Z'),
          },
          {
            estatusAnterior: 'EN_REVISION',
            estatusNuevo: 'DOCUMENTOS_PENDIENTES',
            comentario: 'Se requiere: denuncia ante MP, factura del vehículo y fotos del lugar.',
            cambiadoPorId: ajustador.id,
            fechaCambio: new Date('2026-06-26T11:00:00Z'),
          },
        ],
      },
    },
  });

  console.log('Siniestros creados:', { folio1: sin1.folio, folio2: sin2.folio });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
