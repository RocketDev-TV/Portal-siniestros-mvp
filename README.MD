# 🛡️ Plataforma de Seguimiento de Siniestros - MVP

Un portal de autoservicio diseñado para brindar visibilidad y trazabilidad a los clientes de INTER.MX durante el proceso de reporte y seguimiento de siniestros. 

## 🎯 Objetivo del Proyecto
Resolver la incertidumbre del cliente y reducir la saturación operativa de los ejecutivos al permitir:
- Autogestión y disponibilidad 24/7.
- Visualización interactiva del estatus del siniestro.
- Carga guiada de documentos directamente en la plataforma.

## 🛠️ Stack Tecnológico
Este proyecto utiliza una arquitectura full-stack orientada al alto rendimiento y despliegue autogestionado:

* **Frontend:** React + Vite + Tailwind CSS
* **Backend:** NestJS + Prisma ORM (Node.js)
* **Base de Datos:** PostgreSQL
* **Infraestructura (Self-Hosted):** Entorno Linux (Debian) + Contenedores Docker + Exposición mediante túneles seguros.

## 📂 Estructura del Repositorio
El proyecto está dividido en dos directorios principales para separar las responsabilidades:

* `/frontend`: Contiene la aplicación cliente (Interfaz de usuario).
* `/backend`: Contiene la API, la lógica de negocio y la conexión a la base de datos.

## 🚀 Instalación y Desarrollo (Local)

### Requisitos previos
- Node.js (v18+)
- npm o yarn
- Docker y Docker Compose (para la base de datos)

### Iniciar el Backend
```bash
cd backend
npm install
npm run start:dev
```
### Iniciar el Frontend
```bash
cd frontend
npm install
npm run dev