# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app

# The server runs via tsx (no compile step) and migrations via drizzle-kit,
# both devDependencies — so install everything. NODE_ENV is set at runtime.
COPY package.json package-lock.json ./
RUN npm ci --include=dev

COPY . .

# Uploads live on a mounted volume; keep a default target dir.
ENV UPLOAD_DIR=/data/uploads
RUN mkdir -p /data/uploads

EXPOSE 8080

# Apply pending migrations, then start the server.
CMD ["sh", "-c", "npm run db:migrate && npm run start"]
