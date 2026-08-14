# Multi-stage Dockerfile for MindEase Production Container

# --- STAGE 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# --- STAGE 2: Build Backend ---
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# --- STAGE 3: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy Backend production artifacts
COPY backend/package*.json ./
RUN npm ci --only=production
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /app/backend/prisma ./prisma

# Copy Frontend static build to serve or proxy
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 5000
CMD ["node", "dist/server.js"]
