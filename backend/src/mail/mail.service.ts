import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { EstatusSiniestro } from '@prisma/client';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendOtpEmail(to: string, nombre: string, code: string) {
    const html = `
      <div style="font-family: sans-serif; max-w: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
        <h2 style="color: #1e293b;">Hola, ${nombre}</h2>
        <p style="color: #475569;">Gracias por registrarte en el Portal de Siniestros. Tu código de verificación es:</p>
        <h1 style="font-size: 36px; letter-spacing: 5px; color: #4f46e5; text-align: center; background: #e0e7ff; padding: 15px; border-radius: 8px;">${code}</h1>
        <p style="color: #475569;">Ingresa este código en la plataforma para activar tu cuenta.</p>
      </div>
    `;
    try {
      await this.transporter.sendMail({
        from: `"Portal de Siniestros" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Verifica tu cuenta - Portal de Siniestros',
        html,
      });
      this.logger.log(`Correo OTP enviado a ${to}`);
    } catch (e) {
      this.logger.error(`Error enviando correo a ${to}`, e);
    }
  }

  async sendStatusUpdateEmail(
    to: string, 
    nombre: string, 
    folio: string, 
    estatus: EstatusSiniestro, 
    comentario?: string, 
    ajustador?: { nombre: string; email: string } | null
  ) {

    // 1. Armamos la firma solo con nombre y correo
    const firmaAjustador = ajustador ? `
      <div style="margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
        <p style="margin: 0; color: #64748b; font-size: 14px;">Atentamente,</p>
        <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 16px;"><strong>${ajustador.nombre}</strong></p>
        <p style="margin: 2px 0 0 0; font-size: 14px;"><a href="mailto:${ajustador.email}" style="color: #4f46e5; text-decoration: none;">${ajustador.email}</a></p>
        <p style="margin: 2px 0 0 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Ajustador Asignado</p>
      </div>
    ` : '';
    
    // 2. Construimos el HTML e INYECTAMOS la firma al final
    const html = `
      <div style="font-family: sans-serif; max-w: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #1e293b; margin-top: 0;">Hola, ${nombre}</h2>
        <p style="color: #475569; font-size: 15px;">Hay una actualización importante en tu siniestro <strong style="color: #1e293b;">${folio}</strong>.</p>
        <p style="color: #475569; font-size: 16px;">El nuevo estatus de tu caso es: <strong style="color: #4f46e5;">${estatus}</strong></p>
        
        ${comentario ? `<div style="background: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0; border-radius: 0 8px 8px 0;"><p style="margin:0; color: #334155; font-style: italic;">"${comentario}"</p></div>` : ''}
        
        <p style="color: #64748b; margin-top: 20px; font-size: 14px;">Ingresa al portal de Inter Seguros para ver el historial completo.</p>
        
        ${firmaAjustador}
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Portal de Siniestros" <${process.env.SMTP_USER}>`,
        to,
        subject: `Actualización de tu siniestro ${folio}`,
        html,
      });
      this.logger.log(`Correo de estatus enviado a ${to}`);
    } catch (e) {
      this.logger.error(`Error enviando correo de estatus a ${to}`, e);
    }
  }
}