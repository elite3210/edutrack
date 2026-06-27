# 11 — Plan de despliegue: EduTrack AI

> Guía paso a paso para llevar el sistema a producción en un VPS con Docker Compose y CI/CD automático desde GitHub. La rama `main` solo ejecuta tests. La rama `prod` despliega automáticamente si los tests pasan.

---

## Arquitectura de producción

```
Internet
    │
    ▼ HTTPS (puerto 443)
┌─────────────────────────────────────────────────┐
│                VPS Ubuntu 22.04                 │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │           Docker Compose                │   │
│  │                                         │   │
│  │  [nginx]──►[api FastAPI :8000]──►[db]  │   │
│  │     │                           Postgres│   │
│  │     └──►[frontend Vue3 estático]        │   │
│  │     └──►[volumen /evidencias]           │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘
    ▲
    │ SSH (GitHub Actions despliega aquí)
    │
GitHub Actions (CI/CD)
    ▲
    │ push a rama prod
    │
Repositorio GitHub
```

---

## Prerrequisitos antes de empezar

### Proveedor de VPS recomendado

Para un TG, **Hetzner** o **DigitalOcean** son suficientes:

| Proveedor | Plan | RAM | CPU | Disco | Precio |
|---|---|---|---|---|---|
| Hetzner | CX21 | 4 GB | 2 vCPU | 40 GB SSD | ~€4.5/mes |
| DigitalOcean | Basic Droplet | 2 GB | 1 vCPU | 50 GB SSD | ~$6/mes |
| AWS | t3.small EC2 | 2 GB | 2 vCPU | 20 GB EBS | ~$15/mes |

> El sistema completo (API + BD + frontend + pgvector) corre cómodo en 4 GB de RAM.

### Qué necesitas tener listo

- [ ] VPS creado con **Ubuntu 22.04 LTS**, acceso SSH como root con tu clave pública
- [ ] Un dominio comprado (ej. `edutrack.midominio.com`) o un subdominio apuntando a la IP del VPS
- [ ] DNS configurado: registro `A` apuntando la IP del VPS al dominio
- [ ] Repositorio del proyecto en GitHub con las ramas `main` y `prod`

---

## Fase 1 — Configuración inicial del VPS

> Conectarse al VPS: `ssh root@IP-DEL-SERVIDOR`  
> Solo se hace una vez.

### 1.1 Actualizar el sistema

```bash
apt update && apt upgrade -y
```

### 1.2 Crear usuario no-root para operar

```bash
# Crear usuario deploy (nunca operar como root en producción)
adduser deploy
usermod -aG sudo deploy

# Copiar tu clave SSH al nuevo usuario
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

A partir de aquí conectarse como: `ssh deploy@IP-DEL-SERVIDOR`

### 1.3 Configurar el firewall (UFW)

```bash
ufw allow OpenSSH       # puerto 22 — SSH
ufw allow 80/tcp        # HTTP — necesario para Let's Encrypt
ufw allow 443/tcp       # HTTPS — tráfico de la aplicación
ufw enable
ufw status
```

### 1.4 Instalar Docker y Docker Compose

```bash
# Instalar Docker
curl -fsSL https://get.docker.com | sh

# Agregar usuario deploy al grupo docker (no necesitar sudo)
usermod -aG docker deploy

# Verificar instalación
docker --version
docker compose version
```

> Cerrar y volver a conectar SSH para que el grupo `docker` tome efecto.

### 1.5 Crear directorio de evidencias

```bash
sudo mkdir -p /var/edutrack/evidencias
sudo chown -R deploy:deploy /var/edutrack/evidencias
```

### 1.6 Clonar el repositorio

```bash
cd /home/deploy
git clone https://github.com/TU-USUARIO/edutrack.git
cd edutrack
```

---

## Fase 2 — Archivos de configuración de producción

> Estos archivos se crean en el repositorio. Se usan únicamente en producción.

### 2.1 Variables de entorno — `backend/.env.production`

Crear en el VPS (nunca commitear):

```bash
nano /home/deploy/edutrack/backend/.env.production
```

Contenido:

```env
# Base de datos
DATABASE_URL=postgresql+asyncpg://edutrack:CONTRASEÑA_SEGURA@db:5432/edutrack

