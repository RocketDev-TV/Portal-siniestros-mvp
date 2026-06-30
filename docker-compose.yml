version: '3.8'

services:
  postgres_db:
    image: postgres:15-alpine
    container_name: siniestros_postgres
    restart: always
    environment:
      POSTGRES_USER: admin_inter
      POSTGRES_PASSWORD: postgresAdmin
      POSTGRES_DB: siniestros_mvp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data: