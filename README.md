<div align="center">

# 🛡️ Portal de Siniestros MVP

**Plataforma full-stack de autoservicio para el reporte, seguimiento y gestión de siniestros de seguros.**

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-3178C6?style=flat-square&logo=typescript&logoColor=white)]()
[![License](https://img.shields.io/badge/Licencia-Propietaria-red?style=flat-square)]()
[![Status](https://img.shields.io/badge/Estado-En%20QA%20%7C%20Fase%203-yellow?style=flat-square)]()

</div>

---

## 📖 Sobre el Proyecto

**Portal de Siniestros MVP** es una plataforma diseñada para brindar visibilidad y trazabilidad de extremo a extremo durante el proceso de reporte y seguimiento de siniestros de seguros. Resuelve la incertidumbre del cliente y reduce la saturación operativa de los equipos de ajuste mediante autogestión 24/7, asignación inteligente de casos y carga guiada de evidencias documentales.

El sistema está construido como un **monorepo full-stack**, separando claramente la API (NestJS + Prisma + PostgreSQL) de la interfaz de usuario (React + Vite + Tailwind), y contempla tres roles operativos con flujos y vistas diferenciadas.

---

## ✨ Features Clave

| Feature | Descripción |
|---|---|
| 🏛️ **Arquitectura Multi-Rol** | Tres roles con vistas y permisos independientes: `ADMIN`, `AJUSTADOR` y `CLIENTE`, protegidos por rutas guardadas en el frontend y guards en la API. |
| 🎯 **Auto-asignación Inteligente** | Al reportarse un nuevo siniestro, el sistema asigna automáticamente el ajustador con menor carga activa de casos, sin intervención manual. |
| 📎 **Gestión y Preview de Evidencias** | Carga de documentos (pólizas, identificaciones, evidencias) vía `Multer`, con previsualización integrada y control de estatus (`PENDIENTE`, `APROBADO`, `RECHAZADO`) por documento. |
| 🔐 **Seguridad JWT + Bcrypt** | Autenticación stateless con JSON Web Tokens y contraseñas cifradas con `bcrypt`, validación de payloads con `class-validator` y `ValidationPipe` global. |
| 📊 **Dashboards por Rol** | Paneles interactivos con métricas y CRUD de usuarios (Admin), gestión de casos asignados (Ajustador) y trazabilidad del caso propio (Cliente). |
| 🕓 **Historial de Estatus** | Bitácora completa de cambios de estatus por siniestro, con usuario responsable y comentarios de auditoría. |

---

## 🧱 Stack Tecnológico

```
Frontend    → React 19 · Vite 8 · React Router 7 · Tailwind CSS 4 · Axios
Backend     → NestJS 11 · Prisma ORM 5 · Passport (JWT) · Bcrypt · Multer
Base Datos  → PostgreSQL 15 (contenedor Docker)
Infra       → Docker Compose · Node.js 18+
```

### 📂 Estructura del Repositorio

```
portal-siniestros-mvp/
├── backend/          # API NestJS — auth, siniestros, documentos, users, notificaciones
│   └── prisma/        # Esquema de base de datos y migraciones
├── frontend/         # SPA React — layouts, dashboards, componentes
├── docker-compose.yml # Definición del servicio de PostgreSQL
└── README.md
```

---

## 🚀 Instalación y Ejecución en Local

### Requisitos previos

- Node.js v18+
- npm
- Docker y Docker Compose

### 1. Clonar el repositorio y levantar la base de datos

```bash
git clone <url-del-repositorio>
cd portal-siniestros-mvp
docker compose up -d
```

Esto levanta un contenedor de **PostgreSQL 15** en el puerto `5432` (`siniestros_postgres`).

### 2. Backend (API — NestJS)

```bash
cd backend
npm install

# Configura tu archivo .env con la variable DATABASE_URL apuntando al contenedor,
# por ejemplo: postgresql://admin_inter:postgresAdmin@localhost:5432/siniestros_mvp

npx prisma migrate dev   # Aplica el esquema y genera el cliente de Prisma
npm run start:dev        # Levanta la API en modo watch
```

La API queda disponible en `http://localhost:3000`.

### 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

---

## 🗺️ Roadmap

- [x] **Fase 1** — Autenticación, esquema de base de datos, dashboards por rol.
- [x] **Fase 2** — Dashboards interactivos, CRUD de usuarios, carga de evidencias.
- [x] **Fase 2.1** — Auto-asignación de ajustadores, mejoras de registro y preview de documentos *(en QA)*.
- [ ] **Fase 3** — Sistema de notificaciones por correo electrónico.

---

## ✍️ Autoría y Créditos

<div align="center">

**El sistema completo — arquitectura, backend, frontend y base de datos — fue diseñado y desarrollado íntegramente por:**

### Ignacio Ivan Herrera Gomez

© 2026 Ignacio Ivan Herrera Gomez. Todos los derechos reservados.

Este es un proyecto de software propietario. Queda prohibida su reproducción, distribución o modificación, total o parcial, sin autorización previa y por escrito del autor.

</div>