# JWT — generar con: python -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET_KEY=CLAVE_ALEATORIA_DE_64_CARACTERES
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Evidencias
EVIDENCIAS_BASE_PATH=/var/edutrack/evidencias
EVIDENCIAS_MAX_SIZE_MB=10

# Score
SCORE_WEIGHT_VIDA_UTIL=0.35
SCORE_WEIGHT_CUMPLIMIENTO=0.30
SCORE_WEIGHT_FRECUENCIA=0.20
SCORE_WEIGHT_RECENCIA=0.15
SCORE_THRESHOLD_ALERT=40

# OpenAI (RAG)
OPENAI_API_KEY=sk-...

# APScheduler
NIGHTLY_JOB_HOUR=2
NIGHTLY_JOB_MINUTE=0
NIGHTLY_JOB_TIMEZONE=America/Lima

# PostgreSQL (para el contenedor db)
POSTGRES_USER=edutrack
POSTGRES_PASSWORD=CONTRASEÑA_SEGURA
POSTGRES_DB=edutrack
```

### 2.2 Docker Compose de producción — `docker-compose.prod.yml`

Crear en la raíz del repositorio:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/certs:/etc/nginx/certs:ro
      - /var/edutrack/evidencias:/var/edutrack/evidencias:ro
      - certbot-www:/var/www/certbot:ro
    depends_on:
      - api
      - frontend
    restart: unless-stopped

  certbot:
    image: certbot/certbot
    volumes:
      - ./nginx/certs:/etc/letsencrypt
      - certbot-www:/var/www/certbot
    # Se ejecuta manualmente la primera vez, luego con cron

  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    env_file: ./backend/.env.production
    volumes:
      - /var/edutrack/evidencias:/var/edutrack/evidencias
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
    # Sin --reload en producción

  db:
    image: pgvector/pgvector:pg16
    env_file: ./backend/.env.production
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U edutrack"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: unless-stopped

volumes:
  pgdata:
  certbot-www:
```

### 2.3 Dockerfile de producción del frontend — `frontend/Dockerfile.prod`

```dockerfile
# Etapa 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: servir con nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Crear `frontend/nginx-frontend.conf`:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Vue Router — todas las rutas apuntan a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 2.4 Configuración de Nginx — `nginx/nginx.conf`

```nginx
worker_processes auto;

events {
    worker_connections 1024;
}

http {
    # Rate limiting para el endpoint público del QR
    limit_req_zone $binary_remote_addr zone=qr_limit:10m rate=10r/m;

    # Redirigir HTTP → HTTPS
    server {
        listen 80;
        server_name edutrack.midominio.com;

        # Solo para Let's Encrypt (verificación de dominio)
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    # Servidor HTTPS principal
    server {
        listen 443 ssl;
        server_name edutrack.midominio.com;

        ssl_certificate     /etc/nginx/certs/live/edutrack.midominio.com/fullchain.pem;
        ssl_certificate_key /etc/nginx/certs/live/edutrack.midominio.com/privkey.pem;
        ssl_protocols       TLSv1.2 TLSv1.3;
        ssl_ciphers         HIGH:!aNULL:!MD5;

        # ── API REST ────────────────────────────────────────────────────
        location /api/ {
            proxy_pass         http://api:8000;
            proxy_set_header   Host $host;
            proxy_set_header   X-Real-IP $remote_addr;
            proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header   X-Forwarded-Proto $scheme;
        }

        # Rate limiting solo en el endpoint de QR (acceso público)
        location /api/v1/qr/ {
            limit_req zone=qr_limit burst=5 nodelay;
            proxy_pass http://api:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # ── WebSockets ──────────────────────────────────────────────────
        location /ws/ {
            proxy_pass         http://api:8000;
            proxy_http_version 1.1;
            proxy_set_header   Upgrade $http_upgrade;
            proxy_set_header   Connection "upgrade";
            proxy_set_header   Host $host;
            proxy_read_timeout 3600s;   # mantener conexión abierta
        }

        # ── MCP ─────────────────────────────────────────────────────────
        location /mcp/ {
            proxy_pass       http://api:8000;
            proxy_set_header Host $host;
        }

        # ── Evidencias fotográficas (protegidas por JWT) ─────────────────
        location /evidencias/ {
            # Validar JWT antes de servir el archivo
            auth_request /auth/validate-evidencia;

            alias /var/edutrack/evidencias/;

            # Si auth_request falla → 401
            error_page 401 = @evidencia_no_autorizada;
        }

        location = /auth/validate-evidencia {
            internal;
            proxy_pass              http://api:8000/api/v1/auth/validate-file;
            proxy_pass_request_body off;
            proxy_set_header        Content-Length "";
            proxy_set_header        X-Original-URI $request_uri;
        }

        location @evidencia_no_autorizada {
            return 401 '{"detail": "No autorizado"}';
        }

        # ── Frontend Vue 3 PWA ───────────────────────────────────────────
        location / {
            proxy_pass http://frontend:80;
        }
    }
}
```

---

## Fase 3 — CI/CD con GitHub Actions

> Crear estos archivos en el repositorio. GitHub los ejecuta automáticamente.

### 3.1 Secrets de GitHub necesarios

Ir a: **GitHub → Repositorio → Settings → Secrets and variables → Actions**

Crear los siguientes secrets:

| Secret | Valor |
|---|---|
| `VPS_HOST` | IP del VPS (ej. `123.45.67.89`) |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | Contenido de la clave privada SSH (`~/.ssh/id_rsa`) |
| `VPS_PORT` | `22` |

> La clave pública ya está en el VPS (Fase 1.2). El secret `VPS_SSH_KEY` es la clave **privada** — solo GitHub Actions la ve.

### 3.2 Workflow CI — solo tests — `.github/workflows/ci.yml`

Se ejecuta en **todos los pushes y PRs a `main`**. Nunca despliega.

```yaml
name: CI — Tests y lint

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_USER: edutrack
          POSTGRES_PASSWORD: edutrack
          POSTGRES_DB: edutrack_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout código
        uses: actions/checkout@v4

      - name: Configurar Python 3.12
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Instalar dependencias
        working-directory: backend
        run: pip install -e .

      - name: Lint con ruff
        working-directory: backend
        run: ruff check .

      - name: Correr tests
        working-directory: backend
        env:
          DATABASE_URL: postgresql+asyncpg://edutrack:edutrack@localhost:5432/edutrack_test
          JWT_SECRET_KEY: clave-de-test-no-importa-el-valor
          JWT_ALGORITHM: HS256
          ACCESS_TOKEN_EXPIRE_MINUTES: 30
          REFRESH_TOKEN_EXPIRE_DAYS: 7
          EVIDENCIAS_BASE_PATH: /tmp/evidencias_test
          EVIDENCIAS_MAX_SIZE_MB: 10
          SCORE_WEIGHT_VIDA_UTIL: 0.35
          SCORE_WEIGHT_CUMPLIMIENTO: 0.30
          SCORE_WEIGHT_FRECUENCIA: 0.20
          SCORE_WEIGHT_RECENCIA: 0.15
          SCORE_THRESHOLD_ALERT: 40
          OPENAI_API_KEY: sk-test-mock
          NIGHTLY_JOB_HOUR: 2
          NIGHTLY_JOB_MINUTE: 0
          NIGHTLY_JOB_TIMEZONE: America/Lima
        run: pytest --cov=app --cov-report=term-missing
```

### 3.3 Workflow Deploy — `.github/workflows/deploy.yml`

Se ejecuta **solo en pushes a `prod`**. Primero corre los tests; si pasan, despliega.

```yaml
name: Deploy — Producción

on:
  push:
    branches: [prod]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_USER: edutrack
          POSTGRES_PASSWORD: edutrack
          POSTGRES_DB: edutrack_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Instalar dependencias
        working-directory: backend
        run: pip install -e .

      - name: Lint
        working-directory: backend
        run: ruff check .

      - name: Tests
        working-directory: backend
        env:
          DATABASE_URL: postgresql+asyncpg://edutrack:edutrack@localhost:5432/edutrack_test
          JWT_SECRET_KEY: clave-de-test-no-importa-el-valor
          JWT_ALGORITHM: HS256
          ACCESS_TOKEN_EXPIRE_MINUTES: 30
          REFRESH_TOKEN_EXPIRE_DAYS: 7
          EVIDENCIAS_BASE_PATH: /tmp/evidencias_test
          EVIDENCIAS_MAX_SIZE_MB: 10
          SCORE_WEIGHT_VIDA_UTIL: 0.35
          SCORE_WEIGHT_CUMPLIMIENTO: 0.30
          SCORE_WEIGHT_FRECUENCIA: 0.20
          SCORE_WEIGHT_RECENCIA: 0.15
          SCORE_THRESHOLD_ALERT: 40
          OPENAI_API_KEY: sk-test-mock
          NIGHTLY_JOB_HOUR: 2
          NIGHTLY_JOB_MINUTE: 0
          NIGHTLY_JOB_TIMEZONE: America/Lima
        run: pytest

  deploy:
    needs: test          # solo corre si el job test pasa
    runs-on: ubuntu-latest

    steps:
      - name: Desplegar en VPS vía SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT }}
          script: |
            cd /home/deploy/edutrack

            # Jalar últimos cambios de la rama prod
            git fetch origin prod
            git checkout prod
            git pull origin prod

            # Construir imágenes con el código nuevo
            docker compose -f docker-compose.prod.yml build api frontend

            # Levantar servicios (sin downtime en db y nginx)
            docker compose -f docker-compose.prod.yml up -d

            # Aplicar migraciones pendientes
            docker compose -f docker-compose.prod.yml exec -T api alembic upgrade head

            # Limpiar imágenes viejas
            docker image prune -f

            echo "✅ Deploy completado"
