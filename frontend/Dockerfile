# frontend/Dockerfile

# Etapa 1: Construcción (Builder)
FROM node:20-alpine AS builder
WORKDIR /app

# Copiamos e instalamos dependencias
COPY package*.json ./
RUN npm install

# Copiamos el código fuente y compilamos para producción
COPY . .
RUN npm run build

# Etapa 2: Servidor Nginx
FROM nginx:alpine

# Copiamos los archivos compilados de Vite al directorio público de Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponemos el puerto 80 nativo de Nginx
EXPOSE 80

# Arrancamos Nginx
CMD ["nginx", "-g", "daemon off;"]