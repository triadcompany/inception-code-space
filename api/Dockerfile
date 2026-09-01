# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies (including dev — we run via tsx, no compile step)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Uploads live on a mounted volume; keep a default target dir.
ENV UPLOAD_DIR=/data/uploads
RUN mkdir -p /data/uploads

EXPOSE 8080

# Apply pending migrations, then start the server.
CMD ["sh", "-c", "npm run db:migrate && npm run start"]