```

---

## Fase 4 — Primer despliegue (manual, una sola vez)

> Ejecutar estos pasos en el VPS la primera vez. Los deploys siguientes son automáticos.

### 4.1 Obtener certificado TLS con Let's Encrypt

```bash
cd /home/deploy/edutrack

# Levantar solo nginx en modo HTTP (para la verificación de dominio)
docker compose -f docker-compose.prod.yml up -d nginx

# Obtener el certificado (reemplazar con tu dominio y email)
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email tu@email.com \
  --agree-tos \
  --no-eff-email \
  -d edutrack.midominio.com
```

### 4.2 Levantar todos los servicios

```bash
docker compose -f docker-compose.prod.yml up -d
```

### 4.3 Aplicar migraciones y seed

```bash
# Crear tablas
docker compose -f docker-compose.prod.yml exec api alembic upgrade head

# Cargar datos iniciales
docker compose -f docker-compose.prod.yml exec api python -m scripts.seed
```

### 4.4 Verificar que todo funciona

```bash
# Ver estado de los contenedores
docker compose -f docker-compose.prod.yml ps

# Ver logs de la API
docker compose -f docker-compose.prod.yml logs api --tail=50

# Probar el healthcheck
curl https://edutrack.midominio.com/api/v1/health
# Esperado: {"status": "ok", "db": "ok"}
```

### 4.5 Renovación automática del certificado TLS

Los certificados de Let's Encrypt duran 90 días. Agregar cron para renovar automáticamente:

```bash
# Editar el crontab del usuario deploy
crontab -e

# Agregar esta línea (renueva cada lunes a las 3am si es necesario)
0 3 * * 1 cd /home/deploy/edutrack && docker compose -f docker-compose.prod.yml run --rm certbot renew && docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

---

## Fase 5 — Respaldos

> El sistema debe tener respaldo diario de la BD y las evidencias fotográficas.

### 5.1 Script de respaldo — `scripts/backup.sh`

```bash
#!/bin/bash
set -e

FECHA=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/deploy/backups"
mkdir -p "$BACKUP_DIR"

# Respaldo de PostgreSQL
docker compose -f /home/deploy/edutrack/docker-compose.prod.yml exec -T db \
  pg_dump -U edutrack edutrack | gzip > "$BACKUP_DIR/db_$FECHA.sql.gz"

# Respaldo de evidencias fotográficas
tar -czf "$BACKUP_DIR/evidencias_$FECHA.tar.gz" /var/edutrack/evidencias

# Eliminar respaldos de más de 30 días
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete

echo "✅ Respaldo completado: $FECHA"
```

```bash
chmod +x /home/deploy/edutrack/scripts/backup.sh
```

### 5.2 Programar respaldo diario

```bash
crontab -e

# Respaldo diario a las 2:30am (después del job nocturno de EduTrack)
30 2 * * * /home/deploy/edutrack/scripts/backup.sh >> /home/deploy/backups/backup.log 2>&1
```

---

## Flujo completo de trabajo del equipo

```
Día a día (desarrollo):
──────────────────────
git checkout main
git pull origin main
# ... desarrollar en feature/xxx ...
git push origin feature/xxx
# Abrir PR → main
# GitHub Actions corre tests automáticamente
# Si tests pasan → hacer merge a main
# Si tests fallan → corregir antes del merge

Cuando todo está listo para producción:
──────────────────────────────────────
git checkout prod
git merge main
git push origin prod
# GitHub Actions:
#   1. Corre ruff + pytest
#   2. Si pasan: SSH al VPS y despliega automáticamente
#   3. Si fallan: NO despliega, te avisa por email
# En ~2 minutos el sistema en producción está actualizado
```

---

## Comandos útiles en el VPS

```bash
# Ver estado de todos los contenedores
docker compose -f docker-compose.prod.yml ps

# Ver logs en tiempo real
docker compose -f docker-compose.prod.yml logs -f api

# Reiniciar solo la API (sin tocar la BD)
docker compose -f docker-compose.prod.yml restart api

# Conectarse a la BD directamente
docker compose -f docker-compose.prod.yml exec db psql -U edutrack

# Correr migraciones manualmente
docker compose -f docker-compose.prod.yml exec api alembic upgrade head

# Ver versión de migración activa
docker compose -f docker-compose.prod.yml exec api alembic current

# Hacer rollback de la última migración
docker compose -f docker-compose.prod.yml exec api alembic downgrade -1
```

---

## Checklist de primer despliegue

- [ ] VPS creado con Ubuntu 22.04, acceso SSH con clave pública
- [ ] DNS configurado: dominio apunta a la IP del VPS
- [ ] Fase 1 completada: usuario `deploy`, firewall, Docker instalado
- [ ] Directorio `/var/edutrack/evidencias` creado con permisos correctos
- [ ] Repositorio clonado en `/home/deploy/edutrack`
- [ ] `backend/.env.production` creado en el VPS con valores reales
- [ ] Secrets de GitHub configurados (VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_PORT)
- [ ] Archivos `docker-compose.prod.yml`, `nginx/nginx.conf`, `frontend/Dockerfile.prod` en el repositorio
- [ ] Workflows `.github/workflows/ci.yml` y `deploy.yml` en el repositorio
- [ ] Certificado TLS obtenido con Certbot
- [ ] `docker compose up -d` — todos los contenedores en estado `healthy`
- [ ] `alembic upgrade head` — migraciones aplicadas
- [ ] `python -m scripts.seed` — datos demo cargados
- [ ] `GET https://edutrack.midominio.com/api/v1/health` → `200 {"status":"ok","db":"ok"}`
- [ ] Cron de renovación TLS configurado
- [ ] Cron de respaldo diario configurado
- [ ] Push de prueba a `prod` → GitHub Actions despliega automáticamente
